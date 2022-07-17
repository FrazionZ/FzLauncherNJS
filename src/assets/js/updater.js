const { ipcRenderer } = require('electron');
const { app } = require('@electron/remote');
var appRoot = require('app-root-path');
const EAU = require('electron-asar-hot-updater');
const path = require('path')
const FZUtils = require(path.join(appRoot.path, '/src/assets/js/utils.js'))
const fs = require('fs')
EAU.init({
    'api': 'https://download.frazionz.net/serverNodeJS/',
    'server': false,
    'debug': false,
    'body': {
      name: dataPackage().name,
      current: dataPackage().version
    },
    'formatRes': function(res) { return res }
  });

  EAU.check(function (error, last, body) {
    if (error) {
      if (error === 'no_update_available') { 
        document.querySelector('body').innerHTML = "";
        ipcRenderer.send('loadAppAfterUpdate');
        return false; 
      }
      if (error === 'version_not_specified' && process.env.NODE_ENV === 'development') {
        document.querySelector('body').innerHTML = "";
        ipcRenderer.send('loadAppAfterUpdate');
        return false 
      }
      document.querySelector('body').innerHTML = "";
      ipcRenderer.send('loadAppAfterUpdate');
      return false
    }

    EAU.progress(function (state) {
      var percent = Math.round(state.percent * 100);
      document.getElementById('downloadhtml').innerHTML = FZUtils.getLangKey('updater.in_progress')
      document.getElementById('downloadpercent').innerHTML = percent+"%";
      document.getElementById('downloadbar').style.width = percent+'%';
    })

    EAU.download(function (error) {
        app.exit()
        process.exit()
    })
});

jQuery(function() { 
  ipcRenderer.send('showApp')
})

$('.window_reduce').on('click', () => {
  ipcRenderer.send('reduceWindow');
}); 
$('.window_close').on('click', () => {
  ipcRenderer.send('closeApp');
});

function dataPackage(){
    const appRoot = require('app-root-path');
    let rawdata = fs.readFileSync(appRoot.path+'\\package.json')
    let json = JSON.parse(rawdata);
    return json;
}