const { app, electron, nativeTheme, safeStorage, screen, BrowserWindow, Menu, Tray, dialog, ipcMain, Notification, ipcRenderer } = require('electron')
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
var authorizationDevTools = false;
app.commandLine.appendSwitch ("disable-http-cache");
app.commandLine.appendSwitch('disable-gpu-process-crash-limit')
app.disableDomainBlockingFor3DAPIs()

let mainWindow;
let store;

renderer.use(ejs, true, __dirname+ '/src/assets', __dirname+ '/src/template', ejs.renderFile, undefined, false)

store = new Store({accessPropertiesByDotNotation: false});
forceUpdate
var updaterState = ((store.has('launcher__updater')) ? store.get('launcher__updater') : true)
var forceUpdate = ((store.has('forceUpdate')) ? store.get('forceUpdate') : false)
var sentryInit = ((store.has('launcher__sentry')) ? store.get('launcher__sentry') : true)
if(sentryInit){
    console.log('[FZLauncher] Init sentry service..')
    Sentry.init({ dsn: "https://bb48df8adaeb4da6b84b94ae6382c098@o1316392.ingest.sentry.io/6570059" });
}else
    console.log('[FZLauncher] Sentry service not launch..')

async function createWindow() {

    
    const primaryDisplay = screen.getPrimaryDisplay()

    remoteMain.initialize();

    mainWindow = new BrowserWindow({
        width: 800, 
        height: 220,
        maximizable: true,
        resizable: true,
        autoHideMenuBar: true,
        frame: false,
        fullscreenable: true,
        title: "FrazionZ Launcher",
        app: "production",
        show: ((process.platform == "linux" || process.platform == "darwin") ? true : false),
        icon: path.join(__dirname, "src/assets/img/icons/icon.png"),
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            webviewTag: false,
            devTools: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    if(!store.has('launcher__darkmode')) 
        store.set('launcher__darkmode', true)

    mainWindow.setBackgroundColor('#0E1014')

    mainWindow.setFullScreenable(true)

    var appIcon = new Tray(path.join(__dirname, "src/assets/img/icons/icon.png"))
    var contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App', click: function () {
                mainWindow.show()
            }
        },
        {
            label: 'Quit', click: function () {
                app.isQuiting = true
                app.quit()
            }
        }
    ])
    appIcon.setToolTip("FrazionZ Launcher")
    appIcon.setContextMenu(contextMenu)

    
    let lang;
    let loadURL;

    let contentReduceWindow;

    setTimeout(async () => {
        remoteMain.BrowserWindow = mainWindow;

        remoteMain.enable(mainWindow.webContents);
    
        mainWindow.center();

        /*var serversConfigFile = path.join(appRoot.path, "server_config.json");
        if(!fs.existsSync(serversConfigFile))
            fs.writeFileSync(serversConfigFile, "[]", ()=>{})*/

        var appData = ((process.platform == "linux" || process.platform == "darwin") ? process.env.HOME : process.env.APPDATA)
    
        dirFzLauncherRoot = path.join(appData, ".FrazionzLauncher");
        dirFzLauncherDatas = path.join(dirFzLauncherRoot, "Launcher");
        shelfFzLauncherSkins = path.join(dirFzLauncherDatas, "skins.json");
        dirFzLauncherServer = path.join(dirFzLauncherRoot, "Servers");
    
        if(!fs.existsSync(dirFzLauncherRoot))
            fs.mkdirSync(dirFzLauncherRoot)

        if(!fs.existsSync(dirFzLauncherDatas))
            fs.mkdirSync(dirFzLauncherDatas)

        if(!fs.existsSync(shelfFzLauncherSkins))
            fs.writeFileSync(shelfFzLauncherSkins, "[]", ()=>{})

        if(!fs.existsSync(dirFzLauncherServer))
            fs.mkdirSync(dirFzLauncherServer)
    
        process.noAsar = false
    
        if(!store.has('lang')) store.set('lang', 'fr')
    
        lang = ((store.has('lang')) ? require('./src/languages/'+store.get('lang')+'.json') : Fr)
    
        loadURL = async (url, data) => {
            await FZUtils.initVariableEJS(data, true).then((datas) => {
                try {
                    renderer.load(mainWindow, url, datas)
                }catch(e){
                    console.log(e)
                }
            })
        }

        await loadURL('/updater/index', [])
    }, 1000)

    mainWindow.webContents.on('will-navigate', async function(e, url) {
        const open = require('open');
        if(url.startsWith('about:bank')) return e.preventDefault();
        if(url.startsWith("https://") || url.startsWith("http://")){
            e.preventDefault()
            await open(url);
        }
    })

    mainWindow.webContents.on('did-start-navigation', async function(e, url) {
        
    })

    mainWindow.webContents.on('will-redirect', async function(e, url) {
        
    })

    mainWindow.webContents.on('devtools-opened', () => {
        setImmediate(() => {
            //if(!authorizationDevTools)
                //mainWindow.webContents.closeDevTools()
        });
    });

    var afterUpdate = async function() {
        mainWindow.show()
        if(process.platform === "win32"){
            FZUtils.javaversion(dirFzLauncherDatas, async function(err,version){
                if(err){
                    await loadURL('/runtime/index', [])
                }else{
                    afterUpdateAndRuntime()
                }
            })
        }else{
            afterUpdateAndRuntime()
        }
    }

    var afterUpdateAndRuntime = async function() {

        var defautSizeWidth = parseInt(primaryDisplay.size.width)
        var defautSizeHeight = parseInt(primaryDisplay.size.height)
        var widthScreen = /*1820;*/parseInt(defautSizeWidth / 1.5, 10);
        var heightScreen = /*1260;*/parseInt(defautSizeHeight / 1.5, 10);

        if(primaryDisplay.size.width < 1920 && primaryDisplay.size.height < 1080 ){
            widthScreen = 1280;
            heightScreen = 720;
            console.log("[FZLauncher] Minimal Set ScreenSize | Width: " + widthScreen + " Height: " + heightScreen)
        } else 
            console.log("[FZLauncher] ScreenSize | Width: " + widthScreen + " Height: " + heightScreen)

        mainWindow.setSize(widthScreen, heightScreen);
        mainWindow.setMinimumSize(widthScreen, heightScreen);
        mainWindow.setMaximumSize(defautSizeWidth, defautSizeHeight);
        mainWindow.center()
        const checkInternetConnected = require('check-internet-connected');

        const config = {
            timeout: 1200,
            retries: 2,
            domain: 'frazionz.net'
        }

        await checkInternetConnected(config)
            .then(async () => {
                /*await axios.get('https://api.frazionz.net/servers/list')
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
                    })*/
                if(store.has('session'))
                    await loadURL('/logging', [{type: "autolog"}])
                else
                    await loadURL('/login', [])   
            }).catch(async (error) => {
                console.log(error)
                await loadURL('/session/nointernet', []);
            });

        /*const login = new Login(mainWindow.webContents);
        login.store.delete('downloads')
        login.showPage(true);*/
    };

    ipcMain.on('loadAppAfterUpdate', () => {
        afterUpdate()
    })

    ipcMain.on('openFile', async (event, data) => {
        dialog.showOpenDialog({properties: ['openFile'] }).then(function (response) {
            if (!response.canceled) {
                event.sender.send("responseOpenFile", {file: response, id: data.id});
            }else if(response.canceled) {
                event.sender.send("cancelOpenFile", {});
            }
        });
    })

    ipcMain.on('logout', async (event, data) => {
        afterUpdateAndRuntime()
    })

    ipcMain.on('reduceWindow', async (event, data) => {
        var theWindow = BrowserWindow.getFocusedWindow();
        theWindow.minimize();
    })

    ipcMain.on('maximizeWindow', async (event, data) => {
        ((mainWindow.isMaximized()) ? mainWindow.unmaximize() : mainWindow.maximize())
    })

    ipcMain.on('reloadFZ', async (event, data) => {
        afterUpdateAndRuntime();
    })

    ipcMain.on('openUrlExternal', async (event, data) => {
        const open = require('open');
        await open(data.url);
    })

    ipcMain.on('authorizationDevTools', async (event, data) => {
        console.log('User is '+((data) ? 'authorized' : 'not authorized')+' to open DevTools')
        authorizationDevTools = data;
    })

    ipcMain.on('loadURL', async (event, data) => {
        await loadURL(data.url, data.datas);
    })

    ipcMain.on('ejseData', async (event, data) => {
    })

    ipcMain.handle('executeCode', async  (event, data) => {
        mainWindow.webContents.executeJavaScript(data+";0")
    })

    ipcMain.on('showDevTools', (event, data) => {
        mainWindow.webContents.openDevTools();
    })

    ipcMain.on('showApp', (event, data) => {
        mainWindow.show();
    })

    ipcMain.on('hideApp', (event, data) => {
        mainWindow.hide();
    })

    ipcMain.on('closeApp', (event, data) => {
        mainWindow.hide();
        if(!data){
            app.exit();
            app.quit();
            process.exit();
        }
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

    ipcMain.on('sfsDecrypt', async (event, data) => {
        event.sender.send('respSfsDecrypt', safeStorage.decryptString(data))
    })

    ipcMain.on('sfsEncrypt', async (event, data) => {
        event.sender.send('respSfsEncrypt', safeStorage.encryptString(data))
    })

    mainWindow.on('maximize', (event) => {
        mainWindow.show();
        mainWindow.webContents.goBack()
        event.sender.send('responseMaximizeWindow', true)
    });
    
    mainWindow.on('unmaximize', (event) => {
        event.sender.send('responseMaximizeWindow', false)
    });

    mainWindow.on('restore', (event) => {
        if(mainWindow.webContents.getURL() == "about:blank#blocked") afterUpdateAndRuntime();
    })

}

app.whenReady().then(async () => {
    await createWindow()
    app.on('activate', () => {
        console.log(BrowserWindow.getAllWindows().length)
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


app.setAsDefaultProtocolClient('fzlauncher');
