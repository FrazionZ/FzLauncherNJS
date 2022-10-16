const fs = require('fs');
var appRoot = require('app-root-path');
const path = require('path')
const FZUtils = require(path.join(appRoot.path, "/src/assets/js/utils.js"))
//var crashGame = new CrashGameDialog(false);
 var finishGame = async (crash, logs) => {
    //await layoutClass.closeModal("messDialog");
    //instance.notyf('error', 'Une erreur est survenue lors de la session de jeu')
    if(instance.store.get(instance.keyStoreServerOptions('config__server_minimise_app'))){
        instance.gameLaunched = false;
        ipcRenderer.send('showApp')
        /*instance.buttonActionPlay.removeAttr("disabled")
        instance.buttonActionPlay.removeClass('disabled');
        if(crash){
            setTimeout(() => {
                layoutClass.loadDialog('crashgame', [{logs: logs}], "server");
            }, 800)
        }*/
        /*console.log('LoadURL Start')
        FZUtils.loadURL('/connected/layout', [{session: instance.session}]).then(() => {
            console.log('LoadURL Finish')
        })*/
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
            natives: path.join(instance.dirServer, "natives"),
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

    let logs = [];
    var launchGame = false;
    
    launcher.on('debug', (e) => console.log(e));
    launcher.on('data', async (e) => {
        logs.push(md.render(e));
        console.pipe
        ipcRenderer.send('logProcess', e)
        if(!launchGame){
            /*FZUtils.loadURL('/connected/playing', []).then(() => {
                ipcRenderer.send('closeApp', ((instance.store.has(instance.keyStoreServerOptions('config__server_minimise_app')) ? instance.store.get(instance.keyStoreServerOptions('config__server_minimise_app')) : false)));
                launchGame = true;
                launcher.on('close', (code) => {
                    var isCrash = ((code ==  0) ? false : true);
                    finishGame(isCrash, logs)
                })
            })*/
        }
        //ipcRenderer.send('closeApp', ((instance.store.has(instance.keyStoreServerOptions('config__server_minimise_app')) ? instance.store.get(instance.keyStoreServerOptions('config__server_minimise_app')) : false)));
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