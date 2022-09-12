var appRoot = require('app-root-path');
const path = require('path')
const FZUtils = require(path.join(appRoot.path, '/src/assets/js/utils.js'))
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"))
const imageToBase64 = require('image-to-base64');
const { nativeImage, clipboard } = require('electron')
var Mousetrap = require('mousetrap');
const { resolve } = require('path');

class Screens extends FzPage {

    constructor(server){
        super("connected/profile/index.html")
        this.path = require('path');
        this.server = server_config[server];
        this.dirServerScreens = this.path.join(this.dirFzLauncherServer, this.server.name, "screenshots");
        console.log("Load screen in "+this.dirServerScreens)
        if(!this.fs.existsSync(this.dirServerScreens))
            this.fs.mkdirSync(this.dirServerScreens);
            
        var instance = this;
        this.screensList = [];
        var loadScreensAsync = async() => {
            await this.fs.readdir(this.dirServerScreens, (err, files) => {
                if(err) throw err;
                files.forEach(function(file) {
                    instance.screensList.push({path: instance.path.join(instance.dirServerScreens, file), filename: file });
                })
                var screenClipboard = [];
                $('.server.screens').empty()
                var loadScreensList = async() => {
                    return new Promise((resolve, reject) => {
                        instance.screensList.reverse().forEach(async function(screen, index, array) {
                            await imageToBase64(screen.path)
                                .then((response) => {
                                        screenClipboard.push({id: index, path: screen.path});
                                        $('.server.screens').append('<div class="col screenItem" data-id='+index+' style="background: url(data:image/png;base64,'+response+')" ></div>')
                                    }
                                ).catch(
                                    (error) => {
                                        console.log(error)
                                        instance.notyf("error", "Une erreur est survenue lors de la lecture des screenshots")
                                    }
                                )
                            
                            if(index == array.length - 1) resolve();
                        })
                        if(instance.screensList.length == 0) {
                            instance.notyf("error", "Aucun screenshot n'a été trouvé")
                            resolve();
                        }
                    })
                }
                var endLoadScreensList = async() => {
                    var selectScreens = [];
                    $('.loader-3').remove();
                    $( ".screenItem" ).hover(
                        function() {
                          $( this ).addClass( "hover" );
                        }, function() {
                          $( this ).removeClass( "hover" );
                        }
                      );
                    Mousetrap.bind(['leftclick'], async function() {
                        if($(".screenItem.hover").length == 1){
                            var parentScreenItem = $(".screenItem.hover");
                            var idScreenItem = parentScreenItem.data('id');
                            const imageToBase64 = require('image-to-base64');

                            await imageToBase64(screenClipboard[idScreenItem].path)
                                .then( (response) => {
                                    layoutClass.loadModal( "screenDetails", [{picture: response}], true, 
                                    /*DELETE*/ 
                                    () => {
                                        layoutClass.closeModal()
                                        var screenPath = screenClipboard[idScreenItem].path;
                                        instance.fs.unlink(screenPath, (err) => {
                                            if(err) console.log(err);
                                            instance.notyf('success', 'Screenshot supprimé');
                                            parentScreenItem.remove();
                                        })
                                    }, 
                                    /*COPY*/ 
                                    () => {
                                        layoutClass.closeModal("screenDetails").then(() => {
                                            layoutClass.loadModal( "messDialog", [{message: "Copie de la capture d'écran en cours.."}], false, () => {})
                                            setTimeout(async () => {
                                                await clipboard.writeImage(nativeImage.createFromPath(screenClipboard[idScreenItem].path));
                                                layoutClass.closeModal("messDialog")
                                                instance.notyf('success', 'Screenshot copié dans le presse-papier');
                                            }, 800)
                                        })
                                    }, 
                                    () => {})
                                }
                            )
                            .catch(
                                (error) => {
                                    console.log(error);
                                }
                            )
                        }
                    })
                    /*Mousetrap.bind(['ctrl+leftclick'], function() {
                        if($(".screenItem.hover").length == 1){
                            var selectedPrompt = $('.server .screens.selectedPrompt');
                            var dataIDScreen = $(".screenItem.hover").attr('data-id');

                            if(!selectScreens.includes(dataIDScreen)) selectScreens.push(dataIDScreen)
                            else selectScreens = selectScreens.filter(item => (item !== dataIDScreen));

                            if(selectScreens.length > 0) selectedPrompt.show();
                            else selectedPrompt.hide();

                            selectedPrompt.find('#indicator').text(selectScreens.length+" screens sélectionnés")
                        }
                    })
                    $('.selectedPrompt .delete').on('click', async function(){
                        layoutClass.loadModal( "messDialog", [{message: "Suppression des screens en cours.."}], false, () => {})
                        var deleteListSelectedPrompt = async() => {
                            return new Promise((resolve, reject) => {
                                selectScreens.forEach((dataID, index, array) => {
                                    var screenPath = screenClipboard[dataID].path;
                                    instance.fs.unlink(screenPath, (err) => {
                                        if(err) console.log(err);
                                        if (index === array.length -1) resolve();
                                    })
                                })
                            })
                        }
                        deleteListSelectedPrompt().then(() => {
                            setTimeout(() => {
                                instance.screensList = [];
                                $('.selectedPrompt').hide();
                                layoutClass.closeModal("messDialog")
                                loadScreensAsync();
                                instance.notyf('success', 'Screenshots supprimé');
                            }, 1000)
                        })
                    })*/
                }
                loadScreensList().then(endLoadScreensList);
            })
        }
        setTimeout(()=>{
            loadScreensAsync();
        }, 1500)
    }
}

module.exports = Screens;
