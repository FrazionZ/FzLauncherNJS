const path = require('path')
var appRoot = require('app-root-path');
const FZUtils = require(path.join(appRoot.path, '/src/assets/js/utils.js'))
const FzPage = require(path.join(appRoot.path, '/src/assets/js/FzPage.js'))
const Authenticator = require('azuriom-auth').Authenticator;
class Login extends FzPage {

    constructor(document) {
        super(document);
        var instance = this;
        var twofaInstance = (($('.addAccountContinue').length == 1) ? false : true);
        $('body').on('keypress',function(e) {
            if(e.which == 13) {
                instance.initAddAccount(twofaInstance);
            }
        });
        $('.addAccountContinue').on('click', async() => {
            instance.initAddAccount(twofaInstance);
        });
        $('.2FAAccountContinue').on('click', async() => {
            instance.initAddAccount(twofaInstance);
        })
        if(twofaInstance){
            $("#2FAForm").find('input[type=number]').on('keyup',function(e) {
                if(e.which == 46 || e.which == 8) {
                    $(this).val("")
                    if($(this).prev() !== undefined)
                        $(this).prev().focus();
                }else{
                    var $this = $(this);
                    setTimeout(function() {
                        if($this.val().length <= 1)
                            $this.next("input").focus();
                        else if($this.val().length > 1){
                            $this.val($this.val().slice(0, -1));
                            $this.next("input").focus();
                        }
                    }, 0);
                }
            });
        }
    }

    async initAddAccount(twofa){
        $('.addAccountContinue').attr('disabled', 'disabled')
        var form = ((twofa) ? $('#2FAForm') : $('#addAccountForm'));
        var userEmail = form.find('#email');
        var userPassword = form.find('#password');
        var user2FA = "none";
        
        if(twofa){
            user2FA = "";
            var ic = 1;
            while (ic <= 6) {
                user2FA += $('#code_'+ic).val().toString();
                ic++;
            }
        }
        FZUtils.loadURL('/logging', [{form: {username: userEmail.val(), password: userPassword.val(), user2FA: user2FA}}, {type: "form"}])
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