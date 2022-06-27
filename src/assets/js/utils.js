const main = require('@electron/remote/main')

function UrlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    if (http.status != 404)
        return true;
    else
        return false;
}

function showOpenFileDialog(){
    const { ipcRenderer } = require("electron");
    if(ipcRenderer !== undefined){
        ipcRenderer.send('openFile')
    }
}


function initCustomTlBar() {
    const { ipcRenderer } = require("electron");
    if(ipcRenderer !== undefined)
        ipcRenderer.send('main-send', 'picker-list-update');
}

function ExecuteCodeJS(code) {
    const { ipcRenderer } = require("electron");
    if(ipcRenderer == undefined)
        return main.BrowserWindow.webContents.executeJavaScript(code+';0')
    else
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('executeCode', code+";0")
                .then((result) => {
                    setTimeout(() => {
                        resolve(result);
                    }, 10)
                })
                .catch((err) => {
                    reject(err)
                })
        })
}

async function initVariableEJS(data){
    const rootPath = require('electron-root-path').rootPath;
    const path = require('path')
    const Store = require('electron-store')
    const FZUtils = require('./utils.js')
    const servers = require('../../../server_config.json');
    store = new Store({accessPropertiesByDotNotation: false});
    var initDatas = [
        {
            "servers": servers,
            "server_current": {
                idServer: 0,
                server: servers[0]
            },  
            "appRoot": require('app-root-path'),
            "path": path,
            "FZUtils": FZUtils, 
            "srcDir": path.join(__dirname, '../../../src/').replaceAll('\\', '/'),
            "language": ((store.has('lang')) ? require('../../languages/'+store.get('lang')+'.json') : Fr),
            "rootDirPath": path.join(rootPath).replaceAll('\\', '\\\\'),
            "rootDirPathNF": path.join(rootPath),
            "version": require('../../../package.json').version
        }
    ];
    data.forEach((datai) => {
        Object.assign(initDatas[0], datai)
    })
    return initDatas[0];
}

async function loadURL(url, data){
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('loadURL', {url: url, datas: data});
}

async function storeDataEJS(key, data){
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('ejseData', {key: data, data: data});
}

async function download(instance, installerfileURL, installerfilename, dialog, branch) {
    const fs = require('fs')
    const path = require('path')
    const Store = require('electron-store')
    const { v4: uuidv4 } = require('uuid');
    var uuidDl = uuidv4();
    if(dialog){
        downloads.addDownload(uuidDl)
        downloadsList.push({uuidDl: uuidDl, title: "Téléchargement des fichiers", subtitle: " - ", percentage: 0, finish: false});
    }
    return new Promise((resolve, reject) => {
        // Save variable to know progress
        var received_bytes = 0;
        var total_bytes = 0;

        const request = require('request')
        var req = request({
            method: 'GET',
            uri: installerfileURL
        });

        var out = fs.createWriteStream(installerfilename);
        req.pipe(out);

        req.on('response', function ( data ) {
            total_bytes = parseInt(data.headers['content-length' ]);
        });

        req.on('error', function(err) {
            console.log(err);
            reject(err)
        })

        req.on('data', function(chunk) {
            received_bytes += chunk.length;
            var percentage = (received_bytes * 100) / total_bytes;
            if(dialog){
                downloads.updateDownload(uuidDl, "Téléchargement des fichiers", installerfilename, parseInt(percentage, 10).toString())
                //$('#downloads').find('#'+uuidDl).find('.title').text("Téléchargement des fichiers");
                //$('#downloads').find('#'+uuidDl).find('.subtitle').text(path.basename(installerfilename));
                //document.querySelector('.download').querySelector('#progress').style.width = ""+parseInt(percentage, 10).toString()+"%";
                //uuidv4();

                //dlDialog.setPercentBar(percentage)
            }else{
                document.getElementById('downloadbar').value = percentage
            }
        });

        req.on('end', function() {
            if(dialog){
                downloads.finishDownload(uuidDl)
            }
            resolve(true)
        });
    });
}

function listRamAllocate(){
    const os = require('os');
    if(os.arch().includes('64')){
        var total_memory = require('os').totalmem();
        var total_mem_in_kb = total_memory/1024;
        var total_mem_in_mb = total_mem_in_kb/1024;
        var total_mem_in_gb = total_mem_in_mb/1024;
        
        total_mem_in_kb = Math.floor(total_mem_in_kb);
        total_mem_in_mb = Math.floor(total_mem_in_mb);
        total_mem_in_gb = Math.floor(total_mem_in_gb);
        
        total_mem_in_mb = total_mem_in_mb%1024;
        total_mem_in_kb = total_mem_in_kb%1024;
        total_memory = total_memory%1024;
    
        var allocate = [];
        for(i=1;i<17;i++){
            allocate.push({index: i-1, gb: i});
        }
        return {list: allocate, total_memory: 16};
    }else{
        return [];
    }
}

function getLang(){
    var appRoot = require('app-root-path');
    var path = require('path')
    const Store = require('electron-store');
    const store = new Store();
    return require(path.join(appRoot.path, '/src/languages/'+store.get('lang')+'.json'));
}

async function getLangList(){
    const fs = require('fs');
    var appRoot = require('app-root-path');
    var path = require('path')
    var listFilesLang = fs.readdirSync(path.join(appRoot.path, "/src/languages"))
    return new Promise((resolve, reject) => {
        var langsList = [];
        listFilesLang.forEach((file, index, array) => {
            var lang = require(path.join(appRoot.path, '/src/languages/'+file))
            langsList.push(lang.infos);
            if (index === array.length -1) resolve(langsList);
        })
    })
    
}

function getLangInfos(){
    var lang = getLang();
    if(lang.hasOwnProperty("infos")){
        return lang.infos;
    }else{
        console.log("infos is not found in configuration file.")
        return "";
    }
}

function getLangKey(key, replaceArr){
    var lang = getLang();
    if(lang.keys.hasOwnProperty(key)){
        var resFind = lang.keys[key];
        if(replaceArr !== undefined){
            replaceArr.forEach((item) => {
                resFind = resFind.replaceAll(item.search, item.replace)
            })
        }
        return resFind;
    }else{
        console.log(key+ " is not found in configuration file.")
        return key;
    }
}

function javaversion(dirLaucher, callback) {
    const path = require('path')
    var javaExecutable = path.join(dirLaucher, "runtime/bin/java.exe");
    var spawn = require('child_process').spawn(javaExecutable, ['-version']);
    spawn.on('error', function(err){
        return callback(err, null);
    })
    spawn.stderr.on('data', function(data) {
        data = data.toString().split('\n')[0];
        var javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
        if (javaVersion != false) {
            return callback(null, javaVersion);
        } else {
        }
    });
}

module.exports = { UrlExists, ExecuteCodeJS, initCustomTlBar, getLangList, getLangInfos, getLangKey, initVariableEJS, getLang, storeDataEJS, loadURL, showOpenFileDialog, listRamAllocate, download, javaversion }