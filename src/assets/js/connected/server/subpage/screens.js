var appRoot = require('app-root-path');
const path = require('path')
const FZUtils = require(path.join(appRoot.path, '/src/assets/js/utils.js'))
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"))
const imageToBase64 = require('image-to-base64');
const { nativeImage, clipboard } = require('electron')

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
        var screensList = [];
        var loadScreensAsync = async() => {
            await this.fs.readdir(this.dirServerScreens, (err, files) => {
                if(err) throw err;
                files.forEach(function(file) {
                    screensList.push({path: instance.path.join(instance.dirServerScreens, file), filename: file });
                })
                var screenClipboard = [];
                var loadScreensList = async() => {
                    return new Promise((resolve, reject) => {
                        screensList.reverse().forEach(async function(screen, index, array) {
                            await imageToBase64(screen.path)
                                .then((response) => {
                                        screenClipboard.push({id: index, path: screen.path});
                                        $('.server.screens').append(
                                            '<div class="col screenItem" data-id='+index+' style="background: url(data:image/png;base64,'+response+')" >'+
                                                '<div class="actions">'+
                                                    '<a href="#" class="btn btn-danger deleteScreen" data-id='+index+'><i class="fa-solid fa-trash"></i></a>'+
                                                '</div>'+
                                            '</div>')
                                    }
                                ).catch(
                                    (error) => {
                                        console.log(error)
                                        instance.notyf("error", "Une erreur est survenue lors de la lecture des screenshots")
                                    }
                                )
                            
                            if(index == array.length - 1) resolve();
                        })
                        if(screensList.length == 0) {
                            instance.notyf("error", "Aucun screenshot n'a été trouvé")
                            resolve();
                        }
                    })
                }
                var endLoadScreensList = async() => {
                    $('.loader-3').remove();
                    $('.screenItem').on('click', function() {
                        instance.notyf('success', 'Copie en cours..');
                        setTimeout(async () => {
                            var id = $(this).data('id');
                            await clipboard.writeImage(nativeImage.createFromPath(screenClipboard[id].path));
                            instance.notyf('success', 'Screenshot copié dans le presse-papier');
                        }, 800)
                    })
                    $('.screenItem').find('.actions').find('.deleteScreen').on('click', function() {
                        var id = $(this).data('id');
                        var parentScreenItem = $(this).parent().parent();
                        var screenPath = screenClipboard[id].path;
                        instance.fs.unlink(screenPath, (err) => {
                            if(err) console.log(err);
                            instance.notyf('success', 'Screenshot supprimé');
                            parentScreenItem.remove();
                        })
                    })
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
