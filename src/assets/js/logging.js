const path = require('path')
var appRoot = require('app-root-path');
const FZUtils = require(path.join(appRoot.path, '/src/assets/js/utils.js'))
const FzPage = require(path.join(appRoot.path, '/src/assets/js/FzPage.js'))
const Authenticator = require('azuriom-auth').Authenticator;
const axios = require('axios').default;
const UserAgent = require('user-agents');
const userAgent = new UserAgent({ platform: 'Win32' });

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
        
        // Create our number formatter.
        var formatter = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'USD',
        });
        
        user.money = formatter.format(user.money).replaceAll(',00', '').replaceAll('$US', ''); 

        var d = new Date(user.created_at);

        var dayCreatedAt = (d.getMonth()+1);
        if(dayCreatedAt < 10)
            dayCreatedAt = "0"+dayCreatedAt;

        var monthCreatedAt = (d.getMonth()+1);
        if(monthCreatedAt < 10)
            monthCreatedAt = "0"+monthCreatedAt;

        var datestring = dayCreatedAt  + "/" + monthCreatedAt + "/" + d.getFullYear() + " à " +
        d.getHours() + ":" + d.getMinutes();
        user.created_at = datestring; 

        const userFinal = {uuid: user.uuid, access_token: user.access_token };
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
                                FZUtils.loadURL('/connected/layout', [{session: user}, 
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
                                ])
                            });
                        });
                    });
                });
            })
        }
    }

    async addAccount(email, password, twofa){

        /* DETERMINE OS */
        var opsys = process.platform;
        if (opsys == "darwin")
            opsys = "MacOS";
        else if (opsys == "win32" || opsys == "win64")
            opsys = "Windows";
        else if (opsys == "linux")
            opsys = "Linux";
        else
            opsys = "Other";
        /* DETERMINE OS */


        var btnAddAcount = $('.addAccountContinue');
        try {
            if(email == "" || password == ""){
                btnAddAcount.removeAttr('disabled')
                return FZUtils.loadURL('/login', [{notyf: {type: "error", value: FZUtils.getLangKey("logging.result.form_empty")}}])
            }
            var user = undefined;
            if(twofa == "none")
                user = await this.authenticator.auth(email, password, opsys, userAgent.toString());
            else
                user = await this.authenticator.authWith2FA(email, password, opsys, userAgent.toString(), twofa);

            console.log(user)

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
            setTimeout(() => {
                this.finishAuth(user);
            }, 500)
        } catch (e) {
            console.log(e);
            console.log(user);
            return;
        }
    }

    async auth(force){
        //var mess = new Messaging(true, "Chargement de votre profil..");
        //CHECK IF USER HAS CONNECTED!
        //CONTINUE AUTH
        var continueAuthLog = async (access_token) => {
            try {
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
                console.log(e);
                //return FZUtils.loadURL('/login', [{notyf: {type: "error", value: FZUtils.getLangKey("logging.result.token_expired")}}])
            }
        }
        var accessToken = this.store.get('session').access_token;
        continueAuthLog(accessToken);
        /*else {
            this.ipcRenderer.send('sfsDecrypt', Buffer.from(this.store.get('session').access_token))
            this.ipcRenderer.on('respSfsDecrypt', async (event, atoken) => {
                //continueAuthLog(atoken);
                console.log(atoken)
            });
        }*/
    }


}

module.exports = Logging;