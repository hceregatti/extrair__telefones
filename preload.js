const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  extractPhones: (videoPath) => ipcRenderer.invoke('extract-phones', videoPath),
  saveFile: (phones) => ipcRenderer.invoke('save-file', phones),
  cleanup: () => ipcRenderer.invoke('cleanup'),
});
