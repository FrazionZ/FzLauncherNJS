import React from 'react'
import CrashGame from '../../components/CrashGame'
import FzVariable from '../../components/FzVariable'
import SuperButton from '../../components/SuperButton'
const { v4: uuidv4 } = require('uuid')
const axios = require('axios').default
import ServerConfig from '../../../server_config.json'
import logo from '../../assets/img/icons/icon.png'
import Router from '../../components/Router';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
const os = require('os');


let user
let ServerObj
let ServerIcon
let AlreadyCheck
let ServerInstallState = -1;
let buttonActionPlay
let ResultCheckUpdate;
let instance;
let fzVariable;
let fp;

import News from './server/News';
import Pnotes from './server/Pnotes';
import Rpacks from './server/Rpacks';
import Screens from './server/Screens';
import Config from './server/Config';

class Server extends React.Component {

    routerForce = (sessionStorage.getItem('routerForce') !== null) ? sessionStorage.getItem('routerForce') : '/news'
    subpages = (ServerObj, SideRouter, ServerRouter) => {
        return [
            {
                "component": <News serverObj={ServerObj} />,
                "name": "News",
                "url": "/news",
                "title": fzVariable.lang('server.tabs.news'),
                "active": (this.routerForce == '/news') ? true : false,
                "root": undefined
            },
            {
                "component": <Pnotes serverObj={ServerObj} />,
                "name": "Pnotes",
                "url": "/pnotes",
                "title": fzVariable.lang('server.tabs.pnotes'),
                "active": (this.routerForce == '/pnotes') ? true : false,
                "root": undefined
            },
            {
                "component": <Rpacks fp={fp} serverObj={ServerObj} />,
                "name": "Rpacks",
                "url": "/rpacks",
                "title": fzVariable.lang('server.tabs.rpacks'),
                "active": (this.routerForce == '/rpacks') ? true : false,
                "root": undefined
            },
            {
                "component": <Screens serverObj={ServerObj} />,
                "name": "Screens",
                "url": "/screens",
                "title": fzVariable.lang('server.tabs.screens'),
                "active": (this.routerForce == '/screens') ? true : false,
                "root": undefined
            },
            {
                "component": <Config functionParse={{ repareServer: this.repareServer, reinitServer: this.reinitServer }} sideRouter={SideRouter} serverRouter={ServerRouter} serverObj={ServerObj} />,
                "name": "Config",
                "url": "/config",
                "title": fzVariable.lang('server.tabs.settings'),
                "active": (this.routerForce == '/config') ? true : false,
                "root": undefined
            },
        ]
    }

    state = {
        mcInfosBanner: {
            finish: false,
            online: false,
            players: 0,
        }
    };

    router = undefined

    constructor(props) {
        super(props)
        this.sideRouter = props.sideRouter
        this.taskQueue = props.taskQueue
        ServerObj = ServerConfig[props.idServer]
        ServerIcon = ServerObj.urlLogo
        fp = props.functionParse;
        user = JSON.parse(sessionStorage.getItem('user'));

        fzVariable = new FzVariable({ serverObj: ServerObj });
        this.dirServer = fzVariable.path.join(fzVariable.dirFzLauncherServer, ServerObj.name)
        ServerObj.dirServer = this.dirServer;
        this.changePage = this.changePage.bind(this)
        this.repareServer = this.repareServer.bind(this)
        this.reinitServer = this.reinitServer.bind(this)
        instance = this;

    }

    async setActionPlayText(string) {
        buttonActionPlay.querySelector("div.label").innerHTML = string
    }

    async getInfosBanner() {
        //mcInfosBanner
        await axios.get(`https://api.mcsrvstat.us/2/${ServerObj.serverAddress}`).then((response) => {
            let mcState = response.data;
            this.setState({ mcInfosBanner: { finish: true, online: mcState.online, players: ((mcState.online) ? mcState.players.online : 0) } });
            return;
        }).catch((err) => {
            console.log(err)
            this.setState({ mcInfosBanner: { finish: true, online: false, players: 0 } });
            return;
        });
    }

    async componentDidMount() {
        this.router = await new Router({
            domParent: document.querySelector('.main.connected .content-child .Server .subpages'),
            multipleSubDom: true,
            keySubDom: 'subpages'
        })
        this.router.setPages(this.subpages(ServerObj, this.sideRouter, this.router))

        if (this.routerForce !== null)
            this.router.showPage(this.routerForce)
        else
            this.router.showPage('/news')

        sessionStorage.removeItem('routerForce')


        buttonActionPlay = document.querySelector('.btn-download-launch-game')
        buttonActionPlay.disabled = true
        this.dlDialog = undefined
        this.gameLaunched = false
        let versions = fzVariable.path.join(this.dirServer, "versions");
        if (!fzVariable.fs.existsSync(this.dirServer))
            fzVariable.fs.mkdirSync(this.dirServer);
        if (!fzVariable.fs.existsSync(versions))
            fzVariable.fs.mkdirSync(versions);
        ServerObj.github.forEach((git) => {
            var gitBranch = fzVariable.path.join(versions, git.branch);
            if (!fzVariable.fs.existsSync(gitBranch))
                fzVariable.fs.mkdirSync(gitBranch);
        })

        await this.getInfosBanner();

        this.loadBranch().then(async (repoServer) => {
            this.router.preRenderPage('/config');
            this.preInit()
                .then(() => {
                    AlreadyCheck = true;
                })
                .catch((err) => {
                    AlreadyCheck = false;
                    console.log(err)
                })
        })
    }

    async updateConfigDAG(disabled) {
        document.dispatchEvent(new CustomEvent('server_config_disabledActionGame', { detail: { serverObj: ServerObj, disabled: disabled } }))
    }

    async changePage(instance) {
        document.querySelector('.server .subhead .menu li.item.active').classList.remove('active')
        instance.target.parentNode.classList.add('active')
        this.router.showPage(instance.target.getAttribute('dhref'))
    }

    async repareServer() {
        this.setActionPlayText(fzVariable.lang('server.play.btn.reparing'))
        buttonActionPlay.disabled = true
        this.prepareInstallOrUpdate()
    }

    async reinitServer() {
        let versions = fzVariable.path.join(ServerObj.dirServer, "versions");
        if (!fzVariable.fs.existsSync(versions)) fzVariable.fs.mkdirSync(versions);
        ServerObj.github.forEach((git) => {
            var gitBranch = fzVariable.path.join(versions, git.branch);
            if (!fzVariable.fs.existsSync(gitBranch)) fzVariable.fs.mkdirSync(gitBranch);
        })
        buttonActionPlay.disabled = false
        return new Promise((resolve, reject) => {
            this.preInit()
                .then(() => {
                    AlreadyCheck = true;
                    resolve()
                })
                .catch((err) => {
                    AlreadyCheck = false;
                    console.log(err)
                    resolve()
                })
        })
    }

    async loadBranch() {
        if (!fzVariable.store.has(fzVariable.keyStoreServerOptions('branch')))
            fzVariable.store.set(fzVariable.keyStoreServerOptions('branch'), ServerObj.defaultBranch)

        this.repoServer = []
        this.branch = fzVariable.store.get(fzVariable.keyStoreServerOptions('branch'))
        return new Promise((resolve, reject) => {
            ServerObj.github.forEach((github) => {
                if (this.branch == github.branch) {
                    var branch = github.branch
                    github.categories.forEach((categorie, index, array) => {
                        this.repoServer.push({
                            ksb: fzVariable.keyStoreBranch(branch, categorie.name),
                            branch: github.branch,
                            categorie: categorie,
                            url:
                                'https://api.frazionz.net/servers/' +
                                ServerObj.id +
                                '/' +
                                branch +
                                '/' +
                                categorie.name
                        })
                        if (index === array.length - 1) resolve(this.repoServer)
                    })
                }
            })
        })
    }

    async bdlgOnClick() {
        if (buttonActionPlay.disabled) return
        buttonActionPlay.disabled = true
        switch (ServerInstallState) {
            case 0:
                instance.prepareInstallOrUpdate()
                break
            case 1:
                instance.update()
                break
            case 2:
                instance.launchGame()
                break
            default:
                break
        }
    }

    async preInit() {
        var instance = this
        return new Promise(async (resolve, reject) => {
            setTimeout(async () => {
                await instance
                    .checkIfJavaHomeExist()
                    .then(async (result) => {
                        var dirsFilesObligate = [{ name: ServerObj.jarFileMain, isInstalled: false }]
                        var needsToBeInstall = false
                        var needsToBeRepare = false
                        var needsToBeUpdate = false
                        var canPlay = false
                        var dirExists = fzVariable.fs.existsSync(fzVariable.path.join(instance.dirServer))
                        if (!dirExists) {
                            needsToBeInstall = true
                        } else {
                            var files = fzVariable.fs.readdirSync(
                                fzVariable.path.join(
                                    instance.dirServer,
                                    'versions',
                                    fzVariable.store.get(fzVariable.keyStoreServerOptions('branch'))
                                )
                            )
                            dirsFilesObligate.forEach((v, k) => {
                                files.forEach((file) => {
                                    if (file == v.name) {
                                        dirsFilesObligate[k].isInstalled = true
                                    }
                                })
                            })
                            dirsFilesObligate.forEach((v) => {
                                if (!v.isInstalled) {
                                    needsToBeInstall = true
                                    return
                                }
                            })
                        }
                        var checkUpdateAvailable = async () => {
                            return new Promise(async (resolve, reject) => {
                                var repos = instance.repoServer
                                let reposUpdateAvailable = []
                                var index = 0
                                for await (const repo of repos) {
                                    await instance
                                        .checkUpdate(repo)
                                        .then(async (response) => {
                                            if (response.result)
                                                reposUpdateAvailable.push({ github: response, repos: repo, ksb: repo.ksb })
                                            if (index === repos.length - 1) resolve({ repos: reposUpdateAvailable })
                                            else index++
                                        })
                                        .catch((err) => {
                                            if (index === repos.length - 1) resolve({ repos: reposUpdateAvailable })
                                            else index++
                                        })
                                }
                            })
                        }
                        if (!needsToBeRepare && !needsToBeInstall) {
                            canPlay = true
                            await checkUpdateAvailable()
                                .then(async (resultCUP) => {
                                    if (resultCUP.repos.length > 0) {
                                        canPlay = false
                                        needsToBeUpdate = true
                                    } else {
                                        canPlay = true
                                        needsToBeUpdate = false
                                    }
                                    await this.init(
                                        instance,
                                        canPlay,
                                        needsToBeInstall,
                                        needsToBeRepare,
                                        needsToBeUpdate,
                                        resultCUP
                                    )
                                    ResultCheckUpdate = resultCUP;
                                    resolve(instance.repoServer)
                                })
                                .catch((err) => {
                                    console.log(err)
                                    resolve(instance.repoServer)
                                })
                        } else {
                            await this.init(
                                instance,
                                canPlay,
                                needsToBeInstall,
                                needsToBeRepare,
                                needsToBeUpdate,
                                undefined
                            )
                            resolve(instance.repoServer)
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                        this.setActionPlayText(fzVariable.lang('server.play.java_nf'))
                    })
            }, 50)
        })
    }

    async prepareInstallOrUpdate() {
        var instance = this;
        var dirExists = fzVariable.fs.existsSync(this.dirServer)
        if (!dirExists)
            fzVariable.fs.mkdirSync(this.dirServer);
        var getLinksRepos = new Promise(async (resolveLinks, reject) => {
            var links = [];
            var reposGithubResolve = new Promise((resolve, reject) => {
                this.repoServer.forEach(async (repo, index, array) => {
                    await axios
                        .get(repo.url)
                        .then((response) => {
                            var body = response.data;
                            links.push({ name: body.assets.name, dirInstall: fzVariable.path.join(repo.categorie.dir), ksb: repo.ksb, branch: body.target_commitish, categorie: repo.categorie.name, version: body.tag_name, dlink: body.browser_download_url })
                            if (index === array.length - 1) resolve();
                        }).catch(function (error) {
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

    async checkUpdate(repo) {
        var instance = this
        return new Promise(async (resolve, reject) => {
            await axios
                .get(repo.url)
                .then((response) => {
                    var body = response.data
                    if (fzVariable.store.has(repo.ksb)) {
                        var version = fzVariable.store.get(repo.ksb)
                        if (version !== body.tag_name)
                            resolve({ data: body, ksb: repo.ksb, categorie: repo.categorie, result: true })
                        else resolve({ data: body, ksb: repo.ksb, categorie: repo.categorie, result: false })
                    } else {
                        resolve({ data: body, ksb: repo.ksb, categorie: repo.categorie, result: true })
                    }
                })
                .catch(function (error) {
                    console.log(error)
                    resolve({ data: error, result: false })
                })
        })
    }

    async installOrRepareOrUpdate(links) {
        var instance = this
        var uuidDl = uuidv4()
        var startLinkDL = function (index) {
            console.log(links[index])
            fp.AddTaskInQueue({
                type: 0,
                uuidDl: uuidDl,
                installerfileURL: links[index].dlink,
                installerfilename: fzVariable.path.join(instance.dirServer, links[index].dirInstall, links[index].name),
                prefix: ServerObj.name,
                lastTask: false
            }).then((result) => {
                if (!(index + 1 == links.length))
                    startLinkDL(index + 1)
                else {
                    let fileZipDepend = undefined;
                    var files = fzVariable.fs.readdirSync(instance.dirServer)
                    files.forEach((file) => {
                        if (file.endsWith('.zip'))
                            fileZipDepend = fzVariable.path.join(instance.dirServer, file);
                    })

                    if (fileZipDepend !== undefined) {
                        fp.AddTaskInQueue({
                            type: 1,
                            uuidDl: uuidDl,
                            prefix: ServerObj.name,
                            fileZipDepend: fileZipDepend,
                            dirServer: instance.dirServer,
                            lastTask: true
                        }).then((result) => {
                            instance.prepareToLaunch(links, fileZipDepend);
                        }).catch((err) => console.log(err))
                    } else {
                        instance.prepareToLaunch(links, fileZipDepend);
                    }
                }
            }).catch((err) => console.log(err))
        }
        if (links.length > 0) startLinkDL(0)
        else {
            this.notyf(
                'error',
                "Impossible d'installer, de réparer ou de mettre à jour " + this.server.name
            )
        }
    }

    async update() {
        let links = []
        var updatePromise = new Promise((resolve, reject) => {
            ResultCheckUpdate.repos.forEach(async (repo, index, array) => {
                var github = repo.github.data
                links.push({
                    name: github.assets.name,
                    ksb: repo.ksb,
                    dirInstall: fzVariable.path.join(repo.repos.categorie.dir),
                    categorie: repo.repos.categorie.name,
                    branch: github.target_commitish,
                    version: github.tag_name,
                    dlink: github.browser_download_url
                })
                if (index === array.length - 1) resolve()
            })
        })
        updatePromise.then(async () => {
            await this.installOrRepareOrUpdate(links)
        })
    }

    async init(instance, canPlay, needsToBeInstall, needsToBeRepare, needsToBeUpdate, resultCUP) {
        if (canPlay) {
            this.updateConfigDAG(false)
            ServerInstallState = 2;
            //PLAY ACTION
            this.setActionPlayText(fzVariable.lang("server.play.btn.play"));
            buttonActionPlay.disabled = false;
            /*let serverAvailable;
                  await this.checkServerAvailable()
                      .then((response) => {
                          serverAvailable = ((response == 1) ? true : false);
                      })
                      .catch((err) => {
                          serverAvailable = false;
                      })
                  
                  if(serverAvailable){
                      //PLAY ACTION
                      this.setActionPlayText(fzVariable.lang("server.play.btn.play"];
                      buttonActionPlay.removeAttribute('disabled')
                      buttonActionPlay.on('click', () => {
                          instance.launchGame();
                      })
                  }else if(!serverAvailable && this.session.role.is_bplauncher){
                      this.setActionPlayText(fzVariable.lang("server.play.btn.play"];
                      buttonActionPlay.removeAttribute('disabled')
                      buttonActionPlay.on('click', () => {
                          instance.launchGame();
                      })
                  }else{
                      //$('.serverUnavailble').show();
                      buttonActionPlay.remove()
            }*/
        } else if (needsToBeInstall) {
            this.updateConfigDAG(true)
            ServerInstallState = 0;

            //INSTALL ACTION
            this.setActionPlayText(fzVariable.lang('server.play.btn.install'))
            buttonActionPlay.removeAttribute('disabled')
            /*$('.config__switch_branch').attr('disabled', true);
                  $('.config__repare_dir').addClass('disabled');
                  $('.config__clear_dir').addClass('disabled');*/
        } else if (needsToBeUpdate) {
            this.updateConfigDAG(false)
            ServerInstallState = 1

            //UPDATE ACTION
            this.setActionPlayText(fzVariable.lang('server.play.btn.update'))
            buttonActionPlay.removeAttribute('disabled')
            /*$('.config__switch_branch').attr('disabled', true;
                  $('.config__repare_dir').addClass('disabled');
                  $('.config__clear_dir').addClass('disabled');*/
        }
    }

    async checkIfJavaHomeExist() {
        return await new Promise(async (resolve, reject) => {
            require('find-java-home')(function (err, home) {
                if (!err) {
                    resolve(home)
                } else reject(err)
            })
        })
    }

    async prepareToLaunch(links, fileZipDepend) {
        links.forEach((link) => {
            fzVariable.store.set(link.ksb, link.version)
        })
        if (fileZipDepend !== undefined)
            fzVariable.fs.unlinkSync(fileZipDepend)

        let serverAvailable;
        /*await this.checkServerAvailable()
            .then((response) => {
                serverAvailable = ((response == 1) ? true : false);
            })
            .catch((err) => {
                serverAvailable = false;
            })*/

        var setActionLaunch = () => {
            this.setActionPlayText(fzVariable.lang('server.play.btn.play'))
            buttonActionPlay.disabled = false
            this.updateConfigDAG(false)
            ServerInstallState = 2;
        }

        setActionLaunch();

        /*if(serverAvailable){
            setActionLaunch();
        }else if(!serverAvailable && this.session.role.is_admin){
            setActionLaunch();
        }else{
            $('.serverUnavailble').show();
            this.buttonActionPlay.remove()
        }*/
    }


    launchGame() {
        var instance = this
        this.checkIfJavaHomeExist().then((javaHome) => {

            var launchGameFinal = function () {
                if (instance.gameLaunched) return;
                buttonActionPlay.disabled = true;
                instance.updateConfigDAG(true)
                var dirServerAssets = fzVariable.path.join(instance.dirServer, "assets");
                var dirServerNatives = fzVariable.path.join(instance.dirServer, "natives");
                var dirServerLibs = fzVariable.path.join(instance.dirServer, "libs");

                if (fzVariable.store.get(fzVariable.keyStoreServerOptions('config__server_clean_auto_cache'), false)) {
                    fzVariable.fs.rm(fzVariable.path.join(dirServerAssets, "frazionz/cache"), { recursive: true, force: true }, (err => {
                        if (err) return console.log(err);
                    }));
                }

                const StringBuilder = require("string-builder");
                const sbLibs = new StringBuilder();

                if (process.platform == "win32") {
                    fzVariable.fs.readdirSync(dirServerLibs).forEach(file => {
                        sbLibs.append(`"${dirServerLibs}\\${file}";`)
                    });
                } else if (process.platform == "linux") {
                    fzVariable.fs.readdirSync(dirServerLibs).forEach(file => {
                        sbLibs.append('"' + fzVariable.path.join(dirServerLibs, file) + '":')
                    });
                }

                sbLibs.append(fzVariable.path.join(instance.dirServer, "versions", fzVariable.store.get(fzVariable.keyStoreServerOptions('branch')), ServerObj.jarFileMain));

                var javaRuntime = 'java';
                if (process.platform == "win32")
                    if (fzVariable.store.get(fzVariable.keyStoreServerOptions('config__server_runtime_launch'), true))
                        javaRuntime = fzVariable.path.join(fzVariable.dirFzLauncherDatas, "runtime/bin/java.exe");
                    else
                        javaRuntime = 'java';

                let ramMemoryMax = "";

                if (os.arch().includes('64')) {
                    var ramAllocateIndexProperties = ((fzVariable.store.has(fzVariable.keyStoreServerOptions('ramIndex')) ? fzVariable.store.get(fzVariable.keyStoreServerOptions('ramIndex')) : 0));
                    if (ramAllocateIndexProperties !== null)
                        ramMemoryMax = fzVariable.listRamAllocate().list[ramAllocateIndexProperties].gb + "G";
                }

                //SIZE
                var widthDisplay = "1280";
                var heightDisplay = "720";
                if (fzVariable.store.has(fzVariable.keyStoreServerOptions("config__server_display_size"))) {
                    var size = fzVariable.store.get(fzVariable.keyStoreServerOptions("config__server_display_size")).split(':');
                    widthDisplay = size[0];
                    heightDisplay = size[1];
                }

                sessionStorage.setItem('gameLaunched', true)


                var processJavaLaunch = () => {
                    instance.gameLaunched = true;
                    let opts = {
                        clientPackage: null,
                        authorization: {
                            access_token: user.access_token,
                            uuid: user.uuid,
                            name: user.username,
                            user_properties: '{}',
                        },
                        version: {
                            number: ServerObj.version,
                            custom: ServerObj.assetIndex
                        },
                        root: instance.dirServer,
                        memory: {
                            max: ((ramMemoryMax) == "" ? "2G" : `${ramMemoryMax}`),
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
                            discordRPC: (fzVariable.store.get(fzVariable.keyStoreServerOptions('config__server_discord_rpc'), true)),
                            fullscreen: ((fzVariable.store.get(fzVariable.keyStoreServerOptions('config__server_display_fullscreen'), false))),
                            gameDirectory: "" + instance.dirServer.replace('\\', '//') + "",
                            minecraftJar: "" + fzVariable.path.join(instance.dirServer, "versions", fzVariable.store.get(fzVariable.keyStoreServerOptions('branch')), ServerObj.jarFileMain).replace('\\', '//'),
                            directory: "" + fzVariable.path.join(instance.dirServer, "versions", fzVariable.store.get(fzVariable.keyStoreServerOptions('branch'))).replace('\\', '//'), // where the Minecraft jar and version json are located.
                            natives: "" + fzVariable.path.join(instance.dirServer, "natives").replace('\\', '//') + "",
                            assetRoot: "" + fzVariable.path.join(instance.dirServer, "assets").replace('\\', '//') + "",
                            libraryRoot: "" + fzVariable.path.join(instance.dirServer, "libs").replace('\\', '//') + "",
                            classMain: ServerObj.classMain,
                            cwd: '',
                            detached: false,
                            classes: [],
                            minArgs: 11,
                            maxSockets: 2
                        }
                    }

                    opts.javaPath = javaRuntime;

                    opts.sessionfz = user;

                    ipcRenderer.send('MinecraftRuntime__setting', opts);

                    var optsLaunch = {}

                    ipcRenderer.send('MinecraftRuntime__launching', optsLaunch);


                    ipcRenderer.on('endSessionGame', (event, args) => {
                        buttonActionPlay.disabled = false
                        instance.updateConfigDAG(false)
                        instance.gameLaunched = false
                        sessionStorage.setItem('gameLaunched', false)
                    })

                }

                processJavaLaunch();

                /*if (process.platform == "darwin" || process.platform == "linux") {
                    processJavaLaunch();
                } else {
                    FZUtils.checkedIfinecraftAlreadyLaunch().then((result) => {
                        if (!result)
                            processJavaLaunch();
                    }).catch((err) => console.log(err))
                }*/


            }

            launchGameFinal();

            /*if (process.platform == "darwin" || process.platform == "linux") {
                launchGameFinal();
            } else {
                FZUtils.checkedIfinecraftAlreadyLaunch().then((result) => {
                    if (result)
                        return this.notyf('error', FZUtils.getLangKey('minecraft.alreadylaunch'))
                    else
                        launchGameFinal();
                }).catch((err) => console.log(err))
            }*/
        }).catch((err) => console.log(err))
    }

    render() {
        return (
            <>
                <div className="server index reset-mp">
                    <div className="head pl-40 pr-40 pt-40">
                        <div className="subhead">
                            <div className="flex pd-30 gap-30">
                                <div className="infos">
                                    <div className="flex align-center gap-4">
                                        <div className="server__logo">
                                            <img src={logo} width="64" height="64" alt="logo_server" />
                                        </div>
                                        <h2 className="reset-mp dark server__title">{ServerObj.name}</h2>

                                        <div className="state">
                                            {this.state.mcInfosBanner.finish === false &&
                                                (
                                                    <>
                                                        <div className="indicator">
                                                            <FaClock className='text-[20px]' />
                                                        </div>
                                                        <div className="label">
                                                            <span>Recherche des infos..</span>
                                                        </div>
                                                    </>
                                                )
                                            }
                                            {this.state.mcInfosBanner.finish === true && this.state.mcInfosBanner.online === true &&
                                                (
                                                    <>
                                                        <div className="indicator online">
                                                            <FaCheckCircle className='text-[#2f9b41] text-[20px]' />
                                                        </div>
                                                        <div className="label">
                                                            <span>En ligne, {this.state.mcInfosBanner.players} joueurs</span>
                                                        </div>
                                                    </>
                                                )
                                            }
                                            {this.state.mcInfosBanner.finish === true && this.state.mcInfosBanner.online === false &&
                                                (

                                                    <>
                                                        <div className="indicator">
                                                            <FaTimesCircle className='text-[#b13232] text-[20px]' />
                                                        </div>
                                                        <div className="label">
                                                            <span>Hors ligne</span>
                                                        </div>
                                                    </>
                                                )
                                            }
                                        </div>
                                    </div>
                                    <h4 className="server__description mt-10">{ServerObj.expl_server}</h4>
                                </div>
                            </div>
                            <div className="flex justif-center">
                                <div
                                    className="alert black-3 serverUnavailble"
                                    style={{
                                        borderRadius: '8px',
                                        position: 'relative',
                                        bottom: '6px',
                                        display: 'none',
                                        width: '50%',
                                        textAlign: 'center'
                                    }}
                                >
                                    <i className="fa-solid fa-triangle-exclamation fcolor-2 mr-10"></i>{' '}
                                    {fzVariable.lang('server.play.unavailable')}
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <SuperButton id="btnDLGFirst" className="" onClick={this.bdlgOnClick} text={fzVariable.lang('general.pwait')} />
                            </div>

                            <div className="ui top attached tabular nav nav-pills mb-3 menu">
                                {this.subpages(ServerObj).map((item, key) => (
                                    <li key={key} className={`item ${(item.active) ? "active" : ""}`} data-tab={item.name}>
                                        <a onClick={this.changePage} dhref={item.url}>{item.title}</a>
                                    </li>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="modals">
                        <CrashGame dirServer={this.dirServer} />
                    </div>
                    <div className="subpages px-5 pb-[4rem]">
                    </div>
                </div>
            </>

        )
    }
}

export default Server
