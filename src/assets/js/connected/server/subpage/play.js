const fs = require('fs');
var appRoot = require('app-root-path');
const path = require('path')
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"))
const os = require('os');
const onezip = require('onezip');
const { v4: uuidv4 } = require('uuid');
const { Client } = require('minecraft-launcher-core');
const { async } = require('node-stream-zip');
const axios = require('axios').default;
const launcher = new Client();

class Play  extends FzPage {

    constructor(server){
        super(null)
        this.server = server_config[server];
        this.lang = FZUtils.getLang(this.store.get('lang'));
        this.dirServer = path.join(this.dirFzLauncherServer, this.server.name);
        this.buttonActionPlay = $('.btn-download-launch-game');
        this.dlDialog = undefined;
        this.gameLaunched = false;
        this.keyStoreBranch = function(branch, categorie) {
            return 'server_'+this.server.name.toLowerCase()+'_'+branch+'_'+categorie+'_version';
        }

        this.keyStoreServerOptions = function(key) {
            return 'server_'+this.server.name.toLowerCase()+'_'+key;
        }

        this.loadBranch().then((repoServer) => {});

        $('.server-expl').text(this.store.get('serverCurrent').server.expl_server) 


    }

    async loadBranch(){
        if(!this.store.has(this.keyStoreServerOptions('branch')))
            this.store.set(this.keyStoreServerOptions('branch'), this.server.defaultBranch)

        this.repoServer = [];
        this.branch = this.store.get(this.keyStoreServerOptions('branch'))
        return new Promise((resolve, reject) => {
            this.server.github.forEach((github) => {
                if(this.branch == github.branch){
                    var branch = github.branch;
                    github.categories.forEach((categorie, index, array) => {
                        this.repoServer.push({ksb: this.keyStoreBranch(branch, categorie.name), branch: github.branch, categorie: categorie, url: "https://api.frazionz.net/servers/"+this.server.id+"/"+branch+"/"+categorie.name })
                        if (index === array.length -1) resolve(this.repoServer);
                    })
                }
            })
        })
    }

    async preInit(){
        var instance = this;
        return new Promise(async (resolve, reject) => {
            setTimeout(async () => {
                await instance.checkIfJavaHomeExist().then(async (result) => {
                    var dirsFilesObligate = [{name: this.server.jarFileMain, isInstalled: false}];
                    var needsToBeInstall = false;
                    var needsToBeRepare = false;
                    var needsToBeUpdate = false;
                    var canPlay = false;
                    var dirExists = instance.fs.existsSync(instance.path.join(instance.dirServer))
                    if(!dirExists){
                        needsToBeInstall = true;
                    }else{
                        var files = instance.fs.readdirSync(instance.path.join(instance.dirServer, "versions", instance.store.get(instance.keyStoreServerOptions('branch'))));
                        dirsFilesObligate.forEach((v, k) => {
                            files.forEach(file => {
                                if(file == v.name){
                                    dirsFilesObligate[k].isInstalled = true;
                                }
                            })
                        })
                        dirsFilesObligate.forEach((v) => {
                            if(!v.isInstalled){
                                needsToBeInstall = true;
                                return;
                            }
                        })
                    }
                    var checkUpdateAvailable = async() => {
                        return new Promise(async (resolve, reject) => {
                            var repos = instance.repoServer;
                            let reposUpdateAvailable = [];
                            var index = 0;
                            for await (const repo of repos) {
                                await instance.checkUpdate(repo).then(async (response) => {
                                    console.log(response)
                                    if(response.result)
                                        reposUpdateAvailable.push({ github: response, repos: repo, ksb: repo.ksb });
                                    console.log(index, repos.length-1)
                                    if (index === repos.length-1) resolve({ repos: reposUpdateAvailable }); else index++;
                                }).catch((err) => {
                                    console.log(err)
                                    if (index === repos.length-1) resolve({ repos: reposUpdateAvailable });else index++;
                                })
                            }
                        })
                    };
                    if(!needsToBeRepare && !needsToBeInstall){
                        canPlay = true;
                        await checkUpdateAvailable().then(async (resultCUP) => {
                            if(resultCUP.repos.length > 0){
                                canPlay = false;
                                needsToBeUpdate = true;
                            }else{
                                canPlay = true;
                                needsToBeUpdate = false;
                            }
                            await this.init(instance, canPlay, needsToBeInstall, needsToBeRepare, needsToBeUpdate, resultCUP)
                            resolve(instance.repoServer);
                        }).catch((err) => {
                            console.log(err)
                            resolve(instance.repoServer);
                        })
                    }else{
                        await this.init(instance, canPlay, needsToBeInstall, needsToBeRepare, needsToBeUpdate, undefined)
                        resolve(instance.repoServer);
                    }
                    
                }).catch((err) => {
                    console.log(err)
                    instance.buttonActionPlay.find('.label').text(FZUtils.getLangKey("server.play.java_nf"))
                })
            }, 50)
        });
        
 
    }

    
    async checkServerAvailable(){
        return new Promise(async (resolve, reject) => {
            var axios = require('axios').default;
            axios.get('https://api.frazionz.net/servers/available/'+this.server.id)
                .then((response) => {
                    var isAvailable = response.data.isAvailable;
                    resolve(isAvailable);
                })
                .catch((err) => {
                    reject();
                })
        })
    }

    async init(instance, canPlay, needsToBeInstall, needsToBeRepare, needsToBeUpdate, resultCUP){
        console.log(needsToBeUpdate)
        if(canPlay){

            let serverAvailable;
            await this.checkServerAvailable()
                .then((response) => {
                    serverAvailable = ((response == 1) ? true : false);
                })
                .catch((err) => {
                    serverAvailable = false;
                })
            
            if(serverAvailable){
                //PLAY ACTION
                instance.buttonActionPlay.find('.label').text(FZUtils.getLangKey("server.play.btn.play"));
                instance.buttonActionPlay.removeAttr('disabled')
                instance.buttonActionPlay.on('click', () => {
                    instance.launchGame();
                })
            }else if(!serverAvailable && this.session.role.is_bplauncher){
                instance.buttonActionPlay.find('.label').text(FZUtils.getLangKey("server.play.btn.play"));
                instance.buttonActionPlay.removeAttr('disabled')
                instance.buttonActionPlay.on('click', () => {
                    instance.launchGame();
                })
            }else{
                $('.serverUnavailble').show();
                instance.buttonActionPlay.remove()
            }
        }else if(needsToBeInstall){
            //INSTALL ACTION
            instance.buttonActionPlay.find('.label').text(FZUtils.getLangKey("server.play.btn.install"));
            instance.buttonActionPlay.removeAttr('disabled')
            $('.config__switch_branch').attr('disabled', true);
            $('.config__repare_dir').addClass('disabled');
            $('.config__clear_dir').addClass('disabled');
            instance.buttonActionPlay.on('click', () => {
                instance.buttonActionPlay.attr('disabled', 'disabled')
                instance.prepareInstallOrUpdate();
            })
        }else if(needsToBeUpdate){
            //UPDATE ACTION
            instance.buttonActionPlay.find('.label').text(FZUtils.getLangKey("server.play.btn.update"));
            instance.buttonActionPlay.removeAttr('disabled')
            $('.config__switch_branch').attr('disabled', true);
            $('.config__repare_dir').addClass('disabled');
            $('.config__clear_dir').addClass('disabled');
            instance.buttonActionPlay.on('click', () => {
                instance.buttonActionPlay.attr('disabled', 'disabled')
                instance.update(resultCUP);
            })
        }
    }

    timeConvert(n) {
        var num = n;
        var hours = (num / 60);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);
        return rhours + "h, " + rminutes + "m";
    }

    async checkIfJavaHomeExist(){
        return await new Promise(async (resolve, reject) => {
            require('find-java-home')(function(err, home) {
                if (!err) {
                    resolve(home)
                } else
                    reject(err);
            })
        });
    }

    async checkUpdate(repo){
        var instance = this;
        return new Promise(async (resolve, reject) => {
            await axios.get(repo.url).then((response) => {
                var body = response.data;
                if(instance.store.has(repo.ksb)){
                    var version = instance.store.get(repo.ksb);
                    if(version !== body.tag_name)
                        resolve({ data: body, ksb: repo.ksb, categorie: repo.categorie, result: true })
                    else
                        resolve({ data: body, ksb: repo.ksb, categorie: repo.categorie, result: false })
                }else{
                    resolve({ data: body, ksb: repo.ksb, categorie: repo.categorie, result: true })
                }
            }).catch(function(error) {
                console.log(error)
                resolve({ data: error, result: false })
            });
        })
        
    }

    async prepareInstallOrUpdate(){
        var instance = this;
        var dirExists = this.fs.existsSync(this.dirServer)
        if(!dirExists)
            this.fs.mkdirSync(this.dirServer);
        var getLinksRepos = new Promise(async (resolveLinks, reject) => {
            var links = [];
            var reposGithubResolve = new Promise((resolve, reject) => {
                this.repoServer.forEach(async (repo, index, array) => {
                    $.get( repo.url, function( data ) {
                        var body = data;
                        links.push({name: body.assets.name, dirInstall: instance.path.join(repo.categorie.dir), ksb: repo.ksb, branch: body.target_commitish, categorie: repo.categorie.name, version: body.tag_name, dlink: body.browser_download_url})
                        if (index === array.length -1) resolve();
                    }).fail(function() {
                        console.log(error);
                        reject(error)
                    });
                });
            });
            reposGithubResolve.then(() => {
                resolveLinks(links)
            })
        });
        await getLinksRepos.then((links) => {
            this.installOrRepareOrUpdate(links);
        });
    }

    async installOrRepareOrUpdate(links){
        var instance = this;
        var startLinkDL = function (index) {
            FZUtils.download(instance, links[index].dlink, instance.path.join(instance.dirServer, links[index].dirInstall, links[index].name), true, instance.server.name, links[index].branch).then((result) => {
                if(!((index + 1) == links.length))
                    startLinkDL((index + 1))
                else{
                    //CONTINUE INSTALL
                    //BRANCH DEPEND ALWAYS ZIP FILE
                    let fileZipDepend = undefined;
                    const path = require('path')
                    var files = instance.fs.readdirSync(instance.dirServer)
                    files.forEach((file) => {
                        if(file.endsWith('.zip'))
                            fileZipDepend = instance.path.join(instance.dirServer, file);
                    })

                    if(fileZipDepend !== undefined) {
                        const pack = onezip.extract(fileZipDepend, instance.dirServer);
                        var uuidDl = uuidv4();
                        downloadsList.push({uuidDl: uuidDl, title: instance.server.name+" - Extraction des dépendances", subtitle: " - ", percentage: 0, finish: false});

                        var nameCurrent = "";

                        pack.on('file', (name) => {                     
                            nameCurrent = name;
                        });
                        
                        pack.on('start', () => {});
                        
                        pack.on('progress', (percent) => {
                            downloads.updateDownload(uuidDl, instance.server.name+" - Extraction des dépendances", nameCurrent, parseInt(percent, 10).toString())
                            instance.ipcRenderer.send('progress', ((percent) / 100));
                        });
                        
                        pack.on('error', (error) => {
                            console.error(error);
                        });
                        
                        pack.on('end', () => {
                            downloads.finishDownload(uuidDl)
                            instance.prepareToLaunch(links, fileZipDepend);
                        });
                    }else
                        instance.prepareToLaunch(links, undefined);
                }
            }).catch((err) => console.log(err));
        }
        if(links.length > 0)
            startLinkDL(0);
        else {
            this.notyf('error', "Impossible d'installer, de réparer ou de mettre à jour "+this.server.name);
        }
    }

    async update(resultCUP){
        let links = [];
        var updatePromise = new Promise((resolve, reject) => {
            resultCUP.repos.forEach(async (repo, index, array) => {
                var github = repo.github.data;
                links.push({name: github.assets.name, ksb: repo.ksb, dirInstall: this.path.join(repo.repos.categorie.dir), categorie: repo.repos.categorie.name, branch: github.target_commitish, version: github.tag_name, dlink: github.browser_download_url})
                if (index === array.length -1) resolve();
            });
        })
        updatePromise.then(async() => {
            await this.installOrRepareOrUpdate(links);
        })
    }


    async prepareToLaunch(links, fileZipDepend){
        links.forEach((link) => {
            this.store.set(link.ksb, link.version)
        })
        if(fileZipDepend !== undefined)
            this.fs.unlinkSync(fileZipDepend)

        let serverAvailable;
        await this.checkServerAvailable()
            .then((response) => {
                serverAvailable = ((response == 1) ? true : false);
            })
            .catch((err) => {
                serverAvailable = false;
            })
        $('.config__switch_branch').attr('disabled', false);
        $('.config__repare_dir').removeClass('disabled');
        $('.config__clear_dir').removeClass('disabled');

        var setActionLaunch = () => {
            this.buttonActionPlay.find(".label").text("Jouer")
            this.buttonActionPlay.removeAttr("disabled")
            this.buttonActionPlay.off()
            this.buttonActionPlay.on("click", () => { this.launchGame(); })
        }

        if(serverAvailable){
            setActionLaunch();
        }else if(!serverAvailable && this.session.role.is_admin){
            setActionLaunch();
        }else{
            $('.serverUnavailble').show();
            this.buttonActionPlay.remove()
        }
    }

    launchGame(){
        var instance = this
        this.checkIfJavaHomeExist().then((javaHome) => {

            var launchGameFinal = function() {
                    if(instance.gameLaunched) return;
                    instance.buttonActionPlay.attr('disabled')
                    instance.buttonActionPlay.addClass('disabled');
                    var dirServerAssets = path.join(instance.dirServer, "assets");
                    var dirServerNatives = path.join(instance.dirServer, "natives");
                    var dirServerLibs = path.join(instance.dirServer, "libs");


                    if(instance.store.get(instance.keyStoreServerOptions('config__server_clean_autosc'))){
                        instance.fs.rm(instance.path.join(dirServerAssets, "frazionz/skins"), { recursive: true, force: true }, (err => {
                            if (err) return console.log(err);
                        }));
                    }
                
                    const StringBuilder = require("string-builder");
                    const sbLibs = new StringBuilder();
                
                    if(process.platform == "win32"){
                        fs.readdirSync(dirServerLibs).forEach(file => {
                            sbLibs.append(`"${dirServerLibs}\\${file}";`)
                        });
                    }else if(process.platform == "linux"){
                        fs.readdirSync(dirServerLibs).forEach(file => {
                            sbLibs.append('"'+path.join(dirServerLibs, file)+'":')
                        });
                    }
                
                    sbLibs.append(path.join(instance.dirServer, "versions", instance.store.get(instance.keyStoreServerOptions('branch')), instance.server.jarFileMain));
                
                    var javaRuntime = 'java';
                    if(process.platform == "win32"){
                        if(instance.store.get(instance.keyStoreServerOptions('config__server_runtime_launch'))){
                            javaRuntime = instance.path.join(instance.dirFzLauncherDatas, "runtime/bin/java.exe");
                        }
                    }

                    console.log("JavaRuntime "+javaRuntime)

                    var ramMemoryMax = "";

                    if(os.arch().includes('64')){
                        var ramAllocateIndexProperties = ((instance.store.has(instance.keyStoreServerOptions('ramIndex')) ? instance.store.get(instance.keyStoreServerOptions('ramIndex')) : 0));
                        if (ramAllocateIndexProperties !== null) {
                            ramMemoryMax = "-Xms1g -Xmx" + FZUtils.listRamAllocate().list[ramAllocateIndexProperties].gb + "G";
                        }
                    }

                    //SIZE
                    var widthDisplay = "1280";
                    var heightDisplay = "720";
                    if(instance.store.has(instance.keyStoreServerOptions("config__server_display_size"))){
                        var size = instance.store.get(instance.keyStoreServerOptions("config__server_display_size")).split(':');
                        widthDisplay = size[0];
                        heightDisplay = size[1];
                    }
                
                    
                    //var crashGame = new CrashGameDialog(false);
                    var finishGame = async (crash, logs) => {
                        //await layoutClass.closeModal("messDialog");
                        //instance.notyf('error', 'Une erreur est survenue lors de la session de jeu')
                        if(instance.store.get(instance.keyStoreServerOptions('config__server_minimise_app'))){
                            instance.gameLaunched = false;
                            ipcRenderer.send('showApp')
                            instance.buttonActionPlay.removeAttr("disabled")
                            instance.buttonActionPlay.removeClass('disabled');
                            if(crash){
                                setTimeout(() => {
                                    console.log(logs)
                                    layoutClass.loadDialog('crashgame', [], "server");
                                }, 800)
                            }
                        }
                    }

                    var processJavaLaunch = () => {
                        instance.gameLaunched = true;
                        let opts = {
                            clientPackage: null,
                            authorization: {
                                access_token: instance.session.access_token,
                                uuid: instance.session.uuid,
                                name: instance.session.username,
                                user_properties: '{}',
                            },
                            version: {
                                number: instance.server.version,
                                custom: instance.server.assetIndex
                            },
                            root: instance.dirServer,
                            memory: {
                                max: FZUtils.listRamAllocate().list[ramAllocateIndexProperties].gb+"G",
                                min: "1G"
                            },
                            features: {
                                has_custom_resolution: true
                            },
                            window: {
                                width: parseInt(widthDisplay),
                                height: parseInt(heightDisplay),
                            },
                            overrides: {
                                discordRPC: (instance.store.get(instance.keyStoreServerOptions('config__server_discord_rpc'))),
                                fullscreen: ((instance.store.get(instance.keyStoreServerOptions('config__server_display_fullscreen'))) ? true : false) ,
                                gameDirectory: instance.dirServer,
                                minecraftJar: path.join(instance.dirServer, "versions", instance.store.get(instance.keyStoreServerOptions('branch')), instance.server.jarFileMain),
                                directory: path.join(instance.dirServer, "versions", instance.store.get(instance.keyStoreServerOptions('branch'))), // where the Minecraft jar and version json are located.
                                natives: path.join(instance.dirServer, "natives"), // native directory path.
                                assetRoot: path.join(instance.dirServer, "assets"),
                                libraryRoot: path.join(instance.dirServer, "libs"),
                                cwd: '',
                                detached: true,
                                classes: [],
                                minArgs: 11,
                                maxSockets: 2
                            }
                        }

                        if(javaRuntime !== "java")
                            opts.javaPath = javaRuntime;
                        
                        launcher.launch(opts);
                        
                        launcher.on('debug', (e) => console.log(e));
                        launcher.on('data', async (e) => {
                            ipcRenderer.send('closeApp', ((instance.store.has(instance.keyStoreServerOptions('config__server_minimise_app')) ? instance.store.get(instance.keyStoreServerOptions('config__server_minimise_app')) : false)));
                        });
                    }

                    if(process.platform == "darwin" || process.platform == "linux"){
                        processJavaLaunch();
                    }else{
                        FZUtils.checkedIfinecraftAlreadyLaunch().then((result) => {
                            if(!result)
                            processJavaLaunch(); 
                        }).catch((err) => console.log(err))
                    }

                   
            }

            if(process.platform == "darwin" || process.platform == "linux"){
                launchGameFinal();
            }else{
                FZUtils.checkedIfinecraftAlreadyLaunch().then((result) => {
                    if(result)
                        return this.notyf('error', FZUtils.getLangKey('minecraft.alreadylaunch'))
                    else
                        launchGameFinal();
                }).catch((err) => console.log(err))
            }
        }).catch((err) => console.log(err))
    }
}

module.exports = Play;
