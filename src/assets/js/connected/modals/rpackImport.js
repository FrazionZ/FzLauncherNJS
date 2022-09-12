var appRoot = require('app-root-path');
const path = require('path')
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"))
const FZUtils = require(path.join(appRoot.path, "/src/assets/js/utils.js"));
const server_config = require(path.join(appRoot.path, '/server_config.json'));
const { shell } = require('electron');
const console = require('console');
const { v4: uuidv4 } = require('uuid');
var JSZip = require("jszip");
const { async } = require('node-stream-zip');
var zip = new JSZip();
class RPackImport extends FzPage {

    constructor(server){
        super(null)
        
        var instance = this;
        this.server = server_config[server];
        this.dirServer = `${this.dirFzLauncherServer}\\${this.server.name}`;
        this.resourcePackPath = instance.path.join(instance.dirServer, "resourcepacks");
        setTimeout(() => {
            this.loadList(instance);
        }, 1500);
        
        const importRpack = async(filePath) => {
            layoutClass.loadModal( "messDialog", [{message: "Importation du resource pack en cours.."}], false, () => {})
            var checkFiles = ["assets/", "pack.mcmeta", "pack.png"]
            var AdmZip = require("adm-zip");
            var resourceZipPath = filePath;
            var zip = new AdmZip(resourceZipPath);
            var zipEntries = zip.getEntries();
            var allFiles = [];
            zipEntries.forEach(function(entry) {
                allFiles.push(entry.entryName);
            })
            var checkValidRPack = async() => {
                return new Promise((resolve, reject) => {
                    checkFiles.forEach(function(zipEntry, index, array) {
                        if(!allFiles.includes(zipEntry))
                            resolve({result: false, message: zipEntry.entryName+" n'est pas un fichier valide"});
                        if(index == array.length - 1) resolve({result: true, message: "Le pack est valide"});
                    })
                })
            }
            checkValidRPack().then((result) => {
                if(result == false) return instance.notyf('error', result.message);
                if(!instance.fs.existsSync(instance.resourcePackPath))
                    instance.fs.mkdirSync(instance.resourcePackPath)
                var destinationFile = instance.path.join(instance.resourcePackPath, instance.path.basename(resourceZipPath));
                instance.fs.copyFile(resourceZipPath, destinationFile, async (err) => {
                    if (err) throw err;
                    await appendZip(destinationFile, (archive) => {
                        const buffer3 = Buffer.from(JSON.stringify({fzdata: "import"}));
                        archive.append(buffer3, { name: 'data.json' });
                    });
                    loadServerTab($('.menu .item[data-tab="config"]'), "config", true);
                    instance.notyf('success', 'Le pack a bien été importé');
                    layoutClass.closeModal();
                });
            })
        }


        $('#rpackImport.fzmodal .dropZone.importPack').on('click', function() {
                    layoutClass.closeModal();
                    instance.ipcRenderer.send('openFile', {});
                    instance.ipcRenderer.on('cancelOpenFile', async(event, data) => {
                        instance.openListPackImport(rpackImport);
                    })
                    instance.ipcRenderer.on('responseOpenFile', async(event, data) => {
                        importRpack(data.file.filePath[0])
                    })
                  })

        
    }

    async dropHandler(ev){
      if (ev.dataTransfer.items) {
        var item = [...ev.dataTransfer.items][0];
        if (item.kind === 'file') {
          layoutClass.closeModal();
          const file = item.getAsFile();
          importRpack(file.path);
        }
      }
      $('.dropZone.importPack').removeClass('dropping')
    }
  
    async dragOverLeave(ev){
      ev.preventDefault();
      $('.dropZone.importPack').removeClass('dropping')
    }
  
    async dragOverHandler(ev) {
      ev.preventDefault();
      $('.dropZone.importPack').addClass('dropping')
    }

}


module.exports = RPackImport;
