const FZUtils = require('../../../utils.js');
const FzPage = require('../../../FzPage.js');



class Settings extends FzPage {

    constructor(){
        super(null)
        
        this.server = this.store.get('serverCurrent').server;
        this.dirServer = `${this.dirFzLauncherServer}\\${this.server.name}`;

        this.keyStoreServerOptions = function(key) {
            return 'server_'+this.server.name.toLowerCase()+'_'+key;
        }

        this.ramAllocateIndexProperties = ((this.store.has(this.keyStoreServerOptions('ramIndex')) ? this.store.get(this.keyStoreServerOptions('ramIndex')) : 0));
        this.listRamAllocate = FZUtils.listRamAllocate();
        var instance = this;
        this.listRamAllocate.list.forEach((element) => {
            var selected = ((this.ramAllocateIndexProperties !== null && this.ramAllocateIndexProperties == element.index) ? "selected" : "")
            var disabledOutOfMemory = ((element.gb > this.listRamAllocate.total_memory) ? "disabled" : "")
            console.log(element.gb+" "+this.listRamAllocate.total_memory)
            $('#inputRamSelector').append('<option value="'+element.index+'" '+selected+' '+disabledOutOfMemory+'>'+element.gb+'G</option>')
        })
        $('#inputRamSelector').change(function() {
            var indexRam = 0;
            $( "#inputRamSelector option:selected" ).each(function() {
                indexRam = $( this ).attr('value');
            });
            instance.store.set(instance.keyStoreServerOptions('ramIndex'), parseInt(indexRam));
            instance.ramAllocateIndexProperties = indexRam;
            instance.notyf("success", "La ram alloué a bien été changé.")
        })
        /*$('.setting.clearDir').click(function() {
            const excludes = ["options.txt", "optionsof.txt", "server.properties", "mods.txt"];
            fs.readdir(dirServer, (err, files) => {
                if (err) throw err;
                
                var filesExcludesPromise = new Promise((resolve, reject) => {
                    var i = 0;
                    for (const file of files) {
                        var pathFileOrDir = dirServer+"\\"+file;
                        var isExclude = false;
                        excludes.forEach((el) => {
                            if(el == file){
                                isExclude = true;
                            }
                        })
                        if(!isExclude){
                            var stat = fs.lstatSync(pathFileOrDir)
                            console.log(stat.isDirectory())
                            if(stat.isDirectory()){
                                fs.rm(pathFileOrDir, { recursive: true, force: true }, () => {
                                    if(files.length == i) resolve();
                                });
                            }else{
                                fs.unlink(dirServer+"\\"+file, err => {
                                    if (err) throw err;
                                    if(files.length == i) resolve();
                                });
                            }
                        }else{
                            resolve();
                        }
                        i++;
                    }
                })
                filesExcludesPromise.then(() => {
                    utilsFZ.toast_success("FzLauncher", "Le dossier serveur de ("+serverCurrent.server.name+") a bien été reset.")
                })
            });
        })*/
    }

}


module.exports = Settings;
