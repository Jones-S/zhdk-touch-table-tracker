/*
 * This code will allow us to spawn a GUI window
 * using some built-in Electron APIs such as
 * BrowserWindow and the loadURL() method
 * which loads the index.html file from the dist folder.
 */

/* eslint-disable no-undef */
const { app, BrowserWindow } = require('electron')
const startServers = require('./src/websocket/server.js')

const url = require('url')
const path = require('path')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `./dist/index.html`),
      protocol: 'file:',
      slashes: true
    })
  )
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}
app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

startServers()

// To test if the websocket is running just execute some JavaScript inside the browsers console:
// const ws = new WebSocket('ws://localhost:6050')
// ws.onopen = () => console.log('WebSocket connection opened')
// ws.onmessage = (event) => console.log('Received message:', event.data)
// ws.onclose = () => console.log('WebSocket connection closed')
// ws.onerror = (error) => console.error('WebSocket error:', error)
