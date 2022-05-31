const { app, BrowserWindow,  ipcMain, ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')
const Login = require('./src/js/login.js')
const remoteMain = require('@electron/remote/main')
const FZUtils = require('./src/js/utils.js');

async function createWindow() {

    remoteMain.initialize();

    const mainWindow = new BrowserWindow({
        width: 1280, 
        height: 720,
        devTools: true,
        autoHideMenuBar: true,
        frame: process.platform === 'darwin',
        title: "FrazionZ Launcher",
        app: "production",
        icon: path.join(__dirname, "src/img/icons/icon.png"),
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            webviewTag: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    remoteMain.BrowserWindow = mainWindow;

    remoteMain.enable(mainWindow.webContents)

    mainWindow.setMinimumSize(1280, 720);
    mainWindow.setMaximumSize(1920, 1080);

    mainWindow.center();

    dirFzLauncherRoot = process.env.APPDATA  + "\\.FrazionzLauncher" || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share") + ".FrazionzLauncher";
    dirFzLauncherDatas = dirFzLauncherRoot + "\\Launcher";
    dirFzLauncherServer = dirFzLauncherRoot + "\\Servers";

    if(!fs.existsSync(dirFzLauncherRoot)){
        fs.mkdirSync(dirFzLauncherRoot)
    }
    if(!fs.existsSync(dirFzLauncherDatas)){
        fs.mkdirSync(dirFzLauncherDatas)
    }
    if(!fs.existsSync(dirFzLauncherServer)){
        fs.mkdirSync(dirFzLauncherServer)
    }
    if(!fs.existsSync(dirFzLauncherDatas+"/profiles.json")){
        await fs.writeFile(dirFzLauncherDatas+"/profiles.json", "[]", function (err) {
            if(err) console.log(err);
            app.exit();
            app.relaunch();
        })
    }

    process.noAsar = true

    mainWindow.loadURL(__dirname+'/src/template/updater/index.html')

    mainWindow.webContents.on('will-navigate', async function(e, url) {
        const open = require('open');
        if(url.startsWith("https://") || url.startsWith("http://")){
            e.preventDefault()
            await open(url);
        }
    })

    mainWindow.webContents.on('DOMContentLoaded', () => {
        if (process.platform !== 'darwin') {
            require('@treverix/remote/main').initialize();
            const customTitlebar = require('custom-electron-titlebar');
            new customTitlebar.Titlebar({
                backgroundColor: customTitlebar.Color.fromHex('#ECECEC')
            });
        }
    })

    var afterUpdateAndRuntime = function() {
        mainWindow.loadURL(__dirname+'/src/template/layouts.html')
        const login = new Login(mainWindow.webContents);
        login.store.set('gameLaunched', false)
        login.showPage(true);
    };

    ipcMain.on('loadAppAfterUpdate', () => {
        if(process.platform === "win32"){
            FZUtils.javaversion(dirFzLauncherDatas, function(err,version){
                if(err)
                    mainWindow.loadURL(__dirname+'/src/template/runtime/index.html')
                else
                    afterUpdateAndRuntime()
            })
        }else{
            afterUpdateAndRuntime()
        }
        
    })

    ipcMain.handle('executeCode', async  (event, data) => {
        mainWindow.webContents.executeJavaScript(data+";0")
    })

    ipcMain.on('closeApp', (event, data) => {
        app.exit();
        process.exit();
    })

    ipcMain.on('relaunchApp', (event, data) => {
        app.exit();
        app.relaunch();
    })

    ipcMain.on('picker-list-update', function(event, arg) {
        console.log('fffff');
    });

    ipcMain.on('main-send', function(event, sender_name) {
        var arr = BrowserWindow.getAllWindows();
        for(var i = 0; i < arr.length; i++){
            const toWindow = arr[i];
            toWindow.webContents.send('picker-list-update');
        }
    
    });

}

app.whenReady().then(async () => {
    await createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})