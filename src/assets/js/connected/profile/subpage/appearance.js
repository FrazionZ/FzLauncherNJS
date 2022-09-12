var appRoot = require('app-root-path');
const path = require('path')
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"))
const axios = require('axios').default;
const imageToBase64 = require('image-to-base64');
const { v4: uuidv4 } = require('uuid');
const { cp } = require('fs');
class Appearance extends FzPage {

    constructor(){
        super("connected/profile/index.html")


        var instance = this;

        $('.ui.checkbox').checkbox();
        
        this.skinItemViewer = [];

        //CHECK IF SKIN IS PRESENT IN THE USER'S SKIN LIST
        var checkSkinPresent = async() => {
            return new Promise(async(resolve, reject) => {
                if(FZUtils.UrlExists(profile.skinUrl)){
                    await imageToBase64(profile.skinUrl) // Path to the image
                        .then(
                            async (response) => {
                                await FZUtils.getSkinFromB64(response)
                                    .then(async (dataSkin) => {
                                        resolve({state: ((dataSkin == null) ? false : true), b64: response})
                                    })
                            }
                        )
                        .catch(
                            (error) => {
                                console.log(error)
                                resolve({state: false, b64: null});
                            }
                        )
                }
            })
        }


        checkSkinPresent().then((result) => {
            if(!result.state){
                $('.skinNotPresent').show();
                if(result.b64 !== null){
                    $('.addSkinCurrentShelf').on('click', async() => {
                        await layoutClass.loadModal( "messDialog", [{message: "Ajout de votre skin à la bibliothèque.."}], false, () => {}, () => {}, async () => {
                            const img = new Image();
                            img.src = "data:image/png;base64,"+result.b64;
                            img.onload = async function() {
                                const imgWidth = img.naturalWidth;
                                const imgHeight = img.naturalHeight;

                                if(imgWidth != 64 || imgHeight != 64){
                                    await layoutClass.closeModal();
                                    return profile.notyf("error", "Le skin de "+username+" n'est pas valide !")
                                }else{
                                    FZUtils.storeSkinShelf(userSession.username, result.b64)
                                    FZUtils.loadURL('/connected/layout', [{notyf: {type: "success", value: "Votre skin a bien été ajouté"}}, {session: userSession}, {linkPage: "#profile"}, {openPage: "profile"}])
                                }
                            };
                        })
                    })
                }
            }
        })

        $(".checkbox").find('input[name=typeskin]').on('change', function(event) {
            $(".checkbox").find('input[name=typeskin]').removeAttr('checked');
            $(this).attr('checked', 'checked')
            console.log(event.target.value+" "+((event.target.value == "alex") ? "slim" : "default"))
            skinViewer.loadSkin(profile.skinUrl, { model: ((event.target.value == "alex") ? "slim" : "default") });
        });

        $('.updateSkinTypeForm').on('click', async function(){
            $(this).addClass('disabled')
            var value = $(".checkbox").find('input[name=typeskin][checked=checked]').val();
            var user = await instance.authenticator.update(userSession.access_token, "isSlim", value)
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

        $('.deleteSkinPreview').on('click', async function(){
            $(this).addClass('disabled')
            var idSkin = $('.skin_item.active').attr("data-skin");
            FZUtils.deleteSkinData(idSkin).then(async (result) => {
                if(result)
                    instance.notyf("success", "Votre skin a bien été supprimée")	
                else
                    instance.notyf("error", "Une erreur est survenue")
                $('.skin_item.active').remove()
                $( ".skin_item" ).each(function( index ) {
                    if(index == 0){
                        idSkin = $(this).attr("data-skin");
                        $(this).addClass('active')
                    }
                });
                $('#shelfCountSkinsSpan').html($('.skin_item').length+' / 10 - Skins enregistrés dans la bibliothèque')
                instance.skinLoadPreview(instance, idSkin)
                $(this).removeClass('disabled')
            })
        })

        $('.updateSkinForm').on('click', function(){
            var file_data = $('#skinPreviewApplyInput').prop('files')[0];   
            var form_data = new FormData();    
            form_data.append('skin', file_data); 
            form_data.append('type', $('.checkbox.checked').find('input[name="typeSkinInput"]').val());
            form_data.append('access_token', userSession.access_token);                        
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
                        return instance.notyf('error', response.message)
                    var idSkin = $('.skin_item.active').attr("data-skin");
                    var user = userSession;
                    user.isSlim = (($('.checkbox.checked').find('input[name="typeSkinInput"]').val() == "alex") ? true : false);
                    instance.store.set('session', user)
                    instance.store.set('selectSkin', idSkin)
                    FZUtils.loadURL('/connected/layout', [{notyf: {type: "success", value: "Votre skin a bien été changé"}}, {session: userSession}, {linkPage: "#profile"}, {openPage: "profile"}])
                },
                error: function(err){
                    console.log(err)
                    var responseText = JSON.parse(err.responseText);
                    instance.notyf('error', responseText.message)
                }
            });
        })

        $("#skinInput").on('change', function(event) {
            FZUtils.checkRulesSize(event.target.files[0], 64, 64).then((result) => {
                $(this).parent().find('span').text("Choisir un fichier")
                if(result)
                    $(this).parent().find('span').text(event.target.files[0].name)
                else{
                    $("#skinInput").val(null)
                    profile.notyf("error", "Votre skin doit faire une taille de 64x64 pour être valide !")
                }
            });
        });

        var addSkinFromMojang = async() => {
            await layoutClass.loadModal( "messDialog", [{message: "Recherche et ajout du skin via Mojang.."}], false, () => {}, () => {}, async () => {
                var username = $("#searchSkinInput").val();
                $("#searchSkinInput").attr('disabled', 'disabled')
                    await axios.get("https://api.minetools.eu/uuid/"+$("#searchSkinInput").val().replaceAll('\'', '')).then(async (response) => {
                        var uuid = response.data.id;
                        if(uuid !== null || uuid !== undefined){
                            await axios.get("https://api.minetools.eu/profile/"+uuid).then(async (response) => {
                                if(response.data.status == "ERR"){
                                    $('.forms').show();
                                    await layoutClass.closeModal();
                                    $("#searchSkinInput").val('')
                                    $("#searchSkinInput").removeAttr('disabled')
                                    return profile.notyf("error", "Une erreur est survenue lors du téléchargement du skin de "+username)
                                }
                                var dataAxios = response.data;
                                await imageToBase64(dataAxios.decoded.textures.SKIN.url) // Path to the image
                                    .then(
                                        async (response) => {
    
                                            const img = new Image();
    
                                            img.src = "data:image/png;base64,"+response;
    
                                            img.onload = async function() {
                                                const imgWidth = img.naturalWidth;
                                                const imgHeight = img.naturalHeight;
    
                                                if(imgWidth != 64 || imgHeight != 64){
                                                    $('.forms').show();
                                                    await layoutClass.closeModal();
                                                    $("#searchSkinInput").val('')
                                                    $("#searchSkinInput").removeAttr('disabled')
                                                    return profile.notyf("error", "Le skin de "+username+" n'est pas valide !")
                                                }else{
                                                    FZUtils.storeSkinShelf(dataAxios.decoded.profileName, response)
                                                    FZUtils.loadURL('/connected/layout', [{session: userSession}, {linkPage: "#profile"}, {openPage: "profile"}])
                                                }
                                            };
    
                                           
                                        }
                                    )
                                    .catch(
                                        async (error) => {
                                            console.log(error)
                                            $("#searchSkinInput").val('')
                                            $("#searchSkinInput").removeAttr('disabled')
                                            await layoutClass.closeModal();
                                            profile.notyf("error", "Une erreur est survenue lors du téléchargement du skin de "+username)
                                        }
                                    )
                            })
                        }else{
                            $("#searchSkinInput").val('')
                            $("#searchSkinInput").removeAttr('disabled')
                            await layoutClass.closeModal();
                            profile.notyf("error", "Le joueur n'existe pas")
                        }
                    }).catch(async function (error) {
                        await layoutClass.closeModal("messDialog");
                        $("#searchSkinInput").val('')
                        $("#searchSkinInput").removeAttr('disabled')
                        profile.notyf("error", "Le joueur n'existe pas")
                    });
            })
        }

        $('#searchSkinInput').on('keypress',function(e) {
            if(e.which == 13) {
                addSkinFromMojang()
            }
        });
        $('.searchSkinMojang').on('click', async function(){
            addSkinFromMojang()
        })
        $('.addSkinFileForm').on('click', async function(){
            $('.forms').hide();
            $('.addSkinLoader').removeClass('hide');
            var file_data = $('#skinInput').prop('files')[0];
            var form_data = new FormData();
            await imageToBase64(file_data.path) // Path to the image
                .then(
                    (response) => {
                        FZUtils.storeSkinShelf(file_data.name, response)
                        $('.dialog.page').empty()
                        $('.dialog.page').addClass('hide');
                        FZUtils.loadURL('/connected/layout', [{session: userSession}, {linkPage: "#profile"}, {openPage: "profile"}])
                    })
                    .catch(
                        (error) => {
                            $('.forms').show();
                            $('.addSkinLoader').hide();
                            console.log(error)
                        }
                    )
        })

        $('.viewCapesList').on('click', function(){
            instance.notyf('error', 'Indisponible pour le moment')
            //layoutClass.loadDialog('editcape', [], "profile");
        })

        

        
        var skins = require(this.path.join(this.shelfFzLauncherSkins))


        instance.loadSkinList(instance)

        this.previewSkinViewer = new skinview3d.SkinViewer({
            canvas: document.querySelector('.skinPreview').querySelector('#skin'),
            width: 325,
            height: 345,
        });

        this.previewSkinViewer.loadCape(profile.capeUrl);

        
        this.previewSkinViewer.playerObject.rotation.y = 31.7;
        
        let cipsv = skinview3d.createOrbitControls(this.previewSkinViewer);
        cipsv.enableRotate = true;
        cipsv.enableZoom = false;
        cipsv.enablePan = false;

        
        if(skins.length == 0)
            instance.previewSkinViewer.loadSkin(profile.skinUrl);
        
    }

    async loadSkinList(instance){
        var skins = require(this.path.join(this.shelfFzLauncherSkins))

        var loadSkins = new Promise(async (resolve, reject) => {
                
            $('#skins_list').empty();

            
            var loadSkinAuto = false;

            skins.forEach((skin, k , arr) => {
                let clones = [];
                if(skin !== undefined){
                    if ("content" in document.createElement("template")) {
                        // On prépare une ligne pour le tableau
                        var template = document.querySelector("#skins_list");
                            
                        var tbody = document.querySelector("#skins_list");
                        const clone = document.importNode(template.content, true);
    
                        //const pathSkin = instance.path.join(instance.dirFzLauncherSkins, skin);
    
                        /*clone.querySelector("#deleteSkin").setAttribute("data-skin", skin)
                        clone.querySelector("#deleteSkin").onclick = function() {  
                            instance.fs.unlink(pathSkin, (err) => {})
                            instance.notyf('success', "Le skin a bien été supprimé")
                            FZUtils.loadURL('/connected/layout', [{session: instance.store.get('session')}, {linkPage: "#profile"}, {openPage: "profile"}])
                        };*/
                        if(instance.store.has('selectSkin')){
                            if(instance.store.get('selectSkin') == skin.id){
                                loadSkinAuto = true;
                                $('.skin_item').removeClass('active')
                                clone.querySelector('.skin_item').classList.add('active')
                            }
                        }else if(k == 0)
                            clone.querySelector('.skin_item').classList.add('active')
                        if(!loadSkinAuto && k == 0)
                            clone.querySelector('.skin_item').classList.add('active')
                        clone.querySelector('.skin_item').setAttribute("data-skin", skin.id)
                        clone.querySelector('.skin_item').querySelector('#skin_name').textContent = skin.name
                        clone.querySelector('.skin_item').querySelector('#skin_model').textContent = "Modèle "+skin.model


                        let skinViewer = new skinview3d.SkinViewer({
                            canvas: clone.querySelector("#skin"),
                            width: 145,
                            height: 145
                        });

                        skinViewer.loadSkin("data:image/png;base64,"+skin.base64, { model: ((skin.model == "alex") ? "slim" : "default") })

                        skinViewer.playerObject.rotation.y = 31.7;
                            
                        instance.skinItemViewer.push({sviewer: skinViewer, idSkin: skin.id})
        
                        tbody.appendChild(clone);
                        clones.push(clone)
                    }
                    
    
                    if (k === arr.length-1) resolve(clones);
                }
            })

        })
    
        loadSkins.then(() => {
            $('.loader-26').remove()
            instance.skinLoadPreview(instance, ($('.skin_item.active').attr("data-skin")))
            $('.skin_item').on('click', function(){
                $('.skin_item').removeClass('active')
                $(this).addClass('active')
                instance.skinLoadPreview(instance, ($(this).attr("data-skin")))
            })
            $('input[name="typeSkinInput"]').on('change', function(){
                $(this).attr('disabled', 'disabled')
                var idSkin = $('.skin_item.active').attr("data-skin");
                FZUtils.updateSkinData(idSkin, "model", $(this).val()).then((result) => {
                    if(!result)
                        return instance.notyf('error', 'Impossible de modifier le type du skin')
                    instance.skinItemViewer.forEach(async (skinViewer) => {
                        var skinData = await FZUtils.getSkinFromID(skinViewer.idSkin)
                        skinViewer.sviewer.loadSkin("data:image/png;base64,"+skinData.base64, { model: ((skinData.model == "alex") ? "slim" : "default") })
                    })
                    $('input[name="typeSkinInput"]').removeAttr('disabled')
                    instance.skinLoadPreview(instance, (idSkin))
                    //FZUtils.loadURL('/connected/layout', [{notyf: {type: "success", value: "Le type skin a bien été changé"}}, {session: profile.store.get('session')}, {linkPage: "#profile"}, {openPage: "profile"}])
                });
            })
            $('#nameSkinInput').on('keypress',function(e) {
                if(e.which == 13) {
                    $('#nameSkinInput').attr('disabled', 'disabled')
                    var idSkin = $('.skin_item.active').attr("data-skin");

                    var newName = $('#nameSkinInput').val();
                    if(newName.length > 24){
                        $('#nameSkinInput').removeAttr('disabled')
                        return instance.notyf('error', 'Le nom du skin est trop long')
                    }

                    FZUtils.updateSkinData(idSkin, "name", newName).then((result) => {
                        if(result)
                            instance.notyf('success', 'Le nom du skin a bien été modifié')
                        else
                            instance.notyf('error', 'Impossible de modifier le nom du skin')
                        $('.skin_item[data-skin="'+idSkin+'"]').find('#skin_name').html(newName)
                        $('#nameSkinInput').removeAttr('disabled')
                        $('#nameSkinInput').trigger()
                    });
                }
            });
        })
    }

    async dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    }

    async skinLoadPreview(instance, idSkin) {
        FZUtils.getSkinFromID(idSkin).then(async (dataSkin) => {
            if(dataSkin !== undefined){

                console.log(dataSkin)
                $('input[name="typeSkinInput"][value="'+dataSkin.model+'"]').prop('checked', true)
                
                $('.skinPreview').find('#nameSkinInput').val(dataSkin.name)
    
                instance.previewSkinViewer.loadSkin("data:image/png;base64,"+dataSkin.base64, { model: ((dataSkin.model == "alex") ? "slim" : "default") })
    
    
                var file = await instance.dataURLtoFile("data:image/png;base64,"+dataSkin.base64, uuidv4()+".png");
                let container = new DataTransfer();
                container.items.add(file);
                document.querySelector('#skinPreviewApplyInput').files = container.files;
            }else
                instance.notyf("error", "Impossible de charger ce skin.")
        })

       
        //skinPreviewApplyInput
    }
}

module.exports = Appearance;