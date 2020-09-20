const customTitlebar = require("custom-electron-titlebar");
const { ipcRenderer } = require("electron");
const Store = require("electron-store");

const store = new Store();

function openEmby() {
  document.getElementById("emby-instance").style.display = "flex";
  document.getElementById("settings").style.display = "none";
}

function openSettings() {
  document.getElementById("emby-instance").style.display = "none";
  document.getElementById("settings").style.display = "block";
  document.getElementById("settings-input-emby-url").value =
    store.get("settings", {}).embyUrl || "";
}

ipcRenderer.on("emby-open", function (event) {
  openEmby();
});

ipcRenderer.on("settings-open", function (event) {
  openSettings();
});

ipcRenderer.on("emby-url", function (event, embyUrl) {
  document.getElementById("emby-instance").src = embyUrl;
});

ipcRenderer.on("title-bar-visible", function (event, isVisible) {
  Array.from(
    document.getElementsByClassName("container-after-titlebar")
  ).forEach(function (element) {
    if (isVisible) element.style.top = "30px";
    else element.style.top = "0px";
  });
  Array.from(document.getElementsByClassName("titlebar windows")).forEach(
    function (element) {
      if (isVisible) element.style.height = "30px";
      else element.style.height = "0px";
    }
  );
  Array.from(document.getElementsByClassName("menubar")).forEach(function (
    element
  ) {
    if (isVisible) element.style.display = "flex";
    else element.style.display = "none";
  });
});

const titlebar = new customTitlebar.Titlebar({
  backgroundColor: customTitlebar.Color.fromHex("#141414"),
});

document.getElementById("settings-save").onclick = function () {
  ipcRenderer.send("settings-save", {
    embyUrl: document.getElementById("settings-input-emby-url").value,
  });
  openEmby();
};

document.getElementById("settings-cancel").onclick = function () {
  openEmby();
};
