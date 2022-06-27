const { Notyf } = require('notyf');
const path = require('path')
var appRoot = require('app-root-path');
const FZUtils = require(path.join(appRoot.path, '/src/assets/js/utils.js'))
const FzPage = require(path.join(appRoot.path, '/src/assets/js/FzPage.js'))
const Authenticator = require('azuriom-auth').Authenticator;
class Logging extends FzPage {

    constructor(document, type, data) {
        super(document, "logging.html");
        var instance = this;
        this.urlApi = "https://auth.frazionz.net";
        this.authenticator = new Authenticator(this.urlApi);
        this.lang = FZUtils.getLang();
    }

    returnToLogin(){
        var Login = require('../js/login.js')
        var login = new Login(undefined, true)
        login.showPage(true);
    }

    async finishAuth(user){
        this.store.set('session', user);
        this.store.set('gameLaunched', false);
        this.store.set('serverCurrent', {
            idServer: 0,
            server: [0]
        })
        FZUtils.loadURL('/connected/layout', [{session: user}, {notyf: {type: "success", value: FZUtils.getLangKey("logging.result.logged", [{search: "%session__name%", replace: user.username}])}}])
    }

    async addAccount(email, password, twofa){
        var btnAddAcount = $('.addAccountContinue');
        try {
            if(email == "" || password == ""){
                btnAddAcount.removeAttr('disabled')
                return FZUtils.loadURL('/login', [{notyf: {type: "error", value: FZUtils.getLangKey("logging.result.form_empty")}}])
            }
            var user = undefined;
            if(twofa == "none")
                user = await this.authenticator.auth(email, password);
            else
                user = await this.authenticator.authWith2FA(email, password, twofa);
            if(user.status !== undefined){
                if(user.status == "error"){
                    btnAddAcount.removeAttr('disabled')
                    return FZUtils.loadURL('/login', [{notyf: {type: "error", value: FZUtils.getLangKey("logging.result.credentials")}}])
                }
                if(user.status == "pending"){
                    if(user.reason == "2fa"){
                        btnAddAcount.removeAttr('disabled')
                        return FZUtils.loadURL('/login', [{notyf: {type: "error", value: FZUtils.getLangKey("logging.result.2fa.require")}, loginForm: {userMail: email, userPassword: password}, twofa: true}])
                    }
                }
            }
            user = user.data;
            /*var profiles = this.loadProfiles();
            profiles.push({ id: user.id, uuid: user.uuid, access_token: user.access_token, username: user.username })
            this.store.set('profiles', profiles);*/
            setTimeout(() => {
                this.finishAuth(user);
            }, 2500)
        } catch (e) {
            console.log(user);
            return;
            /*console.log(e.message)
            btnAddAcount.removeAttr('disabled')
            return FZUtils.loadURL('/login', [{notyf: {value: "error", value: FZUtils.getLangKey("logging.result.internal_error")}}])*/
        }
    }

    async auth(atoken){
        //var mess = new Messaging(true, "Chargement de votre profil..");
        try {
            //var profileTarget = this.loadProfiles()[target_profile];
            var user = await this.authenticator.verify(atoken);
            if(user.status !== undefined){
                if(user.status == "error"){
                    FZUtils.loadURL('/login', [])
                    return FZUtils.loadURL('/login', [{notyf: {value: "error", value: user.message}}])
                }
            }
            user = user.data;
            setTimeout(() => {
                this.finishAuth(user);
            }, 2500)
        } catch (e) {
            if(e.message.includes('401')){
                setTimeout(() => {
                    //mess.hide();
                    this.store.delete('session')
                    return FZUtils.loadURL('/login', [{notyf: {type: "error", value: FZUtils.getLangKey("logging.result.token_expired")}}])
                }, 1000)
            }
        }
    }


}

module.exports = Logging;