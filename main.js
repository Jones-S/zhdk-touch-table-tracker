/*
 * This code will allow us to spawn a GUI window
 * using some built-in Electron APIs such as
 * BrowserWindow and the loadURL() method
 * which loads the index.html file from the dist folder.
 */

/* eslint-disable no-undef */
const { app, BrowserWindow, ipcMain } = require('electron')
const startServers = require('./src/websocket/server.js')

const url = require('url')
const path = require('path')
const fs = require('fs')

let mainWindow

const preloadPath = path.join(__dirname, './preload.js')
console.log(preloadPath) // Check if the path printed is correct

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: true,
      contextIsolation: true
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

  ipcMain.on('save-json', (event, data) => {
    // Perform file system operation to save the JSON file
    const filePath = path.join(__dirname, './matrix.json')

    fs.writeFile(filePath, JSON.stringify(data), (err) => {
      if (err) {
        console.error(err)
        event.reply('save-json-reply', { success: false, error: err.message })
      } else {
        event.reply('save-json-reply', { success: true })
      }
    })
  })

  ipcMain.handle('load-config', () => {
    return new Promise((resolve, reject) => {
      // Perform file system operation to save the JSON file
      const filePath = path.join(__dirname, './matrix.json')

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('err', err)
          console.info('No matrix calibration file found. Returning default matrix.')
          const defaultMatrix = {
            matrix: [
              [1, 1, 1],
              [1, 1, 1],
              [1, 1, 1]
            ]
          }
          resolve(defaultMatrix)
        }
        const jsonData = JSON.parse(data)
        console.log('jsonData: ', jsonData)
        resolve(jsonData)
      })
    })
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
