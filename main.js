require("electron-reload")(__dirname);
const {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  ipcMain,
  globalShortcut
} = require("electron");
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

  if (store.get("isMaximized")) mainWindow.maximize();
  if (store.get("isFullscreen")) mainWindow.setFullScreen(true);
  if (config.debug) mainWindow.webContents.openDevTools();

  mainWindow.loadFile("./views/MainWindow/MainWindow.html");
  mainWindow.webContents.on("dom-ready", () => {
    if (store.get("settings", {}).embyUrl)
      mainWindow.webContents.send(
        "emby-url",
        store.get("settings", {}).embyUrl
      );
    else mainWindow.webContents.send("settings-open");
  });

  mainWindow.on("close", () => {
    store.set("winBounds", mainWindow.getBounds());
    store.set("isMaximized", mainWindow.isMaximized());
    store.set("isFullscreen", mainWindow.isFullScreen());
  });

  mainWindow.on("enter-full-screen", () => {
    mainWindow.webContents.send("title-bar-visible", false);
  });

  mainWindow.on("leave-full-screen", () => {
    mainWindow.webContents.send("title-bar-visible", true);
  });

  ipcMain.on("settings-save", function(event, settings) {
    store.set("settings", settings);
    if (settings.embyUrl) mainWindow.webContents.send("emby-url", settings);
    mainWindow.reload();
  });

  const menu = new Menu();
  menu.append(
    new MenuItem({
      label: "Emby",
      click() {
        mainWindow.webContents.send("emby-open");
      }
    })
  );
  menu.append(
    new MenuItem({
      label: "Settings",
      click() {
        mainWindow.webContents.send("settings-open");
      }
    })
  );
  Menu.setApplicationMenu(menu);

  globalShortcut.register("F5", function() {
    mainWindow.reload();
  });
  globalShortcut.register("CommandOrControl+R", function() {
    mainWindow.reload();
  });
  globalShortcut.register("F11", function() {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
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
