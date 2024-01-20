const { contextBridge, ipcRenderer } = require('electron');
// 暴露给渲染进程的API

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'), // 打开文件对话框
  sendTrackToMainWindow: (track) => ipcRenderer.send('add-track-to-main-window', track), // 发送歌曲到主窗口
  showAddSongWindow: () => ipcRenderer.send('show-add-song-window'),
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  getTrackPath: (trackName) => ipcRenderer.invoke('get-track-path', trackName) // 获取歌曲路径
});
