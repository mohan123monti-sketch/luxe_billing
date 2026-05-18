const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow = null;
let serverProcess = null;

// Determine DB path in standard OS AppData/UserData directory
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'sqlite.db');
process.env.DATABASE_PATH = dbPath;
process.env.NODE_ENV = 'production';
process.env.PORT = '3000';

function startServer() {
  const serverScript = path.join(__dirname, 'server/index.js');
  
  // Fork the Express production server as a child process
  serverProcess = fork(serverScript, [], {
    env: {
      ...process.env,
      DATABASE_PATH: dbPath,
      PORT: '3000',
      NODE_ENV: 'production'
    },
    silent: false
  });

  serverProcess.on('error', (err) => {
    console.error('Server process error:', err);
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`Server process exited with code ${code} and signal ${signal}`);
  });
}

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

  // Load the local Express production server
  mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  // 1. Start the local background Express server
  startServer();

  // 2. Allow a short timeout for Express to bind, then show window
  setTimeout(createWindow, 1500);
});

app.on('window-all-closed', () => {
  // Terminate background Express process when app windows close
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
