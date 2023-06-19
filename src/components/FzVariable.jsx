const Store = require('electron-store')
const path = require('path')
const fs = require('fs')
const store = new Store()
import React from "react";

class FzVariable {
  constructor(variables) {
    this.store = store
    this.path = path
    this.fs = fs
    let appData
    if (process.platform == 'linux' || process.platform == 'darwin') {
      appData = process.env.HOME
    } else if (process.platform == 'win32') {
      appData = this.store.get('launcher__dirapp_path', process.env['APPDATA'] + '\\.FrazionzLauncher')
    }
    this.dirFzLauncherRoot = path.join(appData)
    if (!this.fs.existsSync(this.dirFzLauncherRoot)) this.fs.mkdirSync(this.dirFzLauncherRoot)

    this.dirFzLauncherDatas = path.join(this.dirFzLauncherRoot, 'Launcher')
    if (!this.fs.existsSync(this.dirFzLauncherDatas)) this.fs.mkdirSync(this.dirFzLauncherDatas)

    this.dirFzLauncherCapes = path.join(this.dirFzLauncherDatas, 'capes')
    if (!this.fs.existsSync(this.dirFzLauncherCapes)) this.fs.mkdirSync(this.dirFzLauncherCapes)

    this.shelfFzLauncherCapes = path.join(this.dirFzLauncherDatas, 'capes.json')
    if (!this.fs.existsSync(this.shelfFzLauncherCapes)) this.fs.writeFileSync(this.shelfFzLauncherCapes, "[]", () => { })

    this.shelfFzLauncherSkins = path.join(this.dirFzLauncherDatas, 'skins.json')
    if (!this.fs.existsSync(this.shelfFzLauncherSkins)) this.fs.writeFileSync(this.shelfFzLauncherSkins, "[]", () => { })

    this.dirFzLauncherSkins = path.join(this.dirFzLauncherDatas, 'skins')
    if (!this.fs.existsSync(this.dirFzLauncherSkins)) this.fs.mkdirSync(this.dirFzLauncherSkins)

    this.dirFzLauncherServer = path.join(this.dirFzLauncherRoot, 'Servers')
    if (!this.fs.existsSync(this.dirFzLauncherServer)) this.fs.mkdirSync(this.dirFzLauncherServer)

    this.keyStoreBranch = function (branch, categorie) {
      return (
        'server_' +
        variables?.serverObj.name.toLowerCase() +
        '_' +
        branch +
        '_' +
        categorie +
        '_version'
      )
    }
    this.keyStoreServerOptions = function (key) {
      return 'server_' + variables?.serverObj.name.toLowerCase() + '_' + key
    }

    this.listRamAllocate = () => {
      const os = require('os');
      if (os.arch().includes('64')) {
        var total_memory = require('os').totalmem();
        var total_mem_in_kb = total_memory / 1024;
        var total_mem_in_mb = total_mem_in_kb / 1024;
        var total_mem_in_gb = total_mem_in_mb / 1024;

        total_mem_in_kb = Math.floor(total_mem_in_kb);
        total_mem_in_mb = Math.floor(total_mem_in_mb);
        total_mem_in_gb = Math.floor(total_mem_in_gb);

        total_mem_in_mb = total_mem_in_mb % 1024;
        total_mem_in_kb = total_mem_in_kb % 1024;
        total_memory = total_memory % 1024;

        var allocate = [];
        for (var i = 1; i < 17; i++) {
          allocate.push({ index: i - 1, gb: i });
        }
        return { list: allocate, total_memory: 16 };
      } else {
        return [];
      }
    }
    this.stringToDate = (_date, _format, _delimiter) => {
      var formatLowerCase = _format.toLowerCase()
      var formatItems = formatLowerCase.split(_delimiter)
      var dateItems = _date.split(_delimiter)
      var monthIndex = formatItems.indexOf('mm')
      var dayIndex = formatItems.indexOf('dd')
      var yearIndex = formatItems.indexOf('yyyy')
      var month = parseInt(dateItems[monthIndex])
      month -= 1
      var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex])
      return formatedDate
    }
    this.millisToMinutesAndSeconds = (millis) => {
      var minutes = Math.floor(millis / 60000);
      var seconds = ((millis % 60000) / 1000).toFixed(0);
      return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }
    this.UrlExists = (url) => {
      return new Promise((resolve, reject) => {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        if (http.status != 404)
          return resolve(true);
        else
          return resolve(false);
      })
    }
    this.dataURLtoFile = async (dataurl, filename) => {
      var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], filename, { type: mime });
    }
    this.checkFileExists = async(file) => {
      return fs.promises.access(file, fs.constants.F_OK)
               .then(() => true)
               .catch(() => false)
    }
    this.downloadImage = async(url, filepath) => {
      return new Promise((resolve, reject) => {
        const request = require('request')
        var req = request({
          method: 'GET',
          uri: url
        })

        req.on('response', function(response) {
          if (response.statusCode === 200) {
            req.pipe(fs.createWriteStream(filepath)
              .on('error', reject)
              .once('close', () => resolve(filepath)));
          } else {
            // Consume response data to free up memory
            req.resume();
            reject(new Error(`Request Failed With a Status Code: ${req.statusCode}`));
  
          }
        })
       
      });
    }
    this.firstUCase = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    this.replaceMonth = (str) => {
      return str.replaceAll('January', 'Janvier')
      .replaceAll('February', 'Février')
      .replaceAll('March', 'Mars')
      .replaceAll('April', 'Avril')
      .replaceAll('May', 'Mai')
      .replaceAll('June', 'Juin')
      .replaceAll('July', 'Julliet')
      .replaceAll('August', 'Août')
      .replaceAll('September', 'Septembre')
      .replaceAll('October', 'Octobre')
      .replaceAll('November', 'Novembre')
      .replaceAll('December', 'Décembre')
    }
  }

  lang(key, replaceArr) {
    //Before, search key in lang select
    let result = Object.entries(window.lang.langSelect.keys).find(lang => lang[0] == key);
    //If not found initial, search in default lang file
    if(result == undefined) result = Object.entries(window.lang.langDefault.keys).find(lang => lang[0] == key);
    //If key not found in default lang file, return key
    if(result == undefined) return key;
    else {
      let rstring = result[1];
      if(replaceArr !== undefined){
        if(replaceArr.length > 0){
          replaceArr.forEach((replace, i) => {
            rstring = rstring.replaceAll(replace.key, replace.value)
          })
          return rstring
        }else return rstring
      }else return rstring
    }
  }
}

export default FzVariable
