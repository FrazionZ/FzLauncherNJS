const { Notyf } = require('notyf');
const FzPage = require('../js/FzPage.js')
const Authenticator = require('azuriom-auth').Authenticator;
const Messaging = require(__dirname+'/modals/messaging.js')
class Login extends FzPage {

    constructor(document) {
        super(document, "login.html");
        var instance = this;
        this.urlApi = "https://auth.frazionz.net";
        this.authenticator = new Authenticator(this.urlApi);
        if(this.store.has('session')){
            //AUTO LOG
            this.auth(this.store.get('session').access_token);
        }
    }

    async finishAuth(user){
        this.store.set('session', user);
        this.store.set('gameLaunched', false);
        var Home = require('../js/connected/home.js')
        var connectedHome = new Home(true)
        connectedHome.showPage(false)
    }

    async addAccount(email, password){
        var btnAddAcount = $('#login').find('.addAccountContinune');
        try {
            if(email == "" || password == ""){
                btnAddAcount.removeAttr('disabled')
                return this.notyf("error", "Vous devez remplir le formulaire !")
            }
            var user = await this.authenticator.auth(email, password);
            if(user.status !== undefined){
                if(user.status == "error"){
                    btnAddAcount.removeAttr('disabled')
                    return this.notyf("error", user.message)
                }
            }
            user = user.data;
            this.notyf("success", "Connecté en tant que "+user.username)
            /*var profiles = this.loadProfiles();
            profiles.push({ id: user.id, uuid: user.uuid, access_token: user.access_token, username: user.username })
            this.store.set('profiles', profiles);*/
            this.finishAuth(user);
        } catch (e) {
            btnAddAcount.removeAttr('disabled')
            return this.notyf("error", "Une erreur innterne est survenue :'(")
        }
    }

    async auth(atoken){
        var mess = new Messaging(true, "Chargement de votre profil..");
        try {
            //var profileTarget = this.loadProfiles()[target_profile];
            var user = await this.authenticator.verify(atoken);
            console.log(user)
            if(user.status !== undefined)
                if(user.status == "error")
                    return this.notyf("error", user.message)
            user = user.data;
            this.notyf("success", "Connecté en tant que "+user.username)
            setTimeout(() => {
                mess.hide();
                this.finishAuth(user);
            }, 1000)
        } catch (e) {
            console.log(e)
            if(e.message.includes('401')){
                setTimeout(() => {
                    mess.hide();
                    this.store.delete('session')
                }, 1000)
                this.notyf('error', 'Votre token d\'accès n\'est plus valide. Veuillez vous reconnecter.')
            }
        }
    }

    updateProfile(idProfil, key, value){
        switch(key){
            case 'token':
                this.profiles[idProfil].token = value;
                break;
            default:
                console.log(`Aucune donnée ${key} n'est modifiable`);
                break;
        }
        
        this.fs.writeFile(this.dirFzLauncherDatas+"/profiles.json", JSON.stringify(this.profiles), function writeJSON(err) {
            if (err) return console.log(err);
        });
    }

    loadProfiles(){
        if(this.store.has('profiles'))
            return this.store.get('profiles')
        else
            return [];
    }

}

module.exports = Login;