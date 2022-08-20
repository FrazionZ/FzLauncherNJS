const { Notyf } = require('notyf');
const { safeStorage } = require('electron');
const path = require('path')
var appRoot = require('app-root-path');
const FZUtils = require(path.join(appRoot.path, '/src/assets/js/utils.js'))
const FzPage = require(path.join(appRoot.path, '/src/assets/js/FzPage.js'))
const Authenticator = require('azuriom-auth').Authenticator;
const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');
class Logging extends FzPage {

    constructor(document, type, data) {
        super(document, "logging.html");
        var instance = this;
        this.urlApi = "https://auth.frazionz.net";
        this.authenticator = new Authenticator(this.urlApi);
        this.lang = FZUtils.getLang(this.store.get('lang'));
        
    }

    returnToLogin(){
        var Login = require('../js/login.js')
        var login = new Login(undefined, true)
        login.showPage(true);
    }

    async finishAuth(user){
        await axios.get('https://api.frazionz.net/faction/profile/'+user.uuid)
            .then((response) => {
                //if(response.data.result == "success")
                    //user.fzProfile = response.data;
            })
        this.ipcRenderer.send('sfsEncrypt', user.access_token)
        this.ipcRenderer.on('respSfsEncrypt', (event, data) => {
            const userFinal = {uuid: user.uuid, access_token: Buffer.from(data.buffer).toJSON() };
                this.store.set('session', userFinal);
                if(user.banned)
                    FZUtils.loadURL('/session/banned', [])
                else if(!user.email_verified)
                    FZUtils.loadURL('/session/eVerified', [])
                else{
                    $('.loader-3').fadeOut()
                    $('.logging .actionsText').fadeOut()
                    $('.logging .avatar').fadeOut(() => {
                        $('.logging .avatar').css({borderRadius: 0}).animate({borderRadius: 8}, 700);
                        $('.logging .avatar').attr('src', 'https://auth.frazionz.net/skins/face.php?s=120&u='+user.id)
                        $('.logging .avatar').fadeIn(() => {
                            $('.loader-3').fadeOut()
                            $('.logging .actionsText .btext').html('Bonjour '+user.username+' !')
                            $('.logging .actionsText .sbtext').html('Chargement de vos données en cours..')
                            $('.logging .actionsText').fadeIn()
                            $('.logging .actionsText .btext').slideDown(() => { 
                                $('.logging .actionsText .sbtext').slideToggle(() => {
                                    $('.logging .actionsText .loader-3').fadeIn(() => {
                                        this.ipcRenderer.send('authorizationDevTools', user.role.is_admin)
                                        this.store.set('serverCurrent', {
                                            idServer: 0,
                                            server: [0]
                                        })
                                        setTimeout(() => {
                                            
                                            $('.logging').fadeOut(() => 
                                                FZUtils.loadURL('/connected/layout', [
                                                    {
                                                        session: user
                                                    }, 
                                                    {
                                                        notyf: 
                                                            {
                                                                type: "success", 
                                                                value: FZUtils.getLangKey("logging.result.logged", 
                                                                [
                                                                    {
                                                                        search: "%session__name%", 
                                                                        replace: user.username
                                                                    }
                                                                ]
                                                            )
                                                        }
                                                    }
                                                ]
                                            )) 
                                        }, 1500);
                                    });
                                });
                            });
                        });
                    })
                }
        })
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
            }, 500)
        } catch (e) {
            console.log(user);
            return;
            /*console.log(e.message)
            btnAddAcount.removeAttr('disabled')
            return FZUtils.loadURL('/login', [{notyf: {value: "error", value: FZUtils.getLangKey("logging.result.internal_error")}}])*/
        }
    }

    async auth(force){
        //var mess = new Messaging(true, "Chargement de votre profil..");
        //CHECK IF USER HAS CONNECTED!
        var isOnline = false;
        var srenewConfig = ((store.has('launcher__srenew')) ? store.get('launcher__srenew') : true)
        await axios.get("https://api.frazionz.net/faction/profile/"+this.store.get('session').uuid+"/online")
            .then((response) => {
                if(response.data.isOnline !== undefined){
                    if(response.data.isOnline){
                        isOnline = response.data.isOnline;
                    }
                }
            })
        if(isOnline && !force && srenewConfig){
            return FZUtils.loadURL('/session/renew', [])
        }else{
            //CONTINUE AUTH
            var continueAuthLog = async (access_token) => {
                try {
                    //var profileTarget = this.loadProfiles()[target_profile];
                    var user = await this.authenticator.verify(access_token);
                    if(user.status !== undefined){
                        if(user.status == "error"){
                            return FZUtils.loadURL('/login', [{notyf: {value: "error", value: user.message}}])
                        }
                    }
                    user = user.data;
                    setTimeout(() => {
                        this.finishAuth(user);
                    }, 500)
                } catch (e) {
                    if(e.message.includes('401')){
                        setTimeout(() => {
                            //mess.hide();
                            this.store.delete('session')
                            return FZUtils.loadURL('/login', [{notyf: {type: "error", value: FZUtils.getLangKey("logging.result.token_expired")}}])
                        }, 500)
                    }
                }
            }
            var accessToken = this.store.get('session').access_token;
            if(typeof accessToken == "string")
                continueAuthLog(accessToken);
            else {
                this.ipcRenderer.send('sfsDecrypt', Buffer.from(this.store.get('session').access_token))
                this.ipcRenderer.on('respSfsDecrypt', async (event, atoken) => {
                    continueAuthLog(atoken);
                });
            }
            
        }
    }


}

module.exports = Logging;