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
class RPacks extends FzPage {

    constructor(server){
        super(null)
        
        var instance = this;
        this.server = server_config[server];
        this.dirServer = `${this.dirFzLauncherServer}\\${this.server.name}`;
        this.resourcePackPath = instance.path.join(instance.dirServer, "resourcepacks");
        setTimeout(() => {
            this.loadList(instance);
        }, 1500);

        $('.openPathPack').on('click', function() {
            shell.openPath(instance.resourcePackPath);
        })

        if(!this.fs.existsSync(this.resourcePackPath))
            this.fs.mkdirSync(this.resourcePackPath)
        
        var openListPackImport = async(rpackImport) => {
            instance.ipcRenderer.removeAllListeners('openFile')
            instance.ipcRenderer.removeAllListeners('cancelOpenFile')
            instance.ipcRenderer.removeAllListeners('responseOpenFile')
            layoutClass.loadModal( "rpackImport", [{rpackImportData: rpackImport, instanceRpackParent: instance}], true, () => {}, () => {}, () => {})
        }

        $('.rpackImportList').on('click', function() {
            instance.fs.readdir(instance.resourcePackPath, async (err, files) => {
                if (err) return console.log(err);
                else {
                    var retrieveImportRpack = () => {
                        return new Promise(async (resolve, reject) => {
                            const rpackImport = [];
                            var i = 0;
                            if(files.length == 0)
                                resolve(rpackImport);
                            for(var file of files){
                                const zipResult = await FZUtils.readZip(instance.path.join(instance.resourcePackPath, file))
                                var checkFileZip = async () => {
                                    return new Promise(async (res) => {
                                        var data = {zipImport: undefined, file: file, mcMetaJson: undefined, icon: undefined};
                                        try {
                                            var mcMetaJson = JSON.parse(zipResult.zip.entryDataSync('pack.mcmeta').toString());
                                            var dataJson = ((JSON.parse(zipResult.zip.entryDataSync('data.json').toString())?.fzdata == "import") ? true : false);
                                            var icon = zipResult.zip.entryDataSync('pack.png').toString('base64');
                                            data.zipImport = dataJson;
                                            data.icon = icon;
                                            data.mcMetaJson = mineParse(mcMetaJson?.pack?.description).raw;
                                            res(data);
                                        }catch(e){
                                            data.zipImport = false;
                                            data.icon = undefined;
                                            res(data);
                                        }
                                    })
                                }
                                await checkFileZip().then((data) => {
                                    if(data !== undefined)
                                        if(data.zipImport)
                                            rpackImport.push(data);
                                    zipResult.zip.close();
                                })
                                i++;
                                if (i === files.length){
                                    resolve(rpackImport);
                                }
                            }
                        })
                    }
                    await retrieveImportRpack().then((rpackImport) => {
                        openListPackImport(rpackImport)  
                    })
                }
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
                                this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
                                instance.downloadPack(instance, rpack, pathFile, false).then(() => {
                                    instance.loadList(instance);
                                }); 
                            };
                        }else if(state == 1){
                            clone.querySelector('#rpack__action').innerHTML = "<i class='fa-solid fa-trash-can'></i>";
                            clone.querySelector('#rpack__action').classList.add('delete');
                            clone.querySelector('#rpack__action').onclick = function() {  
                                this.classList.add('disabled')
                                this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
                                instance.deletePack(instance, rpack, pathFile).then(() => {
                                    instance.loadList(instance);
                                });  
                            };
                        }else if(state == 2){
                            clone.querySelector('#rpack__action').innerHTML = "<i class='fa-solid fa-arrow-up'></i>";
                            clone.querySelector('#rpack__action').classList.add('update');
                            clone.querySelector('#rpack__action').onclick = function() {  
                                this.classList.add('disabled')
                                this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
                                instance.updatePack(instance, rpack, pathFile).then(() => {
                                    instance.loadList(instance);
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
            FZUtils.download(instance, "https://frazionz.net/storage/rpacks/"+rpack.uid+"/pack.zip", dir, true, "Resources Pack", undefined).then(async (result) => {
                /*await appendZip(dir, (archive) => {
                    const buffer3 = Buffer.from(JSON.stringify({fzdata: "download"}));
                    archive.append(buffer3, { name: 'data.json' });
                });*/

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
            this.downloadPack(instance, rpack, dir, true)
        });
    }

}


module.exports = RPacks;
