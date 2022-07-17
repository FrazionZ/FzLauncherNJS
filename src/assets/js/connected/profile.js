var appRoot = require('app-root-path');
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"))
const Authenticator = require('azuriom-auth').Authenticator;
const axios = require('axios').default;
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


        var skinUrl = "https://api.frazionz.net/skins/display?username="+this.store.get('session').username;
        var capeUrl = "https://api.frazionz.net/capes/display?username="+this.store.get('session').username;
        
        let skinViewer = new skinview3d.SkinViewer({
            canvas: document.getElementById("skin"),
            width: 300,
            height: 400,
            skin: "asset://img/steve.png"
        });
    
        // Change viewer size
        skinViewer.width = 240;
        skinViewer.height = 352.94;
    
        // Load another skin
        skinViewer.loadSkin(skinUrl, { model: ((this.store.get('session').isSlim) ? "slim" : "default") });
        
        skinViewer.loadCape(capeUrl);

            
        skinViewer.playerObject.rotation.y = 31.7;

        let controlInfos = skinview3d.createOrbitControls(skinViewer);
        controlInfos.enableRotate = true;
        controlInfos.enableZoom = false;
        controlInfos.enablePan = false;

        $("#skinInput").on('change', function(event) {
            FZUtils.checkRulesSize(event.target.files[0], 64, 64).then((result) => {
                $(this).parent().find('span').text("Choisir un fichier")
                if(result){
                    skinViewer.loadSkin(URL.createObjectURL(event.target.files[0]));
                    $(this).parent().find('span').text(event.target.files[0].name)
                }else{
                    $("#skinInput").val(null)
                    instance.notyf("error", "Votre skin doit faire une taille de 64x64 pour être valide !")
                }
            });
        });

        $(".checkbox").find('input[name=typeskin]').on('change', function(event) {
            $(".checkbox").find('input[name=typeskin]').removeAttr('checked');
            $(this).attr('checked', 'checked')
            console.log(event.target.value+" "+((event.target.value == "alex") ? "slim" : "default"))
            skinViewer.loadSkin(skinUrl, { model: ((event.target.value == "alex") ? "slim" : "default") });
        });

        $('.updateSkinTypeForm').on('click', async function(){
            $(this).addClass('disabled')
            var value = $(".checkbox").find('input[name=typeskin][checked=checked]').val();
            var user = await instance.authenticator.update(instance.store.get('session').access_token, "isSlim", value)
            if(user.status !== undefined){
                if(user.status == "error"){
                    return instance.notyf("error", user.message)
                }
            }
            user = user.data;
            instance.store.set('session', user)
            $(this).removeClass('disabled')
            return instance.notyf("success", "Votre type de skin a bien été changé")
        })

        ipcRenderer.on('responseOpenFile', (event, response) => {
            console.log(response)
            $("#skinInput").val(response)
        })


        $('.updateSkinForm').on('click', function(){
            var file_data = $('#skinInput').prop('files')[0];   
            var form_data = new FormData();                  
            form_data.append('skin', file_data);
            form_data.append('access_token', instance.store.get('session').access_token);                        
            $.ajax({
                url: 'https://frazionz.net/api/skin-api/skins/update', // <-- point to server-side PHP script 
                dataType: 'json',  // <-- what to expect back from the PHP script, if anything
                cache: false,
                contentType: false,
                processData: false,
                data: form_data,                         
                type: 'post',
                success: function(response){
                    if(!response.status)
                        instance.notyf('error', response.message)
                    else
                        instance.notyf('success', "Votre skin a bien été changé")
                    $('#skinInput').val(null);
                    $('#nav_menu_avatar').attr('src', '');
                    $('#nav_menu_avatar').attr('src', "https://auth.frazionz.net/skins/face.php?u="+instance.store.get('session').id);
                },
                error: function(err){
                    var responseText = err.responseText;
                    instance.notyf('error', responseText.message)
                }
             });
        })
    }

    async logout() {
        FZUtils.checkedIfinecraftAlreadyLaunch().then((result) => {
            if(result)
                return this.notyf('error', 'Vous ne pouvez pas vous déconnecter, une instance Minecraft est ouverte.')
            else {
                this.store.delete('session');
                ipcRenderer.send('logout')
            }
        })
    }

}

module.exports = Profile;