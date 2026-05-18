const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow = null;

// Determine DB path in standard OS AppData/UserData directory
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'sqlite.db');
process.env.DATABASE_PATH = dbPath;
process.env.NODE_ENV = 'production';
process.env.PORT = '3000';

// Start the local Express server directly inside the Electron Main process.
// Electron has native ASAR file-system support, meaning require resolves beautifully
// both in local development and when packaged inside the user's .exe installer!
require('./server/index.cjs');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    title: "LUXE Billing System",
    icon: path.join(__dirname, 'dist/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Remove default menus for an elegant, native desktop-app feel
  mainWindow.setMenuBarVisibility(false);

  // Load the local Express server
  mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  // Give the server database seeds a short moment to initialize, then show window
  setTimeout(createWindow, 1200);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
