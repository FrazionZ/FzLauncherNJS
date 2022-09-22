var appRoot = require('app-root-path');
const path = require('path');
const rootPath = require('electron-root-path').rootPath;
const Store = require('electron-store');
const FZUtils = require(path.join(appRoot.path, '/src/assets/js/utils.js'));
const ejs = require('ejs');

class FzPage {

    constructor(webDocs, page) {
        this.fs = require('fs')
        this.path = path;
        this.rootPath = rootPath;
        this.store = new Store({accessPropertiesByDotNotation: false});
        if(typeof userSession !== 'undefined')
            this.session = userSession;
        this.ipcRenderer = require("electron").ipcRenderer;

        var appData = ((process.platform == "linux" || process.platform == "darwin") ? process.env.HOME : process.env.APPDATA)
    
        this.dirFzLauncherRoot = path.join(appData, ".FrazionzLauncher");
        this.dirFzLauncherDatas = path.join(this.dirFzLauncherRoot, "Launcher");
        this.shelfFzLauncherSkins = path.join(this.dirFzLauncherDatas, "skins.json");
        this.dirFzLauncherServer = path.join(this.dirFzLauncherRoot, "Servers");

        this.page = page;
        this.webDocs = webDocs;
        FZUtils.initCustomTlBar();
    }

    getPage(){
        return this.page;
    }

    notyf(type, message){
        this.bwExecJS(false, 'notyf.dismissAll(); notyf.'+type+'("'+message+'");')
    }

    dataPackage(){
        const appRoot = require('app-root-path');
        let rawdata = this.fs.readFileSync(appRoot.path+'\\package.json')
        let json = JSON.parse(rawdata);
        return json;
    }

    setWebContent(webContents){
        this.webDocs = webContents;
    }

    bwExecJS(isInit, code){
        return FZUtils.ExecuteCodeJS(code)
        /*const BrowserWindow = require('@electron/remote/main').BrowserWindow;
        if(BrowserWindow !== undefined)
            return BrowserWindow.webContents.executeJavaScript(code+';0')
        else
            return require('@electron/remote').BrowserWindow.getFocusedWindow().webContents.executeJavaScript(code+';0')*/
    }

    showPage(isInit){
        //main
        this.bwExecJS(isInit, '$("body").find(".main").load("./'+this.page+'");')
        this.bwExecJS(isInit, '$("body").find("#script").load("./script.html");');
    }

    checkFileExists(file) {
        return this.fs.promises.access(file, this.fs.constants.F_OK)
                 .then(() => true)
                 .catch(() => false)
    }

    getDataSession(key){
        var profile = this.store.get("session");
        var dataSend = "not_define";
        switch (key) {
            case 'username':
                dataSend = profile.username;
                break;
            case 'email':
                dataSend = profile.email;
                break;
            case 'rank':
                dataSend = profile.role.name;
                break;
            default:
                dataSend = "not_define";
        }              
        return dataSend;
    }

    initSessionSpan(className){
    }

    utf8_to_b64( str ) {
        return window.btoa(unescape(encodeURIComponent( str )));
    }

    hideModal(){
        var modal = bootstrap.Modal.getInstance(document.querySelector("body").querySelector("#modal").querySelector(".modal"));
        modal.hide()
    }

    showModal(isInit, id, promise) {
        var data = [];
        FZUtils.initVariableEJS(data, false).then((datar) => {
            ejs.renderFile(appRoot.path+"/src/template/modals/"+id+".ejs", datar, {}, (err, str) => {
                if (err) return console.log(err)
                $("body").find("#modals").html(str);
                $("body").find("#modals").find(id).modal('show');
            })
        })
    }
    

    

}

module.exports = FzPage;