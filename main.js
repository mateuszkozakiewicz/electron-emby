const { app, BrowserWindow, Menu } = require("electron");
const config = require("./config/env.json");

function createWindow() {
  const mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    width: 1280,
    height: 720,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    }
  });
  mainWindow.loadFile("index.html");
  mainWindow.maximize();

  if (config.debug) mainWindow.webContents.openDevTools();

  mainWindow.webContents.on("dom-ready", () => {
    mainWindow.webContents.send("emby-url", config.embyUrl);
    if (!config.debug) mainWindow.webContents.send("hide-menu");
  });
}

// if (!config.debug) Menu.setApplicationMenu(null);
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
