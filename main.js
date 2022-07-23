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
require('log-timestamp');

const renderer = require('@futurelucas4502/light-electron-renderer')
const ejs = require('ejs');
const { get } = require('request');
const { platform } = require('os');
const axios = require('axios').default;

app.commandLine.appendSwitch ("disable-http-cache");

let mainWindow;
let store;

renderer.use(ejs, true, __dirname+ '/src/assets', __dirname+ '/src/template', ejs.renderFile, undefined, false)

store = new Store({accessPropertiesByDotNotation: false});

var sentryInit = ((store.has('launcher__sentry')) ? store.get('launcher__sentry') : true)
if(sentryInit){
    console.log('[FZLauncher] Init sentry service..')
    Sentry.init({ dsn: "https://bb48df8adaeb4da6b84b94ae6382c098@o1316392.ingest.sentry.io/6570059" });
}else
    console.log('[FZLauncher] Sentry service not launch..')
  

async function createWindow() {

    remoteMain.initialize();

    var cantOpenDevTools = (((store.has('session')) ? store.get('session').role.is_admin : false));

    mainWindow = new BrowserWindow({
        width: 800, 
        height: 220,
        maximizable: false,
        resizable: false,
        autoHideMenuBar: true,
        frame: false,
        title: "FrazionZ Launcher",
        app: "production",
        show: ((process.platform == "linux" || process.platform == "darwin") ? true : false),
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

    
    await axios.get('https://api.frazionz.net/servers/list')
        .then(async function (response) {
            await fs.writeFile('server_config.json', JSON.stringify(response.data), err => {});
        })
        .catch(function (error) {
            console.log(error)
            dialog.showMessageBoxSync(mainWindow, {
                message: "Impossible de récuperer les informations de l'API FrazionZ.\nLe launcher n'est donc pas disponible.",
                title: "FrazionZ Launcher",
                icon: "src/assets/img/icons/icon.png",
                buttons: ["Fermer"]
            })
            app.exit()
            process.exit()
        })
    
    let lang;
    let loadURL;

    setTimeout(() => {
        remoteMain.BrowserWindow = mainWindow;

        remoteMain.enable(mainWindow.webContents);
    
        mainWindow.center();

        var appData = ((process.platform == "linux" || process.platform == "darwin") ? process.env.HOME : process.env.APPDATA)
    
        dirFzLauncherRoot = path.join(appData, ".FrazionzLauncher");
        dirFzLauncherDatas = path.join(dirFzLauncherRoot, "Launcher");
        dirFzLauncherServer = path.join(dirFzLauncherRoot, "Servers");
    
        if(!fs.existsSync(dirFzLauncherRoot))
            fs.mkdirSync(dirFzLauncherRoot)
        if(!fs.existsSync(dirFzLauncherDatas))
            fs.mkdirSync(dirFzLauncherDatas)
        if(!fs.existsSync(dirFzLauncherServer))
            fs.mkdirSync(dirFzLauncherServer)
    
        process.noAsar = false
    
        if(!store.has('lang')) store.set('lang', 'fr')
    
        lang = ((store.has('lang')) ? require('./src/languages/'+store.get('lang')+'.json') : Fr)
    
        loadURL = (url, data) => {
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
    }, 1000)

    mainWindow.webContents.on('will-navigate', async function(e, url) {
        const open = require('open');
        if(url.startsWith("https://") || url.startsWith("http://")){
            e.preventDefault()
            await open(url);
        }
    })
    var afterUpdateAndRuntime = function() {
        mainWindow.setSize(1280, 720);
        mainWindow.center()
        if(store.has('session'))
            loadURL('/logging', [{type: "autolog"}])
        else
            loadURL('/login', [])
        /*const login = new Login(mainWindow.webContents);
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
        await open(data.url);
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
