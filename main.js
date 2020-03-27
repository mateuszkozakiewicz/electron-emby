const { app, BrowserWindow, Menu } = require("electron");
const Store = require("electron-store");
const config = require("./config/env.json");

const store = new Store();

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
    },
    ...store.get("winBounds")
  });

  if (store.get("maximized")) mainWindow.maximize();
  if (store.get("was_fullscreen")) mainWindow.setFullScreen(true);
  if (config.debug) mainWindow.webContents.openDevTools();

  mainWindow.loadFile("index.html");
  mainWindow.webContents.on("dom-ready", () => {
    mainWindow.webContents.send("emby-url", config.embyUrl);
    if (!config.debug) mainWindow.webContents.send("hide-menu");
  });

  mainWindow.on("close", () => {
    store.set("winBounds", mainWindow.getBounds());
    store.set("maximized", mainWindow.isMaximized());
    store.set("was_fullscreen", mainWindow.isFullScreen());
  });

  mainWindow.on("enter-full-screen", () => {
    mainWindow.webContents.send("title-bar-visible", false);
  });

  mainWindow.on("leave-full-screen", () => {
    mainWindow.webContents.send("title-bar-visible", true);
  });
}

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
