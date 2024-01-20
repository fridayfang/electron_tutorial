const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');

function createWindow() {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
    //debug mode
    // win.webContents.openDevTools();

}

app.whenReady().then(createWindow);

ipcMain.on('open-file-dialog', (event) => {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Text Files', extensions: ['txt', 'md'] }]
    }).then(result => {
        if (!result.canceled) {
            fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
                if (err) {
                    event.reply('file-read-reply', `Error: ${err.message}`);
                } else {
                    const lines = data.split(/\r?\n/).slice(0, 10).join('\n');
                    event.reply('file-read-reply', lines);
                }
            });
        }
    }).catch(err => {
        event.reply('file-read-reply', `Error: ${err.message}`);
    });
});

// 其他代码保持不变

ipcMain.on('open-image-dialog', (event) => {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }]
    }).then(result => {
        if (!result.canceled) {
            fs.readFile(result.filePaths[0], (err, data) => {
                if (err) {
                    event.reply('image-read-reply', `Error: ${err.message}`);
                } else {
                    const imageBase64 = `data:image/png;base64,${data.toString('base64')}`;
                    event.reply('image-read-reply', imageBase64);
                }
            });
        }
    }).catch(err => {
        event.reply('image-read-reply', `Error: ${err.message}`);
    });
});

