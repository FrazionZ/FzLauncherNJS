const FzPage = require('../../js/FzPage.js')
const FZUtils = require('../../js/utils.js');
const { ipcRenderer } = require('electron')
class Profile extends FzPage {

    constructor(){
        super("connected/profile/index.html")
        var instance = this;
        $('#logout').on('click', () => {
            $('.sidebar').removeClass('hide');
            $('.main').removeClass('w-100');
            $('.main').addClass('connected');
            instance.logout()
        })

        var skinUrl = "https://skins.frazionz.net/"+this.store.get('session').id+".png";
        var capeUrl = "https://capes.frazionz.net/"+this.store.get('session').id+".png";
        
        let skinViewer = new skinview3d.SkinViewer({
            canvas: document.getElementById("skin"),
            width: 300,
            height: 400,
            skin: "../img/steve.png"
        });
    
        // Change viewer size
        skinViewer.width = 240;
        skinViewer.height = 352.94;
    
        // Load another skin
        if(FZUtils.UrlExists(skinUrl))
            skinViewer.loadSkin(skinUrl);
        
        
        if(FZUtils.UrlExists(capeUrl))
            skinViewer.loadCape(capeUrl);

            
        skinViewer.playerObject.rotation.y = 31.7;

        let controlInfos = skinview3d.createOrbitControls(skinViewer);
        controlInfos.enableRotate = true;
        controlInfos.enableZoom = false;
        controlInfos.enablePan = false;

        $('.session__username').text(this.store.get('session').username)
        $('.session__money').find('span.key').text(this.store.get('session').money)
        $('.session__email').find('span.key').text(this.store.get('session').email)
        $('.session__createdAt').find('span.key').text(this.store.get('session').created_at)

        $("#skinInput").on('change', function(event) {
            skinViewer.loadSkin(URL.createObjectURL(event.target.files[0]));
        });

        ipcRenderer.on('responseOpenFile', (event, response) => {
            console.log(response)
            $("#skinInput").val(response)
        })


        $('.updateSkinForm').on('click', function(){
            var file_data = $('#skinInput').prop('files')[0];   
            var form_data = new FormData();                  
            form_data.append('skin', file_data);
            form_data.append('access_token', instance.store.get('session').access_token);
            console.log(form_data);                             
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
                    instance.notyf('error', err)
                }
             });
        })
    }

    async logout() {
        if(this.store.has('gameLaunched'))
            if(this.store.get('gameLaunched'))
                return this.notyf('error', 'Vous ne pouvez pas vous déconnecter, une instance Minecraft est ouverte.')
        this.store.delete('session');
        ipcRenderer.send('logout')
    }

}

module.exports = Profile;