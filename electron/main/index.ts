import { app, BrowserWindow, shell, ipcMain, Notification, nativeImage, Tray, Menu } from "electron";
import { release } from "node:os";
import { join } from "node:path";
import * as Sentry from "@sentry/electron";
import Store from "electron-store";
const remoteMain = require("@electron/remote/main");
const rpc = require("discord-rpc");
const discordRPC = {
  appId: "666379133546135572", //Id of your application

  details: "FrazionZ Launcher", //Your descriptions
  largeImageKeyName: "large", // Key to the large image (https://discord.com/developers/applications -> Rich Presence -> Art Assets)
  largeImageText: "FrazionZ", //Text when you put your mouse on the large image

  buttonOneName: "Télécharger le launcher", //Name of the button
  buttonOneUrl: "https://frazionz.net/launcher", //URL of the button
};
import MinecraftRuntime from "../../src/components/game/MinecraftRuntime";
let store = new Store()
let lang = null;

process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

if(store.get('launcher__sentry', true)){
  console.log('[FzLauncher] Init Sentry');
  Sentry.init({ dsn: "https://c77ce307ca6243d59a36932306c12919@o4504528423026688.ingest.sentry.io/4504528437837824" });
}else console.log('[FzLauncher] Pass init sentry');

async function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    show: false,
    frame: false,
    maximizable: true,
    resizable: true,
    fullscreenable: true,
    autoHideMenuBar: true,
    backgroundColor: "#0E1014",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      devTools: (process.env.VITE_DEV_SERVER_URL) ? true : false,
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    },
  });

  rpc.register(discordRPC.appId);
  const discordClient = new rpc.Client({ transport: "ipc" });
    
  discordClient.on('ready', () => {
    console.log('RPC Started');
    discordClient.setActivity({
      details: discordRPC.details,
      largeImageKey: discordRPC.largeImageKeyName,
      largeImageText: discordRPC.largeImageText,
      buttons: [
        {
          label: discordRPC.buttonOneName,
          url: discordRPC.buttonOneUrl
        }
      ]
    });
  });

  const clientId = discordRPC.appId

  //if(store.get('launcher__drpc', true)) discordClient.login({ clientId });

  remoteMain.initialize();
  remoteMain.enable(win.webContents);

  require("electron-store").initRenderer();

  process.noAsar = false;

  const closeApp = () => {
    win.hide();
    app.exit();
    app.quit();
    process.exit();
  };

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    win.loadURL(url);
  } else {
    win.loadFile(indexHtml);
  }

  const icon = nativeImage.createFromPath(join(process.env.PUBLIC, "favicon.ico"))
  let tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Ouvrir le Launcher', type: 'normal', click: () => { win.show() } },
    { label: 'Minimiser le Launcher', type: 'normal', click: () => { win.hide() } },
    { label: 'Fermer le Launcher', type: 'normal', click: () => { closeApp() } }
  ])

  tray.setToolTip('FrazionZ Launcher')
  tray.setContextMenu(contextMenu)

  setTimeout(async () => {
    remoteMain.enable(win.webContents);
  }, 1000);

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  win.on("ready-to-show", () => {
    win.show();
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  const funcMain = {
    hideApp: () => {
      win.hide();
    },
    showApp: () => {
      win.show();
    },
    closeApp: closeApp,
  };

  new MinecraftRuntime(funcMain, ipcMain, win);

  ipcMain.on("loadAppAfterUpdate", () => {
    console.log("test");
  });

  ipcMain.on("closeApp", () => {
    closeApp();
  });

  ipcMain.on("relaunchApp", () => {
    app.relaunch();
    app.exit();
  });

  ipcMain.on("reduceApp", () => {
    BrowserWindow.getFocusedWindow().minimize();
  });

  ipcMain.on("maximizeApp", (e, args) => {
    win.isMaximized() ? win.unmaximize() : win.maximize();
  });

  ipcMain.on("unMaximizeApp", (e, args) => {
    win.isMaximized() ? win.unmaximize() : () => {};
    win.setMaximizable(false)
  });

  ipcMain.on("allowMaximizeApp", (e, args) => {
    win.setMaximizable(true)
  });

  ipcMain.on("finishDownloadUpdate", () => {
    app.exit();
    process.exit();
  });

  ipcMain.on("notification", (e, args) => {
    new Notification({
      title: args.title,
      body: args.body,
    }).show();
  })

  win.show();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
