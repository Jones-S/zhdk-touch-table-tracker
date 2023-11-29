/* eslint-disable no-undef */

const WebSocket = require('ws')
const osc = require('osc')
const math = require('mathjs')
require('dotenv').config()

let currentConfiguration = null

function radiansToDegrees(radians) {
  return (radians * 180) / Math.PI
}

function mapPoint(x, y, invMatrix) {
  const pointMatrix = [x, y, 1]
  const resultMatrix = math.multiply(pointMatrix, invMatrix)
  const point = {
    x: resultMatrix[0] / resultMatrix[2],
    y: resultMatrix[1] / resultMatrix[2]
  }
  return point
}

function updateConfiguration(newConfiguration) {
  currentConfiguration = newConfiguration
}

function startServers(configuration) {
  currentConfiguration = configuration
  let websocket = false
  let trackerCollection = []
  let firstMessageReceived = false

  console.log('Starting websocket server... with config: ', currentConfiguration)

  const wss = new WebSocket.Server({ port: 6050 })
  // const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT })

  // if we have problems with broken connections:
  // https://github.com/websockets/ws#how-to-detect-and-close-broken-connections

  // for every new connection
  wss.on('connection', (ws) => {
    websocket = ws
    // for newly connected clients we send them the current file as a welcoming present
    ws.send(
      `Hello, you are now connected to the websocket on port ${process.env.WEBSOCKET_PORT}! 🧦. The configuration in use is: ${currentConfiguration}`
    )

    ws.on('message', (message) => {
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          const messageAsString = message.toString() // otherwise we receive a cryptic Buffer
          client.send(messageAsString)
        }
      })
    })
  })

  wss.on('error', (e) => {
    console.log('error: ', e)
  })

  // Create an OSC Server and bind it to port 3333
  const udpPort = new osc.UDPPort({
    localAddress: '127.0.0.1',
    localPort: 3333 // default port by reacTIVision
  })

  // Listen for incoming OSC messages
  udpPort.on('message', function (oscMessage) {
    // Pass the message on to the websocket server
    // which argument is what?:
    // https://www.tuio.org/?specification
    if (oscMessage.address === '/tuio/2Dobj') {
      if (oscMessage.args[0] === 'source' && oscMessage.args[1] === 'reacTIVision') {
        firstMessageReceived = true
      } else if (oscMessage.args[0] === 'set') {
        let args
        if (currentConfiguration) {
          console.log('currentConfiguration?.invertXAxis: ', currentConfiguration?.invertXAxis)

          const mappedPoint = mapPoint(
            oscMessage.args[3],
            oscMessage.args[4],
            currentConfiguration.matrix
          )

          args = {
            sessionId: oscMessage.args[1],
            id: oscMessage.args[2],
            x: oscMessage.args[3],
            y: oscMessage.args[4],
            relativeX: mappedPoint.x,
            relativeY: mappedPoint.y,
            rotation: 360 - radiansToDegrees(oscMessage.args[5])
          }

          if (currentConfiguration?.invertXAxis) {
            // console.log('invert x axis: ', args.relativeX, 1 - args.relativeX)
            args.relativeX = 1 - args.relativeX
          }

          if (currentConfiguration?.invertYAxis) {
            args.relativeY = 1 - args.relativeY
          }

          args.translated = true
          console.log('x: ', oscMessage.args[3], ' translates to: ', args.relativeX)
        } else {
          args = {
            sessionId: oscMessage.args[1],
            id: oscMessage.args[2],
            x: 0,
            y: 0,
            relativeX: 0,
            relativeY: 0,
            rotation: 0
          }
        }

        if (websocket) {
          websocket.send(
            JSON.stringify({
              type: '/tracker/update',
              args,
              configuration: currentConfiguration
            })
          )
        }
      } else if (oscMessage.args[0] === 'alive') {
        const newTrackerCollection = []
        let i = 1 // start with second because first argument is 'alive', 'set' and so on
        while (oscMessage.args[i] && typeof oscMessage.args[i] === 'number') {
          newTrackerCollection.push(oscMessage.args[i])
          i++
        }

        // compare newTrackerCollection with old collection
        const addedSessionIds = newTrackerCollection.filter((id) => !trackerCollection.includes(id))
        const removedSessionIds = trackerCollection.filter(
          (id) => !newTrackerCollection.includes(id)
        )

        if (websocket) {
          addedSessionIds.forEach((id) => {
            websocket.send(
              JSON.stringify({
                type: '/tracker/add',
                args: {
                  sessionId: id
                }
              })
            )
          })

          removedSessionIds.forEach((id) => {
            websocket.send(
              JSON.stringify({
                type: '/tracker/remove',
                args: {
                  sessionId: id
                }
              })
            )
          })
        }

        trackerCollection = newTrackerCollection.map((tracker) => tracker)
      }
    }
  })

  // Start the OSC Server
  udpPort.open()

  // Handle errors
  udpPort.on('error', function (error) {
    console.error('Error:', error)
  })

  // Gracefully close the server on process exit
  process.on('SIGINT', function () {
    console.log('Closing OSC server')
    udpPort.close()
    process.exit()
  })

  setTimeout(() => {
    if (!firstMessageReceived && websocket) {
      websocket.send(
        JSON.stringify({
          type: '/tracker/error',
          args: {
            message: 'reacTIVision not running?'
          }
        })
      )
    }
  }, 2500)
}

module.exports = {
  startServers,
  updateConfiguration
}
