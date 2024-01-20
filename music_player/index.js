const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let addSongWindow;

const tracksFilePath = path.join(__dirname, 'tracks.json');

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.on('did-finish-load', () => {
    const tracks = loadTracks();
    mainWindow.webContents.send('load-tracks', tracks);
  });
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

function loadTracks() {
    try {
        console.log('loadTracks ', tracksFilePath);
        const tracksData = fs.readFileSync(tracksFilePath);
        return JSON.parse(tracksData);
    } catch (error) {
        console.error('Failed to read tracks data:', error);
        return [];
    }
}
  

app.on('window-all-closed', function () {
  console.log('window-all-closed');
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('open-file-dialog', async (event) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Music', extensions: ['mp3'] }]
    });
  
    if (result.canceled) {
      return; // 用户取消操作
    } else {
      return result.filePaths[0]; // 返回选中的文件路径
    }
});

ipcMain.on('add-track-to-main-window', (event, track) => {
  console.log('add-track-to-main-window', track);
  console.log('add track to tracks.json');

  // 分割路径，提取文件名
  const trackNameWithExtension = track.split('/').pop();
      
  // 去除文件扩展名，得到纯文件名
  const trackName = trackNameWithExtension.split('.')[0];
  
  // 用户添加了一首新歌
  let newTrack = {
    name: trackName,
    path: track
  };
  
  // 保存更新后的音乐轨道列表到文件
  saveTracks(newTrack);
  
  mainWindow.webContents.send('add-track', track);
});

function createAddSongWindow() {
  addSongWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  addSongWindow.loadFile('add-song.html');
  // addSongWindow.webContents.openDevTools();

  addSongWindow.on('closed', () => {
    addSongWindow = null;
  });
}

ipcMain.on('show-add-song-window', (event) => {
  console.log('show-add-song-window');
  createAddSongWindow();
});


function saveTracks(newTrack) {
  let tracks = [];
  if (fs.existsSync(tracksFilePath)) {
    const existingData = fs.readFileSync(tracksFilePath, 'utf8');
    tracks = JSON.parse(existingData);
  }

  // 检查新轨道是否已存在
  const trackIndex = tracks.findIndex(track => track.name === newTrack.name);
  if (trackIndex !== -1) {
    // 如果已存在，更新它
    tracks[trackIndex] = newTrack;
  } else {
    // 如果不存在，确保newTrack是一个对象，然后添加新轨道
    if (typeof newTrack === 'object' && newTrack !== null && !Array.isArray(newTrack)) {
      tracks.push(newTrack);
    }
  }

  // 将更新后的数据写回tracks.json
  fs.writeFileSync(tracksFilePath, JSON.stringify(tracks, null, 2));
}

ipcMain.handle('get-track-path', (event, trackName) => {
    const tracks = loadTracks();
    const track = tracks.find(t => t.name === trackName);
    return track ? track.path : null;
});
  

