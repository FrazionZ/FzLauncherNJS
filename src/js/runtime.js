const FZUtils = require('./utils.js')
const fs = require('fs')
const path = require('path')
const { ipcRenderer } = require('electron')
const onezip = require('onezip')

class Runtime {

    constructor(dirRuntime){
        //DETERMINE JAVA VERSION
        var dirRuntime = path.resolve(dirRuntime)
        if(!fs.existsSync(dirRuntime))
            fs.mkdirSync(dirRuntime, '777')
        var fileZipRuntime = path.join(dirRuntime, "jre.zip")
        document.getElementById('download-label').innerHTML = "Téléchargement de Java"
        var url = "https://download.frazionz.net/FZLauncher/runtime/";
        if(process.arch === "x64")
            FZUtils.download(null, url+"/64/jre1.8.0_291.zip", fileZipRuntime, false, undefined).then((result) => { if(result) this.finalizeUnzip(fileZipRuntime, dirRuntime) });
        else if(process.arch === "x32")
            FZUtils.download(null, url+"/32/jre1.8.0_301.zip", fileZipRuntime, dialog, undefined).then((result) => { if(result) this.finalizeUnzip(fileZipRuntime, dirRuntime) });
    }

    finalizeUnzip(fileZipDepend, dirRuntime){
        document.getElementById('download-label').innerHTML = "Extraction de Java"
        if(fileZipDepend !== undefined) {
            const pack = onezip.extract(fileZipDepend, dirRuntime);
                        
            pack.on('progress', (percent) => {
                document.getElementById('downloadbar').value = percent
            });
                        
            pack.on('error', (error) => {
                console.error(error);
                ipcRenderer.send('loadAppAfterUpdate');
            });
                        
            pack.on('end', () => {
                fs.unlinkSync(fileZipDepend)
                ipcRenderer.send('loadAppAfterUpdate');
            });
        }else
            ipcRenderer.send('loadAppAfterUpdate');
    }

}

module.exports = Runtime;