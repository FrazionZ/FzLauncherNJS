const FZUtils = require('../../../utils.js');
const FzPage = require('../../../FzPage.js');



class Settings extends FzPage {

    constructor(){
        super(null)
        
        this.server = this.store.get('serverCurrent').server;
        this.dirServer = `${this.dirFzLauncherServer}\\${this.server.name}`;
        this.buttonActionPlay = $('.btn-download-launch-game');
        this.keyStoreServerOptions = function(key) {
            return 'server_'+this.server.name.toLowerCase()+'_'+key;
        }

        this.ramAllocateIndexProperties = ((this.store.has(this.keyStoreServerOptions('ramIndex')) ? (this.store.get(this.keyStoreServerOptions('ramIndex')) + 1) : undefined));
        this.listRamAllocate = FZUtils.listRamAllocate();
        var instance = this;
        this.listRamAllocate.list.forEach((element) => {
            var selected = ((this.ramAllocateIndexProperties !== null && this.ramAllocateIndexProperties == element.index) ? "selected" : "")
            var disabledOutOfMemory = ((element.gb > this.listRamAllocate.total_memory) ? "disabled" : "")
            $('#inputRamSelector').append('<option value="'+element.index+'" '+selected+' '+disabledOutOfMemory+'>'+element.gb+'G</option>')
        })
        /*$('#inputRamSelector').change(function() {
            var indexRam = 0;
            $( "#inputRamSelector option:selected" ).each(function() {
                indexRam = $( this ).attr('value');
            });
            instance.store.set(instance.keyStoreServerOptions('ramIndex'), parseInt(indexRam));
            instance.ramAllocateIndexProperties = indexRam;
            instance.notyf("success", "La ram alloué a bien été changé.")
        })*/

        if(this.ramAllocateIndexProperties == undefined)
            this.ramAllocateIndexProperties = 1;

        var setRangeSliderRam = function(value, max) {
            var percent = (((value / max * 100)) - 5);
            $('#range_ram_allocate').attr('value', value);
            $('.range_ram_indicator').text(value+" Go")
            $('#range_ram_allocate').css( 'background', 'linear-gradient(to right, var(--color-1) 0%, var(--color-1) '+percent +'%, var(--black-1) ' + percent + '%, var(--black-1) 100%)' );
        };

        
        $('#range_ram_allocate').attr('max', this.listRamAllocate.total_memory)
        document.getElementById('range_ram_allocate').setAttribute('value', this.ramAllocateIndexProperties);
        $('.range_ram_indicator').text(this.listRamAllocate.list[this.ramAllocateIndexProperties].gb+" Go")
        setRangeSliderRam(this.ramAllocateIndexProperties, this.listRamAllocate.total_memory)

        document.getElementById('range_ram_allocate').addEventListener('change',function() {
            //SAVE RAM
            var indexRam = ((document.getElementById('range_ram_allocate').value) - 1);
            instance.store.set(instance.keyStoreServerOptions('ramIndex'), parseInt(indexRam));
            instance.ramAllocateIndexProperties = indexRam;
            instance.notyf("success", "La ram alloué a bien été changé.")
        });
        $( '#range_ram_allocate' ).on( 'input', function( ) {
            setRangeSliderRam(this.value, this.max)
        });
        $('.config__clear_cachesc_dir').on('click', function(){
            if(instance.store.get('gameLaunched'))
                return this.notyf('error', 'Une instance est déjà lancé !')
            $('.config__clear_cachesc_dir').addClass('disabled');
            instance.fs.rm(instance.path.join(instance.dirServer, "assets/frazionz/skins"), { recursive: true, force: true }, (err => {
                $('.config__clear_cachesc_dir').removeClass('disabled');
                if (err) return instance.notyf('error', err);
                else instance.notyf('success', 'Le dossier a bien été supprimé !')
            }));
        })
        $('.config__repare_dir').on('click', function(){
            if(instance.store.get('gameLaunched'))
                return this.notyf('error', 'Une instance est déjà lancé !')
            instance.buttonActionPlay.find('.label').text('Réparer');
            instance.buttonActionPlay.attr('disabled', 'disabled');
            $('.config__repare_dir').addClass('disabled');
            $('.config__clear_dir').addClass('disabled');
            play.prepareInstallOrUpdate();
        })
        $('.config__clear_dir').on('click', function(){
            if(instance.store.get('gameLaunched'))
                return this.notyf('error', 'Une instance est déjà lancé !')
            $('.config__clear_dir').addClass('disabled');
            var excludesFiles = ["resourcepacks", "saves", "shaderpacks", "options.txt", "optionsof.txt"]
            instance.fs.readdir(instance.dirServer, function (err, files) {
                //handling error
                if (err) return instance.notyf('error', err);
                var rmOrUnlinkLoop = new Promise((resolve, reject) => {
                    files.forEach(function (fileOrDir, index, array) {
                        var hasDelete = true;
                        excludesFiles.forEach((excludesFile) => {
                            if(excludesFile == fileOrDir)
                                hasDelete = false;
                        })
                        if(hasDelete){
                            var statFile = instance.fs.lstatSync(instance.path.join(instance.dirServer, fileOrDir));
                            if(statFile.isDirectory()){
                                instance.fs.rm(instance.path.join(instance.dirServer, fileOrDir), { recursive: true, force: true }, (err => {
                                    if (index === array.length -1) resolve();
                                }));
                            }else if(statFile.isFile()){
                                instance.fs.unlink(instance.path.join(instance.dirServer, fileOrDir), (err => {
                                    if (index === array.length -1) resolve();
                                }));
                            }
                        }else
                            if (index === array.length -1) resolve();
                    });
                });
                rmOrUnlinkLoop.then(() => {
                    $('.config__clear_dir').removeClass('disabled');
                    if (err) return instance.notyf('error', err);
                    else {
                        instance.buttonActionPlay.find('.label').text('Installer');
                        instance.buttonActionPlay.removeAttr('disabled')
                        $('.config__clear_dir').addClass('disabled');
                        $('.config__repare_dir').addClass('disabled');
                        instance.buttonActionPlay.on('click', () => {
                            instance.buttonActionPlay.attr('disabled', 'disabled')
                            play.prepareInstallOrUpdate();
                        })
                        instance.notyf('success', 'Le dossier a bien été supprimé !')
                    }
                });
            });
        });
        $('.config__server_checkbox').each((index, element) => {
            if(instance.store.has(instance.keyStoreServerOptions($(element).attr('data-id')))){
                $(element).prop('checked', (instance.store.get(instance.keyStoreServerOptions($(element).attr('data-id'))) ? true : false));
            }else{
                var defaultValue = JSON.parse($(element).attr('data-default').toLowerCase());
                instance.store.set(instance.keyStoreServerOptions($(element).attr('data-id')), defaultValue);
                $(element).prop('checked', defaultValue);
            }
        })
        $('.config__server_checkbox').on('change', function(){
            instance.store.set(instance.keyStoreServerOptions($(this).attr('data-id')), $(this).is(':checked'));
        })
        
    }
    

}


module.exports = Settings;
