/* eslint-disable no-undef */

const WebSocket = require('ws')
require('dotenv').config()

function startWebSocketServer() {
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

  return wss
}

module.exports = startWebSocketServer
