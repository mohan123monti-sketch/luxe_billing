const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow = null;

// Determine DB path in standard OS AppData/UserData directory
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'sqlite.db');
process.env.DATABASE_PATH = dbPath;
process.env.NODE_ENV = 'production';
process.env.PORT = '3000';

// Start the local Express server directly inside the Electron Main process.
require('./server/index.cjs');

// Define a standard menu template so Windows registers accelerators (copy, paste, undo, etc.)
const template = [
  {
    label: 'File',
    submenu: [
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'delete' },
      { type: 'separator' },
      { role: 'selectAll' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  }
];

function createWindow() {
  // Build and set the global application menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    title: "LUXE Billing System",
    icon: path.join(__dirname, 'dist/favicon.ico'),
    autoHideMenuBar: true, // Modern look, but keeps the menu shortcuts active!
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the local Express server
  mainWindow.loadURL('http://localhost:3000');

  // Explicitly request focus once page loads to ensure input fields are instantly interactive
  mainWindow.webContents.once('did-finish-load', () => {
    if (mainWindow) {
      mainWindow.focus();
    }
  });

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
