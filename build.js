"use strict"

const builder = require("electron-builder")
const Platform = builder.Platform
const packageJson = require('./package.json')
// Let's get that intellisense working
var child_process = require('child_process');
console.log('Encrypt file asar')
child_process.exec('asarmor -a .\\release\\'+packageJson.version+'\\win-unpacked\\resources\\app.asar -o .\\release\\'+packageJson.version+'\\win-unpacked\\resources\\asarmor.asar --bloat 1000', function (error, stdout, stderr) {
  console.log('Move file asarmor')
    child_process.exec('move .\\release\\'+packageJson.version+'\\win-unpacked\\resources\\asarmor.asar .\\release\\'+packageJson.version+'\\win-unpacked\\resources\\app.asar', function (error, stdout, stderr) {
      console.log('Rebuild installer')
      child_process.exec('npx electron-builder --pd .\\release\\'+packageJson.version+'\\win-unpacked', function (error, stdout, stderr) {
        console.log('Finish.')
      })
    })
    
});