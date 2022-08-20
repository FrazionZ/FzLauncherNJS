const main = require('@electron/remote/main');
const { default: axios } = require('axios');

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

async function checkUpdate(){
    const axios = require('axios').default;
    return new Promise(async (resolve, reject) => {
        await axios.get('https://download.frazionz.net/serverNodeJS/?branch=windows').then((response) => {
            var result = response.data;
            resolve((result.version != require('../../../package.json').version));
        })
    })
}

async function initVariableEJS(data, init){
    const rootPath = require('electron-root-path').rootPath;
    var appRoot = require('app-root-path');
    const axios = require('axios').default;
    const path = require('path')
    const fs = require('fs');
    const Store = require('electron-store')
    const FZUtils = require('./utils.js')
    let servers;
    if(typeof init == "boolean" && init == false){
        servers = require(path.join(appRoot.path, "server_config.json"));
    }
    store = new Store({accessPropertiesByDotNotation: false});
    let configLauncher;

    //LAUNCHER DIR DATAS APPDATA
    var appData = ((process.platform == "linux" || process.platform == "darwin") ? process.env.HOME : process.env.APPDATA)
    
    var dirFzLauncherRoot = path.join(appData, ".FrazionzLauncher");
    var dirFzLauncherDatas = path.join(dirFzLauncherRoot, "Launcher");
    var shelfFzLauncherSkins = path.join(dirFzLauncherDatas, "skins.json");
    const shelfFzLauncherSkinsJson = require(path.join(shelfFzLauncherSkins));

    await axios.get('https://api.frazionz.net/launcher')
        .then((response) => {
            configLauncher = response.data;
        })
        .catch((err) => {
            console.log('Error: ' + err);
        })
    var initDatas = [
        {
            "servers": servers,
            "server_current": {
                idServer: 0,
                server: ((servers !== undefined) ? servers[0] : undefined),
            },  

            "configLauncher": configLauncher,
            "appRoot": require('app-root-path'),
            "path": path,
            "FZUtils": FZUtils, 
            "countSkins": shelfFzLauncherSkinsJson.length,
            "srcDir": path.join(__dirname, '../../../src/').replaceAll('\\', '/'),
            "language": ((store.has('lang')) ? require('../../languages/'+store.get('lang')+'.json') : Fr),
            "rootDirPath": path.join(rootPath).replaceAll('\\', '\\\\'),
            "rootDirPathNF": path.join(rootPath),
            "processVersions": process.versions,
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

async function openURLExternal(url) {
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('openUrlExternal', {url: url});
}

async function storeDataEJS(key, data){
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('ejseData', {key: data, data: data});
}

async function removeKeyInArr(arr, key){
    for( var i = 0; i < arr.length; i++){                  
        if ( arr[i] === key) { 
            arr.splice(i, 1); 
            i--; 
        }
    }
    return arr;
}

async function getSkinsFile(){
    var appData = ((process.platform == "linux" || process.platform == "darwin") ? process.env.HOME : process.env.APPDATA)
    
    var dirFzLauncherRoot = path.join(appData, ".FrazionzLauncher");
    var dirFzLauncherDatas = path.join(dirFzLauncherRoot, "Launcher");
    return path.join(dirFzLauncherDatas, "skins.json");
}

async function storeSkinShelf(name, base64){
    const fs = require("fs");
    const path = require("path");
    const { v4: uuidv4 } = require('uuid');

    var shelfFzLauncherSkins = await getSkinsFile();

    const skinsJson = require(path.join(shelfFzLauncherSkins));
    var checkSkinExit = async() => {
        return new Promise((resolve, reject) => {
            skinsJson.forEach((skin, key, array) => {
                if(skin.base64 == base64)
                    resolve(true);
                if (key === array.length -1) resolve(false);
            })
            if(skinsJson.length == 0) resolve(false);
        })
    }
    await checkSkinExit().then((result) => {
        if(!result){
            skinsJson.push({id: uuidv4(), name: name, base64: base64, model: "steve"});
            fs.writeFileSync(shelfFzLauncherSkins, JSON.stringify(skinsJson));
        }
    })
}

async function getSkinFromB64(b64Skin){
    const path = require("path");

    var shelfFzLauncherSkins = await getSkinsFile();

    const skinsJson = require(path.join(shelfFzLauncherSkins));
    return new Promise((resolve, reject) => {
        skinsJson.forEach((skin, key, array) => {
            if(skin.base64 == b64Skin)
                resolve(skin);
            if (key === array.length -1) resolve(null);
        })
        if(skinsJson.length == 0) resolve(null);
    })
}

async function getSkinFromID(idSkin){
    const fs = require("fs");
    const path = require("path");
    const { v4: uuidv4 } = require('uuid');

    var shelfFzLauncherSkins = await getSkinsFile();

    const skinsJson = require(path.join(shelfFzLauncherSkins));
    return new Promise((resolve, reject) => {
        skinsJson.forEach((skin, key, array) => {
            if(skin.id == idSkin)
                resolve(skin);
            if (key === array.length -1) resolve(null);
        })
        if(skinsJson.length == 0) resolve(null);
    })
}

async function encryptString(str){
    const { safeStorage } = require('electron')
    return safeStorage.encryptString(str)
}

async function decryptString(str){
    const { safeStorage } = require('electron')
    return safeStorage.decryptString(str)
}

async function deleteSkinData(idSkin){
    const fs = require("fs");
    var skinFileJson = await getSkinsFile();
    const skinsJson = require(skinFileJson);
    skinData = await getSkinFromID(idSkin);
    return new Promise((resolve, reject) => {
        if(skinData !== undefined){
            skinsJson.forEach((skin, key, array) => {
                if(skin.id == idSkin)
                    array.splice(key, 1);
            });
            fs.writeFileSync(skinFileJson, JSON.stringify(skinsJson));
            resolve(true);
        }else
            resolve(false);
    })
}

async function updateSkinData(idSkin, key, value){
    const fs = require("fs");
    var skinFileJson = await getSkinsFile();
    const skinsJson = require(skinFileJson);
    skinData = await getSkinFromID(idSkin);
    return new Promise((resolve, reject) => {
        if(skinData !== undefined){
            switch(key){
                case "name":
                    skinData.name = value;
                    break;
                case "model":
                    skinData.model = value;
                    break;
                default:
                    break;
            }
            skinsJson.forEach((skin, key, array) => {
                if(skin.id == idSkin)
                    array[key] = skinData;
            });
            fs.writeFileSync(skinFileJson, JSON.stringify(skinsJson));
            resolve(true);
        }else
            resolve(false);
    })
}

async function getImageDimensions(file) {
    return new Promise (function (resolved, rejected) {
      var i = new Image()
      i.onload = function(){
        resolved({w: i.width, h: i.height})
      };
      i.src = file
    })
  }

async function checkRulesSize(file, checkWidth, checkHeight){
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (e) {
            var image = new Image();
            image.src = e.target.result;
            image.onload = function () {
                var height = this.height;
                var width = this.width;
                if(height == checkWidth && width == checkHeight)
                    resolve(true);
                else
                    resolve(false);
            };
        };
    })
}

async function checkedIfinecraftAlreadyLaunch(){
    var fs = require('fs');
    var path = require('path');
    return new Promise(async (resolve, reject) => {
        dirFzLauncherRoot = process.env.APPDATA  + "\\.FrazionzLauncher" || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share") + ".FrazionzLauncher";
        dirFzLauncherDatas = dirFzLauncherRoot + "\\Launcher";
        dirFzLauncherServer = dirFzLauncherRoot + "\\Servers";
        await fs.readdir(dirFzLauncherServer, async function (err, files) {
            //handling error
            if (!err) {
                files.forEach(async function (file, key, array) {
                    var dirServ = path.join(dirFzLauncherServer, file);
                    if(fs.lstatSync(dirServ).isDirectory()){
                        var minecraftjar = path.join(dirServ, "minecraft.jar");
                        fs.promises.rename(minecraftjar, minecraftjar).then((result) => {
                            if (key === array.length -1) resolve(false);
                        }).catch(async (err) => {
                            if(err.code == "EBUSY")
                                resolve(true);
                            if (key === array.length -1) resolve(false);
                        });
                    }
                });
            }
        });
    })
}

async function resizeImage(url, width, height, x, y, callback) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext('2d');
    var imageObj = new Image();

    // set canvas dimensions

    canvas.width = width;
    canvas.height = height;
    
    context.scale(10, 6);

    imageObj.onload = function () {
        context.drawImage(imageObj, x, y, width, height, 32, 32, width, height);
        callback(canvas.toDataURL());
    };

    imageObj.src = url;
}

async function getSortedFilesByDate(dir) {
    const fs = require('fs');
    const files = await fs.promises.readdir(dir);
  
    return new Promise((resolve, reject) => {
        resolve(files
            .map(fileName => ({
              name: fileName,
              time: fs.statSync(`${dir}/${fileName}`).mtime.getTime(),
            }))
            .sort((a, b) =>  b.time - a.time)
            .map(file => file.name));
    }); 
}

async function download(instance, installerfileURL, installerfilename, dialog, type, branch) {
    const fs = require('fs')
    const path = require('path')
    const Store = require('electron-store')
    const { v4: uuidv4 } = require('uuid');
    var uuidDl = uuidv4();
    if(dialog){
        downloads.addDownload(uuidDl)
        downloadsList.push({uuidDl: uuidDl, title: type+" - Téléchargement des fichiers", subtitle: " - ", percentage: 0, finish: false});
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
                downloads.updateDownload(uuidDl, type+" - Téléchargement des fichiers", installerfilename, parseInt(percentage, 10).toString())
            }else{
                document.getElementById('downloadpercent').innerHTML = parseInt(percentage)+'%';
                document.getElementById('downloadbar').style.width = percentage+'%';
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

function getLang(key){
    var appRoot = require('app-root-path');
    var path = require('path')
    return require(path.join(appRoot.path, '/src/languages/'+key+'.json'));
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
    const Store = require('electron-store');
    const store = new Store();
    var lang = getLang(store.get('lang'));
    if(lang.hasOwnProperty("infos")){
        return lang.infos;
    }else{
        console.log("infos is not found in configuration file.")
        return "";
    }
}

function getLangKey(key, replaceArr, defaultLang){
    const Store = require('electron-store');
    const store = new Store();
    var lang = getLang((defaultLang) ? "fr" : store.get('lang'));

    if(lang.keys.hasOwnProperty(key)){
        var resFind = lang.keys[key];
        if(replaceArr !== undefined){
            replaceArr.forEach((item) => {
                resFind = resFind.replaceAll(item.search, item.replace)
            })
        }
        return resFind;
    }else{
        if(defaultLang){
            console.log(key+ " is not found in configuration file.")
            return key;
        }else
            return getLangKey(key, replaceArr, true);
    }
}

async function createRipple(event) {
    const button = event[0];
  
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
  
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");
  
    const ripple = button.getElementsByClassName("ripple")[0];
  
    if (ripple) {
      ripple.remove();
    }
  
    button.appendChild(circle);
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

module.exports = { UrlExists, ExecuteCodeJS, initCustomTlBar, createRipple, encryptString, decryptString, checkRulesSize, checkUpdate, removeKeyInArr, getSkinFromB64, resizeImage, deleteSkinData, getSkinsFile, storeSkinShelf, getSkinFromID, getImageDimensions, updateSkinData, getSortedFilesByDate, checkedIfinecraftAlreadyLaunch, openURLExternal, getLangList, getLangInfos, getLangKey, initVariableEJS, getLang, storeDataEJS, loadURL, showOpenFileDialog, listRamAllocate, download, javaversion }