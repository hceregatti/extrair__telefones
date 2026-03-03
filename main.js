const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { extractPhonesFromVideo } = require('./src/extractor');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'assets', 'logo-phone-extractor.icns'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile('src/renderer.html');
}
app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    // Electron's app.dock.setIcon expects a NativeImage or path to PNG/JPEG, not ICNS directly
    app.dock.setIcon(path.join(__dirname, 'assets', 'logo-phone-extractor.png'));
  }
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Videos', extensions: ['mp4', 'avi', 'mov'] }],
  });
  return result;
});

ipcMain.handle('extract-phones', async (event, videoPath) => {
  const timeoutMs = 60000; // 60 seconds timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Extraction timed out')), timeoutMs);
  });
  try {
    const result = await Promise.race([extractPhonesFromVideo(videoPath), timeoutPromise]);
    return result;
  } catch (err) {
    console.error('Extraction error:', err);
    throw err; // Propagate to renderer for handling
  }
});
ipcMain.handle('save-file', async (event, phones) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: 'formatted_phones.txt',
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
  });
  if (filePath) {
    await fs.writeFile(filePath, phones.join('\n'), 'utf8');
    return { success: true, filePath };
  }
  return { success: false };
});

// Cleanup temporary frames folder and generated txt file
ipcMain.handle('cleanup', async () => {
  const framesDir = path.join(app.getPath('userData'), 'frames');
  const txtPath = path.join(app.getPath('userData'), 'formatted_phones.txt');
  try {
    await fs.remove(framesDir);
    await fs.remove(txtPath);
    return { success: true };
  } catch (err) {
    console.error('Cleanup error:', err);
    return { success: false, error: err.message };
  }
});
