const { contextBridge, ipcRenderer } = require('electron')

console.log('preloading and bridging...')

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  for (const type of ['chrome', 'node', 'electron']) {
    console.log(`${type}-version`, process.versions[type])
  }
})

contextBridge.exposeInMainWorld('electron', {
  saveJson: (json) => {
    ipcRenderer.send('save-json', json)
  },
  onJsonSaved: (callback) => ipcRenderer.on('save-json-reply', callback)
})
