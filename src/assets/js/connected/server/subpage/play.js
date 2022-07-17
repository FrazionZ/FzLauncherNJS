const fs = require('fs');
var appRoot = require('app-root-path');
const path = require('path')
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"))
const os = require('os');
const onezip = require('onezip');
const { v4: uuidv4 } = require('uuid');
class Play  extends FzPage {

    constructor(server){
        super(null)
        this.server = server_config[server];
        this.lang = FZUtils.getLang();
        this.dirServer = `${this.dirFzLauncherServer}\\${this.server.name}`;
        this.buttonActionPlay = $('.btn-download-launch-game');
        this.dlDialog = undefined;
        this.gameLaunched = false;
        this.keyStoreBranch = function(branch) {
            return 'server_'+this.server.name.toLowerCase()+'_'+branch+'_version';
        }

        this.keyStoreServerOptions = function(key) {
            return 'server_'+this.server.name.toLowerCase()+'_'+key;
        }

        $('.server-expl').text(this.store.get('serverCurrent').server.expl_server) 


    }

    async preInit(){
        var instance = this;
        setTimeout(async () => {
            await instance.checkIfJavaHomeExist().then(async (result) => {
                var dirsFilesObligate = [{name: 'assets', isInstalled: false}, {name: 'libs', isInstalled: false}, {name: 'natives', isInstalled: false}, {name: this.server.jarFileMain, isInstalled: false}];
                var needsToBeInstall = false;
                var needsToBeRepare = false;
                var needsToBeUpdate = false;
                var canPlay = false;
                var dirExists = instance.fs.existsSync(instance.dirServer)
                if(!dirExists){
                    needsToBeInstall = true;
                }else{
                    var files = instance.fs.readdirSync(instance.dirServer);
                    dirsFilesObligate.forEach((v, k) => {
                        files.forEach(file => {
                            if(file == v.name){
                                dirsFilesObligate[k].isInstalled = true;
                            }
                        })
                    })
                    dirsFilesObligate.forEach((v) => {
                        if(!v.isInstalled){
                            needsToBeRepare = true;
                            return;
                        }
                    })
                }
                var checkUpdateAvailable = new Promise(async (resolve, reject) => {
                    var repos = instance.server.repos;
                    console.log(repos)
                    let reposUpdateAvailable = [];
                    var loopCheckRepos = new Promise(async (resolve, reject) => {
                        await repos.forEach(async (repo, index, array) => {
                            await instance.checkUpdate(repo).then(async (response) => {
                                if(response.result)
                                    reposUpdateAvailable.push({ github: response, repos: repo });
                                if (index === array.length -1) resolve();
                            }).catch((err) => {
                                console.log(err)
                                if (index === array.length -1) resolve();
                            })

                        })
                    });
                    await loopCheckRepos.then(() => { resolve({repos: reposUpdateAvailable}); });
                });
                if(!needsToBeRepare && !needsToBeInstall){
                    canPlay = true;
                    await checkUpdateAvailable.then(async (resultCUP) => {
                        if(resultCUP.repos.length > 0){
                            canPlay = false;
                            needsToBeUpdate = true;
                        }else{
                            canPlay = true;
                            needsToBeUpdate = false;
                        }
                        await this.init(instance, canPlay, needsToBeInstall, needsToBeRepare, needsToBeUpdate, resultCUP)
                    }).catch((err) => {
                        console.log(err)
                    })
                }else{
                    await this.init(instance, canPlay, needsToBeInstall, needsToBeRepare, needsToBeUpdate, undefined)
                }
                
            }).catch((err) => {
                console.log(err)
                instance.buttonActionPlay.find('.label').text(FZUtils.getLangKey("server.play.java_nf"))
            })
        }, 1000)
 
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
            }else if(!serverAvailable && this.session.role.is_admin){
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
            $('.config__repare_dir').addClass('disabled');
            $('.config__clear_dir').addClass('disabled');
            instance.buttonActionPlay.on('click', () => {
                instance.buttonActionPlay.attr('disabled', 'disabled')
                instance.prepareInstallOrUpdate();
            })
        }else if(needsToBeRepare){
            //REPARE ACTION
            instance.buttonActionPlay.find('.label').text(FZUtils.getLangKey("server.play.btn.repare"));
            instance.buttonActionPlay.removeAttr('disabled')
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
            $('.config__repare_dir').addClass('disabled');
            $('.config__clear_dir').addClass('disabled');
            instance.buttonActionPlay.on('click', () => {
                instance.buttonActionPlay.attr('disabled', 'disabled')
                instance.update(resultCUP.repos);
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
            $.get( repo.url, function( data ) {
                var body = data;
                if(instance.store.has(instance.keyStoreBranch(repo.branch))){
                    var version = instance.store.get(instance.keyStoreBranch(repo.branch));
                    if(version !== body.tag_name)
                        resolve({ data: body, result: true })
                    else
                        resolve({ data: body, result: false })
                }else{
                    resolve({ data: body, result: true })
                }
            }).fail(function(error) {
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
                this.server.repos.forEach(async (repo, index, array) => {
                    $.get( repo.url, function( data ) {
                        var body = data;
                        links.push({name: body.name, branch: body.target_commitish, version: body.tag_name, dlink: body.browser_download_url})
                        if (index === array.length -1) resolve();
                    }).fail(function() {
                        console.log(error);
                        reject(error)
                    });
                });
            });
            reposGithubResolve.then(() => {
                console.log(links)
                resolveLinks(links)
            })
        });
        await getLinksRepos.then((links) => {
            console.log(links)
            this.installOrRepareOrUpdate(links);
        });
    }

    async installOrRepareOrUpdate(links){
        var instance = this;
        var startLinkDL = function (index) {
            FZUtils.download(instance, links[index].dlink, instance.path.join(instance.dirServer, links[index].name), true, instance.server.name, links[index].branch).then((result) => {
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
                        
                        pack.on('start', () => {
                            console.log('extracting started');
                        });
                        
                        pack.on('progress', (percent) => {
                            downloads.updateDownload(uuidDl, instance.server.name+" - Extraction des dépendances", nameCurrent, parseInt(percent, 10).toString())
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

    async update(repos){
        let links = [];
        var updatePromise = new Promise((resolve, reject) => {
            repos.forEach(async (repo, index, array) => {
                var github = repo.github.data;
                links.push({name: github.name, branch: github.target_commitish, version: github.tag_name, dlink: github.browser_download_url})
                if (index === array.length -1) resolve();
            });
        })
        updatePromise.then(async() => {
            await this.installOrRepareOrUpdate(links);
        })
    }


    async prepareToLaunch(links, fileZipDepend){
        links.forEach((link) => {
            this.store.set(this.keyStoreBranch(link.branch), link.version)
        })
        if(fileZipDepend !== undefined)
            this.fs.unlinkSync(fileZipDepend)
        $('.server__version').text("Version MCP "+this.store.get(this.keyStoreBranch("mcp")));

        let serverAvailable;
        await this.checkServerAvailable()
            .then((response) => {
                serverAvailable = ((response == 1) ? true : false);
            })
            .catch((err) => {
                serverAvailable = false;
            })

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
            FZUtils.checkedIfinecraftAlreadyLaunch().then((result) => {
                if(result)
                    return this.notyf('error', 'Une instance est déjà lancé !')
                else{
                    if(this.gameLaunched) return;
                    this.buttonActionPlay.attr('disabled')
                    this.buttonActionPlay.addClass('disabled');
                    var dirServerAssets = `${this.dirServer}\\assets`;
                    var dirServerNatives = `${this.dirServer}\\natives`;
                    var dirServerLibs = `${this.dirServer}\\libs`;


                    if(this.store.get(this.keyStoreServerOptions('config__server_clean_autosc'))){
                        instance.fs.rm(instance.path.join(dirServerAssets, "frazionz/skins"), { recursive: true, force: true }, (err => {
                            if (err) return console.log(err);
                        }));
                    }
                
                    const StringBuilder = require("string-builder");
                    const sbLibs = new StringBuilder();
                
                    fs.readdirSync(dirServerLibs).forEach(file => {
                        sbLibs.append(`"${dirServerLibs}\\${file}";`)
                    });
                
                    sbLibs.append(`"${this.dirServer}\\${this.server.jarFileMain}"`);
                
                    var javaRuntime = 'java';
                    if(process.platform == "win32"){
                        if(this.store.get(this.keyStoreServerOptions('config__server_runtime_launch'))){
                            javaRuntime = '"'+this.path.join(this.dirFzLauncherDatas, "runtime/bin/java.exe")+'"';
                        }
                    }

                    console.log("JavaRuntime "+javaRuntime)

                    var ramMemoryMax = "";

                    if(os.arch().includes('64')){
                        var ramAllocateIndexProperties = ((this.store.has(this.keyStoreServerOptions('ramIndex')) ? this.store.get(this.keyStoreServerOptions('ramIndex')) : 0));
                        if (ramAllocateIndexProperties !== null) {
                            ramMemoryMax = "-Xms1g -Xmx" + FZUtils.listRamAllocate().list[ramAllocateIndexProperties].gb + "G";
                        }
                    }

                    //DISCORD
                    var discordRPC = "--discordRPC="+(this.store.get(this.keyStoreServerOptions('config__server_discord_rpc')))

                    //FULLSCREEN
                    var fullscreen = "--fullscreen";

                    //SIZE
                    var widthDisplay = "1280";
                    var heightDisplay = "720";
                    if(instance.store.has(instance.keyStoreServerOptions("config__server_display_size"))){
                        var size = instance.store.get(instance.keyStoreServerOptions("config__server_display_size")).split(':');
                        widthDisplay = size[0];
                        heightDisplay = size[1];
                    }
                
                    var stringCMD = javaRuntime + ' -XX:-UseAdaptiveSizePolicy -Djava.library.path="' + dirServerNatives + '" -Dfml.ignorePatchDiscrepancies=true ' + ramMemoryMax + ' -Dlog4j2.formatMsgNoLookups=true -cp ' + sbLibs.toString() + ' net.minecraft.client.main.Main ' + ((this.store.get(this.keyStoreServerOptions('config__server_display_fullscreen'))) ? fullscreen : "") + ' --width '+widthDisplay+' --height '+heightDisplay+' --username ' + this.session.username + ' --accessToken ' + this.session.access_token + ' --version ' + this.server.version + ' --gameDir "' + this.dirServer + '" --assetsDir "' + dirServerAssets + '" --assetIndex "' + this.server.assetIndex + '" '+discordRPC+' --userProperties {} --uuid ' + this.session.uuid + ' --userType legacy ';
                    this.notyf("success", "Lancement du jeu..")

                    setTimeout(() => {
                        if(!instance.store.get(instance.keyStoreServerOptions('config__server_minimise_app')))
                            ipcRenderer.send('closeApp')
                        else
                            ipcRenderer.send('hideApp')
                    }, 1500)

                    //var crashGame = new CrashGameDialog(false);
                    var finishGame = (crash) => {
                        if(instance.store.get(instance.keyStoreServerOptions('config__server_minimise_app'))){
                            this.gameLaunched = false;
                            ipcRenderer.send('showApp')
                            instance.buttonActionPlay.removeAttr("disabled")
                            instance.buttonActionPlay.removeClass('disabled');
                            if(crash){
                                setTimeout(() => {
                                    //crashGame.show();
                                }, 800)
                            }
                        }
                    }

                    FZUtils.checkedIfinecraftAlreadyLaunch().then((result) => {
                        if(!result){
                            this.gameLaunched = true;
                            const { exec } = require('child_process');
                            exec(stringCMD, (error, stdout, stderr) => {
                                if (error) {
                                    console.error(`error: ${error.message}`);
                                    finishGame(true);
                                    return;
                                }

                                if (stderr) {
                                    console.error(`stderr: ${stderr}`);
                                    finishGame(true);
                                    return;
                                }

                                finishGame();

                            });
                        }
                    })
                }
            })
        })
    }
}

module.exports = Play;
