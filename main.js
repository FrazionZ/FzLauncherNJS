const { app, electron, BrowserWindow, dialog, ipcMain, Notification } = require('electron')
const Store = require('electron-store');
const path = require('path')
var appRoot = require('app-root-path');
const fs = require('fs')
const Login = require('./src/assets/js/login.js')
const Sentry = require('@sentry/electron');
const remoteMain = require('@electron/remote/main')
const FZUtils = require('./src/assets/js/utils.js');
const JSONUtils = require('./src/assets/js/JSONUtils.js');
const Fr = require('./src/languages/fr.json');
const servers = require('./server_config.json');
require('log-timestamp');

const renderer = require('@futurelucas4502/light-electron-renderer')
const ejs = require('ejs');
const { get } = require('request');

app.commandLine.appendSwitch ("disable-http-cache");

let mainWindow;
let store;

renderer.use(ejs, true, __dirname+ '/src/assets', __dirname+ '/src/template', ejs.renderFile, undefined, false)

Sentry.init({ dsn: "https://22c32b0ec90c4a56924fd5d6e485e698@o1296996.ingest.sentry.io/6524957" });

async function createWindow() {

    remoteMain.initialize();

    store = new Store({accessPropertiesByDotNotation: false});

    var cantOpenDevTools = (((store.has('session')) ? store.get('session').role.is_admin : false));

    mainWindow = new BrowserWindow({
        width: 1280, 
        height: 720,
        maximizable: false,
        resizable: false,
        autoHideMenuBar: true,
        frame: false,
        title: "FrazionZ Launcher",
        app: "production",
        titleBarStyle: 'hidden',
        icon: path.join(__dirname, "src/assets/img/icons/icon.png"),
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            webviewTag: true,
            devTools: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    remoteMain.BrowserWindow = mainWindow;

    remoteMain.enable(mainWindow.webContents);

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

    process.noAsar = false

    if(!store.has('lang')) store.set('lang', 'fr')

    var lang = ((store.has('lang')) ? require('./src/languages/'+store.get('lang')+'.json') : Fr)

    var loadURL = (url, data) => {
        var datas = FZUtils.initVariableEJS(data)
        datas.then((dataFind) => {
            try {
                renderer.load(mainWindow, url, dataFind)
            }catch(e){
                console.log(e)
            }
        })
    }
    


    loadURL('/updater/index', [])

    mainWindow.webContents.on('will-navigate', async function(e, url) {
        const open = require('open');
        if(url.startsWith("https://") || url.startsWith("http://")){
            e.preventDefault()
            await open(url);
        }
    })
    var afterUpdateAndRuntime = function() {
        store.set('gameLaunched', false);
        if(store.has('session'))
            loadURL('/logging', [{form: {accessToken: store.get('session').access_token}}, {type: "autolog"}])
        else
            loadURL('/login', [])
        /*const login = new Login(mainWindow.webContents);
        login.store.set('gameLaunched', false)
        login.store.delete('downloads')
        login.showPage(true);*/
    };

    ipcMain.on('loadAppAfterUpdate', () => {
        if(process.platform === "win32"){
            FZUtils.javaversion(dirFzLauncherDatas, function(err,version){
                if(err){
                    loadURL('/runtime/index', [])
                }else{
                    afterUpdateAndRuntime()
                }
            })
        }else{
            afterUpdateAndRuntime()
        }
        
    })

    ipcMain.on('openFile', async (event, data) => {
        dialog.showOpenDialog({properties: ['openFile'] }).then(function (response) {
            if (!response.canceled) {
                event.sender.send("responseOpenFile", response);
            }
        });
    })

    ipcMain.on('logout', async (event, data) => {
        afterUpdateAndRuntime()
    })

    ipcMain.on('reduceWindow', async (event, data) => {
        mainWindow.minimize();
    })

    ipcMain.on('openUrlExternal', async (event, data) => {
        const open = require('open');
        await open(data);
    })

    ipcMain.on('loadURL', async (event, data) => {
        loadURL(data.url, data.datas);
    })

    ipcMain.on('ejseData', async (event, data) => {
    })

    ipcMain.handle('executeCode', async  (event, data) => {
        mainWindow.webContents.executeJavaScript(data+";0")
    })

    ipcMain.on('showDevTools', (event, data) => {
        var cantOpenDevTools = (((store.has('session')) ? store.get('session').role.is_admin : false));
        if(cantOpenDevTools)
            mainWindow.webContents.openDevTools();
    })

    ipcMain.on('showApp', (event, data) => {
        mainWindow.show();
    })

    ipcMain.on('hideApp', (event, data) => {
        mainWindow.hide();
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