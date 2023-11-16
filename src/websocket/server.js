/* eslint-disable no-undef */

const WebSocket = require('ws')
const osc = require('osc')
require('dotenv').config()

function startServers() {
  console.log('Starting websocket server...')

  const wss = new WebSocket.Server({ port: 6050 })
  // const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT })

  // if we have problems with broken connections:
  // https://github.com/websockets/ws#how-to-detect-and-close-broken-connections

  // for every new connection
  wss.on('connection', (ws) => {
    // for newly connected clients we send them the current file as a welcoming present
    ws.send(
      `Hello, you are now connected to the websocket on port ${process.env.WEBSOCKET_PORT}! 🧦`
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

  /*
   * Receives OSC messages from reacTIVision:
   * Received OSC message: { address: '/tuio/2Dobj', args: [ 'fseq', 1256 ] }
   * Received OSC message: { address: '/tuio/2Dobj', args: [ 'source', 'reacTIVision' ] }
   * Received OSC message: { address: '/tuio/2Dobj', args: [ 'alive', 15, 18 ] } // 15 and 18 are session IDs
   * Received OSC message: {
   *   address: '/tuio/2Dobj',
   *   args: [
   *     'set',
   *     15, // Session ID
   *     9, // Marker ID
   *     0.3118833899497986,
   *     0.7241698503494263,
   *     4.835385322570801,
   *     -0.054025646299123764,
   *     0.07203420251607895,
   *     0,
   *     2.196164608001709,
   *     0
   *   ]
   * }
   * Received OSC message: {
   *   address: '/tuio/2Dobj',
   *   args: [
   *     'set',
   *     18,
   *     2,
   *     0.4322606921195984,
   *     0.7163752913475037,
   *     1.8319129943847656,
   *     0,
   *     0,
   *     0,
   *     -1.1738723516464233,
   *     0
   *   ]
   * } */

  // Create an OSC Server and bind it to port 3333
  const udpPort = new osc.UDPPort({
    localAddress: '127.0.0.1',
    localPort: 3333 // default port by reacTIVision
  })

  // Listen for incoming OSC messages
  udpPort.on('message', function (oscMessage) {
    console.log('Received OSC message:', oscMessage)
    // Pass the message on to the websocket server

    ws.send(array)
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
}

module.exports = startServers
