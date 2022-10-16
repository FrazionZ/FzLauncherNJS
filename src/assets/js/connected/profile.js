var appRoot = require('app-root-path');
const { cp } = require('fs');
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"))
const Authenticator = require('azuriom-auth').Authenticator;
class Profile extends FzPage {

    constructor(){
        super("connected/profile/index.html")
        var instance = this;
        this.urlApi = "https://auth.frazionz.net";
        this.authenticator = new Authenticator(this.urlApi);
        $('.ui.checkbox').checkbox();
        $('#logout').on('click', () => {
            $('.sidebar').removeClass('hide');
            $('.main').removeClass('w-100');
            $('.main').addClass('connected');
            instance.logout()
        })


        this.skinUrl = "https://api.frazionz.net/skins/display?username="+userSession.username;
        this.capeUrl = "https://api.frazionz.net/capes/display?username="+userSession.username;
        
        this.gloalSkinViewer = new skinview3d.SkinViewer({
            canvas: document.getElementById("skin"),
            width: 300,
            height: 400,
            skin: "asset://img/steve.png"
        });
    
        // Change viewer size
        this.gloalSkinViewer.width = 240;
        this.gloalSkinViewer.height = 352.94;
    
        // Load another skin
        const skinExist = FZUtils.UrlExists(this.skinUrl).then((result) => {
            if(skinExist)
                this.gloalSkinViewer.loadSkin(this.skinUrl, { model: ((userSession.isSlim) ? "slim" : "default") });
        });
        
        this.gloalSkinViewer.loadCape(this.capeUrl);
            
        this.gloalSkinViewer.playerObject.rotation.y = 31.7;

        let controlInfos = skinview3d.createOrbitControls(this.gloalSkinViewer);
        controlInfos.enableRotate = true;
        controlInfos.enableZoom = false;
        controlInfos.enablePan = false;

    }

    async logout() {
        FZUtils.checkedIfinecraftAlreadyLaunch().then(async (result) => {
            if(result)
                return this.notyf('error', 'Vous ne pouvez pas vous déconnecter, une instance Minecraft est ouverte.')
            else {
                await this.authenticator.logout(this.session.access_token).then(() => {
                    this.ipcRenderer.send('authorizationDevTools', false)
                    this.store.delete('session');
                    ipcRenderer.send('logout')
                });
            }
        })
    }

}

module.exports = Profile;