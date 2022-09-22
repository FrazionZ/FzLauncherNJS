const { ipcRenderer } = require('electron');
const { app } = require('@electron/remote');
var appRoot = require('app-root-path');
const EAU = require('electron-asar-hot-updater');
const path = require('path')
const FZUtils = require(path.join(appRoot.path, '/src/assets/js/utils.js'))
const fs = require('fs')
let branch;
switch(process.platform){
  case "linux":
    branch = "linux";
    break;
  case "win32":
  default:
    branch = "windows";
    break;
}
EAU.init({
    'api': 'https://download.frazionz.net/serverNodeJS/?branch='+branch,
    'server': false,
    'debug': false,
    'body': {
      name: dataPackage().name,
      current: dataPackage().version
    },
    'formatRes': function(res) { return res }
  });

  EAU.check(function (error, last, body) {
    console.log(body)
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
    const path = require('path')
    let rawdata = fs.readFileSync(path.join(appRoot.path, "package.json"))
    let json = JSON.parse(rawdata);
    return json;
}