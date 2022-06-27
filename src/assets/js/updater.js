/*    
const Login = require('./src/js/login.js')
const login = new Login();
login.showPage(true); */
const { ipcRenderer } = require('electron');
const { app } = require('@electron/remote');
const EAU = require('electron-asar-hot-updater');
const fs = require('fs')
EAU.init({
    'api': 'https://download.frazionz.net/serverNodeJS/', // The API EAU will talk to
    'server': false, // Where to check. true: server side, false: client side, default: true.
    'debug': false, // Default: false.
    'body': {
      name: dataPackage().name,
      current: dataPackage().version
    },
    'formatRes': function(res) { return res } // Optional,Format the EAU.check response body, exemple => {version: xx, asar: xx}
  });

  EAU.check(function (error, last, body) {
    if (error) {
      if (error === 'no_update_available') { 
        ipcRenderer.send('loadAppAfterUpdate');
        return false; 
      }
      if (error === 'version_not_specified' && process.env.NODE_ENV === 'development') { 
        ipcRenderer.send('loadAppAfterUpdate');
        return false 
      }
      ipcRenderer.send('loadAppAfterUpdate');
      return false
    }

    EAU.progress(function (state) {
      var percent = Math.round(state.percent * 100);
      document.getElementById('downloadbar').value = percent
    })

    EAU.download(function (error) {
        app.exit()
        process.exit()
    })
});

function dataPackage(){
    const appRoot = require('app-root-path');
    let rawdata = fs.readFileSync(appRoot.path+'\\package.json')
    let json = JSON.parse(rawdata);
    return json;
}