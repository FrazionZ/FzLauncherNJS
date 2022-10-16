const { Client } = require('minecraft-launcher-core');
let launcher;
var appRoot = require('app-root-path');
const path = require('path');
const FZUtils = require(path.join(appRoot.path, '/src/assets/js/utils.js'));
var base64 = require('base-64');
class MinecraftRuntime {

    constructor(funcMain, ipcMain){
        this.funcMain = funcMain;
        this.ipcMain = ipcMain;
        ipcMain.removeHandler('MinecraftRuntime__setting')
        ipcMain.removeHandler('MinecraftRuntime__launching')
        ipcMain.on('MinecraftRuntime__setting', async (event, data) => {
            this.setting(data);
        })    
        ipcMain.on('MinecraftRuntime__launching', async (event, data) => {
            await this.launching(data);
        })
    }

    setting(opts){
        this.opts = opts;
    }

    async launching(data){

        launcher = new Client();
        var instance = this;
        
        var minecraft = await launcher.launch(this.opts);

        var launchGame = false;
        launcher.on('debug', (e) => {
            console.log(e)
        });
        launcher.on('data', async (e) => {
            console.log(e.replaceAll('\r').replaceAll('\n'))
            if(!launchGame){
                launchGame = true;

                if(data.closeApp) instance.funcMain.closeApp() 
                else instance.funcMain.hideApp();
            }
        })
        launcher.on('close', async(code) => {
            var dirCrashReports = path.join(instance.opts.root, "crash-reports");
            var lastCrashReports = await FZUtils.getMostRecentFileName(dirCrashReports);
            var pathLCR = path.join(dirCrashReports, lastCrashReports).replaceAll('\\', '/').toString('base64');

            instance.funcMain.showApp();
            instance.funcMain.loadURL('/connected/layout', [{afterGame: {code: code, logs: base64.encode(pathLCR)}},{session: this.opts.sessionfz}])
        })
    }

    arrayBufferToBase64( buffer ) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return window.btoa( binary );
    }
    

}

module.exports = MinecraftRuntime;