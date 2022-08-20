var appRoot = require('app-root-path');
const path = require('path')
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"))
const FZUtils = require(path.join(appRoot.path, "/src/assets/js/utils.js"));
const server_config = require(path.join(appRoot.path, '/server_config.json'));
const { ipcMain } = require('electron');
const console = require('console');
const { v4: uuidv4 } = require('uuid');

class RPacks extends FzPage {

    constructor(server){
        super(null)
        
        var instance = this;
        this.server = server_config[server];
        this.dirServer = `${this.dirFzLauncherServer}\\${this.server.name}`;

        setTimeout(() => {
            this.loadList(instance);
        }, 1500);

        $('.importPack').on('click', function() {
            var uidFile = uuidv4()
            instance.ipcRenderer.send('openFile', {id: uidFile});
            instance.ipcRenderer.on('responseOpenFile', (event, data) => {
                if(uidFile !== data.id) return;
                var file = data.file;
                var checkFiles = ["assets/", "pack.mcmeta", "pack.png"]
                var AdmZip = require("adm-zip");
                var resourceZipPath = file.filePaths[0];
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
                    var destinationFile = instance.path.join(instance.dirServer, "resourcepacks", instance.path.basename(resourceZipPath));
                    instance.fs.copyFile(resourceZipPath, destinationFile, (err) => {
                        if (err) throw err;
                        instance.notyf('success', 'Le pack a bien été importé');
                    });
                })
            })
        })
    }

    async loadList(instance){
        $.get('https://api.frazionz.net/faction/rpacks/all', function(response) {

            var loadRpacks = new Promise((resolve, reject) => {
                
                $('#rpacks_list').empty();
    
                response.forEach((rpack, k, array) => {
                    
                    let clones = [];
                    if ("content" in document.createElement("template")) {
                        // On prépare une ligne pour le tableau
                        var template = document.querySelector("#rpacks_list");
                        
                        var crypto = require('crypto');
                        var tbody = document.querySelector("#rpacks_list");
                        var clone = document.importNode(template.content, true);
                        clone.querySelector('#rpack__icon').setAttribute('src', 'https://frazionz.net/storage/rpacks/'+rpack.uid+'/icon.png')
                        clone.querySelector('#rpack__name').textContent = rpack.name
                        clone.querySelector('#rpack__description').textContent = rpack.description
                        if(rpack.description.length > 90) clone.querySelector('#rpack__description').textContent = rpack.description.substring(0,90)+"...";
                        clone.querySelector('#rpack__author').textContent = FZUtils.getLangKey("server.rpacks.author", [{search: "%author__name%", replace: rpack.author}])

                        clone.querySelector('#rpack__view').onclick = function() {  
                            layoutClass.loadDialog('rpackdetails', [{rpack: rpack}], "server");
                        };

                        //STATE 0=DOWNLOAD 1=DELETE 2=UPDATE
                        var state = 0
                        var dirPacks = "resourcepacks/"+rpack.name.replaceAll(' ', '_').toLowerCase()+".zip";
                        var pathFile = instance.path.join(instance.dirServer, dirPacks);
                        var packExist = instance.fs.existsSync(pathFile);
                        if(packExist){
                            var fsFile = instance.fs.readFileSync(pathFile);
                            var sha1sum = crypto.createHash('sha1').update(fsFile).digest("hex");
                            if(sha1sum == rpack.sha1) state = 1; else state = 2;
                        }

                        if(state == 0){
                            clone.querySelector('#rpack__action').innerHTML = "<i class='fa-solid fa-circle-arrow-down'></i>";
                            clone.querySelector('#rpack__action').classList.add('download');
                            clone.querySelector('#rpack__action').onclick = function() {  
                                this.classList.add('disabled')
                                    instance.downloadPack(instance, rpack, pathFile, false).then(() => {
                                }); 
                            };
                        }else if(state == 1){
                            clone.querySelector('#rpack__action').innerHTML = "<i class='fa-solid fa-trash-can'></i>";
                            clone.querySelector('#rpack__action').classList.add('delete');
                            clone.querySelector('#rpack__action').onclick = function() {  
                                this.classList.add('disabled')
                                instance.deletePack(instance, rpack, pathFile).then(() => {
                                });  
                            };
                        }else if(state == 2){
                            clone.querySelector('#rpack__action').innerHTML = "<i class='fa-solid fa-arrow-up'></i>";
                            clone.querySelector('#rpack__action').classList.add('update');
                            clone.querySelector('#rpack__action').onclick = function() {  
                                this.classList.add('disabled')
                                instance.updatePack(instance, rpack, pathFile).then(() => {
                                });  
                            };
                        }
                        
    
                        tbody.appendChild(clone);
                        clones.push(clone)
                    }
    
                    if (k === array.length -1) resolve(clones);
    
                })
            })
    
            loadRpacks.then(() => {
                $('.rpack .skeleton').remove();
            })
        })
        .fail(function (error) {
            this.notyf('error', 'Impossile de récupérer les resources packs')
        });
    }

    async downloadPack(instance, rpack, dir, isUpdate){
        return new Promise((resolve, reject) => {
            var exist = this.fs.existsSync(instance.path.join(instance.dirServer, "resourcepacks"));
            if(!exist){
                this.notyf('error', 'Impossible de télécharger le pack, le dossier cible n\'existe pas.');
                return resolve();
            }
            FZUtils.download(instance, "https://frazionz.net/storage/rpacks/"+rpack.uid+"/pack.zip", dir, true, "Resources Pack", undefined).then((result) => {
                this.loadList(instance);
                this.notyf('success', 'Le pack a bien été '+((isUpdate) ? "mis à jour" : "téléchargé"))
                return resolve();
            }).catch((err) => {
                console.log(err); 
                return resolve();
            });
        });
    }

    async deletePack(instance, rpack, dir){
        return new Promise((resolve, reject) => {
            this.fs.unlink(dir, (err) => {
                this.loadList(instance);
                if(err) return this.notyf('error', err);
                this.notyf('success', 'Le pack a bien été supprimé')
            });
        });
    }

    async updatePack(instance, rpack, dir){
        return new Promise((resolve, reject) => {
            this.fs.unlinkSync(dir)
            downloadPack(instance, rpack, dir, true)
        });
    }

}


module.exports = RPacks;
