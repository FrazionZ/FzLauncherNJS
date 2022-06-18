const fs = require('fs');
const FZUtils = require('../../../utils.js');
const FzPage = require('../../../FzPage.js');
const { ipcRenderer } = require('electron');
const os = require('os');
const onezip = require('onezip');
const DownloadDialog = require('../../../modals/download.js')
const CrashGameDialog = require('../../../modals/crashgame.js')
const { v4: uuidv4 } = require('uuid');
class Play extends FzPage {

    constructor(){
        super(null)
        this.server = this.store.get('serverCurrent').server;
        this.dirServer = `${this.dirFzLauncherServer}\\${this.server.name}`;
        this.buttonActionPlay = $('.btn-download-launch-game');
        this.dlDialog = undefined;

        this.keyStoreBranch = function(branch) {
            return 'server_'+this.server.name.toLowerCase()+'_'+branch+'_version';
        }

        this.keyStoreServerOptions = function(key) {
            return 'server_'+this.server.name.toLowerCase()+'_'+key;
        }

        $('.profile__timegame').text($('.profile__timegame').text().replace('{SESSION_TIME_GAME_FZ}', this.timeConvert(this.store.get('session')._timegame)))
        $('.server-expl').text(this.store.get('serverCurrent').server.expl_server) 
        var instance = this;
        setTimeout(async () => {
            await instance.checkIfJavaHomeExist().then(async (result) => {
                instance.buttonActionPlay.find('.label').text('Vérification des fichiers..')
                var dirsFilesObligate = [{name: 'assets', isInstalled: false}, {name: 'libs', isInstalled: false}, {name: 'natives', isInstalled: false}, {name: instance.store.get('serverCurrent').server.jarFileMain, isInstalled: false}];
                console.log(instance.dirServer)
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
                    var repos = instance.server.github;
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
                        console.log(resultCUP.repos[0])
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
                instance.buttonActionPlay.find('.label').text('Java non trouvée')
            })
        }, 1000)
 
    }

    async init(instance, canPlay, needsToBeInstall, needsToBeRepare, needsToBeUpdate, resultCUP){
        if(canPlay){
            //PLAY ACTION
            instance.buttonActionPlay.find('.label').text('Jouer');
            instance.buttonActionPlay.removeAttr('disabled')
            instance.buttonActionPlay.on('click', () => {
                instance.launchGame();
            })
        }else if(needsToBeInstall){
            //INSTALL ACTION
            instance.buttonActionPlay.find('.label').text('Installer');
            instance.buttonActionPlay.removeAttr('disabled')
            $('.config__repare_dir').addClass('disabled');
            $('.config__clear_dir').addClass('disabled');
            instance.buttonActionPlay.on('click', () => {
                instance.buttonActionPlay.attr('disabled', 'disabled')
                instance.prepareInstallOrUpdate();
            })
        }else if(needsToBeRepare){
            //REPARE ACTION
            instance.buttonActionPlay.find('.label').text('Réparer');
            instance.buttonActionPlay.removeAttr('disabled')
            $('.config__repare_dir').addClass('disabled');
            $('.config__clear_dir').addClass('disabled');
            instance.buttonActionPlay.on('click', () => {
                instance.buttonActionPlay.attr('disabled', 'disabled')
                instance.prepareInstallOrUpdate();
            })
        }else if(needsToBeUpdate){
            //UPDATE ACTION
            instance.buttonActionPlay.find('.label').text('Mettre à jour');
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
            }).fail(function() {
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
                this.server.github.forEach(async (repo, index, array) => {
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
            FZUtils.download(instance, links[index].dlink, instance.path.join(instance.dirServer, links[index].name), true, links[index].branch).then((result) => {
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
                        downloadsList.push({uuidDl: uuidDl, title: "Extraction des dépendances", subtitle: " - ", percentage: 0, finish: false});

                        var nameCurrent = "";

                        pack.on('file', (name) => {                     
                            nameCurrent = name;
                        });
                        
                        pack.on('start', () => {
                            console.log('extracting started');
                        });
                        
                        pack.on('progress', (percent) => {
                            downloads.updateDownload(uuidDl, "Extraction des dépendances", nameCurrent, parseInt(percent, 10).toString())
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
        $('.server__version').text("Version MCP "+this.store.get(this.keyStoreBranch("mcp")))
        this.buttonActionPlay.find(".label").text("Jouer")
        this.buttonActionPlay.removeAttr("disabled")
        $('.config__repare_dir').removeClass('disabled');
        $('.config__clear_dir').removeClass('disabled');
        this.buttonActionPlay.off()
        this.buttonActionPlay.on("click", () => { this.launchGame(); })
    }

    launchGame(){
        //btnDlLaunch.find('.label').html('Jeu en cours d\'exécution..')
        /*if (gameLaunched)
            return utilsFZ.toast_error("FzLauncher", "Une instance est déjà en cours d'exécution !")*/

        var instance = this

        this.checkIfJavaHomeExist().then((javaHome) => {

            if(this.store.get('gameLaunched')){
                return this.notyf('error', 'Une instance est déjà lancé !')
            }
            var dirServerAssets = `${this.dirServer}\\assets`;
            var dirServerNatives = `${this.dirServer}\\natives`;
            var dirServerLibs = `${this.dirServer}\\libs`;

            //config__server_discord_rpc Discord RPC - OK
            //config__server_minimise_app Close App - OK
            //config__server_console_game Console Game
            //config__server_runtime_launch Runtime FzLauncher - OK
            //config__server_clean_autosc Clear Auto Cache Skin and Cape - OK


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
        
            var stringCMD = javaRuntime + ' -XX:-UseAdaptiveSizePolicy -Djava.library.path="' + dirServerNatives + '" -Dfml.ignorePatchDiscrepancies=true ' + ramMemoryMax + ' -Dlog4j2.formatMsgNoLookups=true -cp ' + sbLibs.toString() + ' net.minecraft.client.main.Main --username ' + this.session.username + ' --accessToken ' + this.session.access_token + ' --version ' + this.server.version + ' --gameDir "' + this.dirServer + '" --assetsDir "' + dirServerAssets + '" --assetIndex "' + this.server.assetIndex + '" '+discordRPC+' --userProperties {} --uuid ' + this.session.uuid + ' --userType legacy ';
            instance.store.set('gameLaunched', true);
            this.notyf("success", "Lancement du jeu..")

            setTimeout(() => {
                if(!instance.store.get(instance.keyStoreServerOptions('config__server_minimise_app')))
                    ipcRenderer.send('closeApp')
                else
                    ipcRenderer.send('hideApp')
            }, 1500)

            var crashGame = new CrashGameDialog(false);
            var finishGame = (crash) => {
                if(instance.store.get(instance.keyStoreServerOptions('config__server_minimise_app'))){
                    ipcRenderer.send('showApp')
                    if(crash){
                        setTimeout(() => {
                            crashGame.show();
                        }, 800)
                    }
                }
                instance.store.delete('gameLaunched')
                instance.store.set('gameLaunched', false);
            }

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
            
            /*exec.execCommand = function(stringCMD, callback) {
                console.log("LAUNCH")
                exec(stringCMD, (error, stdout, stderr) => {
                    gameLaunched = false;
                    
                    console.log(error)
                    console.log(stdout)
                    console.log(stderr)
                    //$('.btn-download-launch-game').prop("disabled", false);
                    if (error) {
                        console.log(error)
                        //utilsFZ.toast_error("FzLauncher", "Une erreur est survenue lors du lancement du jeu!")
                        //$('#crashdialog').modal('show')
                        //$('.btn-crash-report').click(() => {
                            //shell.openPath(dirServer+"/crash-reports")
                            //shell.openPath(dirServer + "/crash-reports")
                        //})
                    }
                    //btnDlLaunch.find('.label').html('Lancer le jeu')
                    //utilsFZ.toast_success("FzLauncher", "Session de jeu terminé avec succès")
                }).exec;
            }*/
        })
    }
}

module.exports = Play;

/*
ipcRenderer.send('demandServerID', serverCurrent);
ipcRenderer.once('receiveServersID', (event, response) => {
    ipcRenderer.send('getSessionProfile');
    ipcRenderer.once('receiveSessionProfile', (event, response) => {
        var profile = response;
        ipcRenderer.send('dirFzLauncherServer');
        ipcRenderer.once('receiveDirFzLauncherServer', (event, response) => {
            var dirServer = response + "\\" + serverCurrent.server.name;
            var pathProperties = dirServer + "/server.properties";
            var properties = propertiesReader(pathProperties);
            var isUpdateAvailable = false;
            var version = properties.get("version")
            var alreadyInstalled = properties.get("alreadyInstalled")
            var classNameBtnDlLaunch = ".btn-download-launch-game";
            var btnDlLaunch = $(classNameBtnDlLaunch);
            btnDlLaunch.attr('id', serverCurrent.server.name.toLowerCase())
            $('.server-expl').html(serverCurrent.server.expl_server)
            var checkJavaHome = new Promise((resolve, reject) => {
                require('find-java-home')(function(err, home) {
                    if (!err) {
                        ipcRenderer.send('dirFzLauncherDatas');
                        ipcRenderer.once('receiveDirFzLauncherDatas', (event, response) => {
                            var dirLauncher = response + "/runtime";
                            utilsFZ.checkFileExists(dirLauncher + "/bin/java.exe").then((bool) => {
                                if (bool)
                                    resolve(dirLauncher);
                                else
                                    resolve(undefined)
                            })
                        })
                    } else
                        resolve(home);
                })
            });
            checkJavaHome.then((javaHome) => {
                if (javaHome == undefined) {
                    btnDlLaunch.find('.label').html('Installer Java')
                    $(classNameBtnDlLaunch).prop("disabled", false);
                    $(classNameBtnDlLaunch).click(function() {
                        $('#installjava').modal({
                            backdrop: 'static',
                            keyboard: false
                        }).modal('show')
                        if (require('os').arch().includes('64')) {
                            var urlJava = "https://download.frazionz.net/FZLauncher/runtime/64/jre1.8.0_291.zip";
                            var filename = "jre1.8.0_291.zip";
                        } else if (require('os').arch().includes('32')) {
                            var urlJava = "https://download.frazionz.net/FZLauncher/runtime/32/jre1.8.0_301.zip";
                            var filename = "jre1.8.0_301.zip";
                        }
                        ipcRenderer.send('dirFzLauncherDatas');
                        ipcRenderer.once('receiveDirFzLauncherDatas', (event, response) => {
                            var dirLauncher = response + "/runtime";
                            utilsFZ.downloadFile(urlJava, dirLauncher).then(() => {
                                fs.createReadStream(dirLauncher + "/" + filename).pipe(unzipper.Extract({
                                    path: dirLauncher
                                })).on('close', function() {
                                    $('#installjava').modal('hide');
                                    utilsFZ.toast_success("FzLauncher", "Installation du moteur java, terminé !")
                                    utilsFZ.toast_success("FzLauncher", "Redémarrage du launcher..");
                                    setTimeout(function() {
                                        ipcRenderer.send('relaunchApp');
                                    }, 2000)
                                });
                            })
                        })
                    })
                    return utilsFZ.toast_error("FzLauncher", "Java semble introuvable, cliquez sur le bouton ci-contre pour l'installer");
                } else {
                    if (alreadyInstalled == null) {
                        alreadyInstalled = false;
                        properties = utilsFZ.updateProperties("alreadyInstalled", false, pathProperties);
                    } else if (version == null) {
                        alreadyInstalled = false;
                    }
                    $.get("https://download.frazionz.net/FZLauncher/servers/" + serverCurrent.server.name.toLowerCase() + "/version.json", function(data) {
                        if (data !== null && data !== undefined) {
                            var lastVersion = data.version;
                            var checkMinecraftRunFile = new Promise((resolve, reject) => {
                                if (!alreadyInstalled || !version) {
                                    isUpdateAvailable = true;
                                    btnDlLaunch.find('.label').html('Installer')
                                    resolve();
                                } else {
                                    var fileMinecraftAbsolutePath = dirServer + "/" + serverCurrent.server.jarFileMain;
                                    utilsFZ.checkFileExists(fileMinecraftAbsolutePath).then((bool) => {
                                        if (bool) {
                                            if (lastVersion !== version) {
                                                isUpdateAvailable = true;
                                                btnDlLaunch.find('.label').html('Mise à jour disponible !')
                                                resolve();
                                            } else {
                                                $.get(serverCurrent.server.updateFileList + "/server/list/checkMinecraft/md5", function(data) {
                                                    if (md5File.sync(fileMinecraftAbsolutePath) !== data) {
                                                        isUpdateAvailable = true;
                                                        btnDlLaunch.find('.label').html('Réparer le jeu !')
                                                    }
                                                    resolve();
                                                })
                                            }
                                        } else {
                                            isUpdateAvailable = true;
                                            btnDlLaunch.find('.label').html('Réparer le jeu !')
                                            resolve();
                                        }
                                    })
                                }
                            });
                            checkMinecraftRunFile.then(() => {
                                btnDlLaunch.prop("disabled", false);
                                if (!isUpdateAvailable)
                                    btnDlLaunch.find('.label').html('Lancer le jeu')
                                btnDlLaunch.click(function() {
                                    $(this).prop("disabled", true);
                                    if (isUpdateAvailable) {
                                        var api_download = serverCurrent.server.updateFileList;
                                        $.post(api_download + "/server/list/md5", function(data) {
                                                // console.log(await download(win, url));
                                                var filesPreList = JSON.parse(data);
                                                var fileOuputDir = dirServer;
                                                var fileListFinal = [];

                                                var foreachFileToDownload = new Promise((resolve, reject) => {
                                                    filesPreList.forEach(async (file, index, array) => {

                                                        var absolutePathFile = dirServer + "/" + file.fileRelativePath;
                                                        await utilsFZ.checkFileExists(absolutePathFile).then(async (bool) => {
                                                            if (!bool) {
                                                                fileListFinal.push({
                                                                    urlDl: api_download + "/files/" + file.fileRelativePath,
                                                                    md5: file.md5,
                                                                    delete: false,
                                                                    absolutePathFile: absolutePathFile,
                                                                    filePath: file.fileRelativePath
                                                                })
                                                                if (index === array.length - 1) resolve(fileListFinal);
                                                            } else if (bool) {
                                                                if (md5File.sync(absolutePathFile) !== file.md5) {
                                                                    fileListFinal.push({
                                                                        urlDl: api_download + "/files/" + file.fileRelativePath,
                                                                        md5: file.md5,
                                                                        delete: true,
                                                                        absolutePathFile: absolutePathFile,
                                                                        filePath: file.fileRelativePath
                                                                    })
                                                                }
                                                                if (index === array.length - 1) resolve(fileListFinal);
                                                            }
                                                        })
                                                    })
                                                });

                                                foreachFileToDownload.then((flf) => {
                                                    var progress = 0;
                                                    var fileMax = flf.length;
                                                    if (fileMax > 0) {
                                                        var progress = $(classNameBtnDlLaunch).find('.progress');
                                                        progress.attr("style", "display: block;");
                                                        fileListFinal.forEach(async (file) => {
                                                            if (file.delete)
                                                                fs.unlink(file.absolutePathFile, (err) => {
                                                                    if (err) console.log(err)
                                                                })
                                                            filePathOut = file.filePath.substr(0, file.filePath.lastIndexOf('/'));
                                                            filename = file.urlDl.split("/").pop();
                                                            await download(file.urlDl, dirServer + "/" + filePathOut, {
                                                                    filename: filename
                                                                })
                                                                .then(() => {
                                                                    //UPDATE VALUE PROGRESS
                                                                    progress++;
                                                                    percentage = (progress / fileMax) * 100;
                                                                    updateProgress(classNameBtnDlLaunch, percentage + "%");
                                                                    if (fileMax == progress) {
                                                                        properties = utilsFZ.updateProperties("version", lastVersion, pathProperties);
                                                                        properties = utilsFZ.updateProperties("alreadyInstalled", true, pathProperties);
                                                                        console.log(fileMax + " download with success!")
                                                                        launchGame(dirServer, profile, btnDlLaunch, serverCurrent.server.opts.get("ramIndexSelect"), javaHome);
                                                                    }
                                                                })
                                                        })
                                                    } else {
                                                        properties = utilsFZ.updateProperties("version", lastVersion, pathProperties);
                                                        properties = utilsFZ.updateProperties("alreadyInstalled", true, pathProperties);
                                                        launchGame(dirServer, profile, btnDlLaunch, serverCurrent.server.opts.get("ramIndexSelect"), javaHome)
                                                    }
                                                });
                                            })
                                            .fail(function() {
                                                utilsFZ.toast_error("FzLauncher", "Impossible de lancer le jeu :'(")
                                            });
                                    } else
                                        launchGame(dirServer, profile, btnDlLaunch, serverCurrent.server.opts.get("ramIndexSelect"), javaHome);
                                    //$('.nav').find('a[data-server-id="'+serverCurrent.idServer+'"]').text('test')

                                })
                            })

                        }
                    })
                }
            })

        })

    })
})

function launchGame(dirServer, profile, btnDlLaunch, ramAllocateIndexProperties, javaHome) {
    btnDlLaunch.find('.label').html('Jeu en cours d\'exécution..')
    if (gameLaunched)
        return utilsFZ.toast_error("FzLauncher", "Une instance est déjà en cours d'exécution !")
    var dirServerAssets = `"${dirServer}\\assets"`;
    var dirServerNatives = `"${dirServer}\\natives"`;
    var dirServerLibs = `${dirServer}\\libs`;

    const StringBuilder = require("node-stringbuilder");
    const sbLibs = new StringBuilder(); 

    fs.readdirSync(dirServerLibs).forEach(file => {
        sbLibs.append(`"${dirServerLibs}\\${file}";`)
    });

    sbLibs.append(`"${dirServer}\\${serverCurrent.server.jarFileMain}"`);

    var javaRuntime = '"' + javaHome + '\\bin\\java"';

    var ramMemoryMax = "";
    if (ramAllocateIndexProperties !== null) {
        ramMemoryMax = "-Xms1g -Xmx" + utilsFZ.listRamAllocate().list[ramAllocateIndexProperties].gb + "G";
    }

    var stringCMD = javaRuntime + ' -XX:-UseAdaptiveSizePolicy -Djava.library.path=' + dirServerNatives + ' -Dfml.ignorePatchDiscrepancies=true ' + ramMemoryMax + ' -Dlog4j2.formatMsgNoLookups=true -cp ' + sbLibs.toString() + ' net.minecraft.client.main.Main --username ' + this.session._username + ' --accessToken ' + this.session._token + ' --version ' + serverCurrent.server.version + ' --gameDir ' + dirServer + ' --assetsDir ' + dirServerAssets + ' --assetIndex ' + serverCurrent.server.assetIndex + ' --userProperties {} --uuid ' + this.session._uuid + ' --userType legacy --discordRPC=false ';

    var os = new utilsFZ.os_func();
    gameLaunched = true;
    utilsFZ.toast_success("FzLauncher", "Lancement du jeu..")
    os.execCommand(stringCMD, function(error, stdout, stderr) {
        gameLaunched = false;
        $('.btn-download-launch-game').prop("disabled", false);
        if (error) {
            console.log(error)
            utilsFZ.toast_error("FzLauncher", "Une erreur est survenue lors du lancement du jeu!")
            $('#crashdialog').modal('show')
            $('.btn-crash-report').click(() => {
                //shell.openPath(dirServer+"/crash-reports")
                shell.openPath(dirServer + "/crash-reports")
            })
        }
        btnDlLaunch.find('.label').html('Lancer le jeu')
        utilsFZ.toast_success("FzLauncher", "Session de jeu terminé avec succès")
    });


}

function updateProgress(className, value) {
    var progress = $(className).find('.progress');
    progress.find('.progress-bar').attr("style", "width:" + value);
    if(value.includes('100')){
        progress.hide();
    }
}

function percentageToDegrees(percentage) {
    return percentage / 100 * 360
}*/