var appRoot = require('app-root-path');
const path = require('path')
const { shell } = require('electron');
const { data } = require('jquery');
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"))
class Settings extends FzPage {

    constructor(){
        super("connected/settings/index.html")
        var instance = this;
        //config-item devTools
        var cantOpenDevTools = userSession.role.is_admin;
        if(!cantOpenDevTools)
            $('.config-item.devTools').remove();
        $('.settings__open_devTools').on('click', function(){
            const { ipcRenderer } = require('electron');
            ipcRenderer.send('showDevTools');
        })
        $('.settingsFZUtils.getLangKey_item').on('click', function(){
            $('.settingsFZUtils.getLangKey_dmenu').addClass('disabled');
            $('.settingsFZUtils.getLangKey_dmenu').html('...')
            var langKey = $(this).attr('data-lang')
            instance.store.set('lang', langKey)
            FZUtils.loadURL('/connected/layout', [{session: userSession}, {linkPage: "#settings"}, {openPage: "settings"}])
        })
        $('.config__launcher_checkbox').each((index, element) => {
            if(instance.store.has($(element).attr('data-id'))){
                $(element).prop('checked', (instance.store.get($(element).attr('data-id')) ? true : false));
            }else{
                var defaultValue = JSON.parse($(element).attr('data-default').toLowerCase());
                instance.store.set($(element).attr('data-id'), defaultValue);
                $(element).prop('checked', defaultValue);
            }
        })
        $('.config__launcher_checkbox').on('change', function(){
            instance.store.set($(this).attr('data-id'), $(this).is(':checked'));
            if($(this)[0].hasAttribute('data-notyf')){
                instance.notyf('success', $(this).attr('data-notyf'))
            }
            if($(this)[0].hasAttribute('data-callback')){
                eval($(this).attr('data-callback'));
            }
        })

        $('.config__choose_dirapp').on('click', function() {
            ipcRenderer.send('openDialogExpFileRequest', {dialog: { defaultPath: instance.dirFzLauncherRoot, properties: ['openFile', 'openDirectory'] }, channel: "appDataDirRequest"});
            ipcRenderer.on('appDataDirRequest', (event, dataDirPath) => {
                if(dataDirPath.filePaths.length == 0) return;
                if(path.join(dataDirPath.filePaths[0]) !== instance.dirFzLauncherRoot)
                    instance.fzUtils.modifyAppDataDir(layoutClass, path.join(dataDirPath.filePaths[0]))
                ipcRenderer.removeAllListeners('openDialogExpFileRequest')
                ipcRenderer.removeAllListeners('appDataDirRequest')
            })
        })
        $('.config__launcher_pnotes').on('click', function() {
            layoutClass.loadDialog('changelog', [], "settings");
        })

        var valueLangs = [];
        var langConf = this.store.get('lang');
        $('.ui.dropdown.config__choose_langapp input[name="langKey"]').val(langConf);
        this.fzUtils.getLangList().then(async (langList) => {
            for await (const lang of langList){
                valueLangs.push({name: lang.display, value: lang.keycode, selected: ((langConf == lang.keycode) ? true : false)})
            }
            $('.ui.dropdown.config__choose_langapp').dropdown({ values: valueLangs, 
                onChange: function(value, text, $selectedItem) {
                    if(langConf !== value && value !== ""){
                        instance.store.set('lang', value)
                        FZUtils.loadURL('/connected/layout', [{session: userSession}, {linkPage: "#settings"}, {openPage: "settings"}])
                    }
                } 
            })
        })
        //$('.config__switch_branch.ui.dropdown').dropdown({ values: valueGits })
    }

}

module.exports = Settings;