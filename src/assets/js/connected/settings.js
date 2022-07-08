var appRoot = require('app-root-path');
const path = require('path')
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"))
class Settings extends FzPage {

    constructor(){
        super("connected/settings/index.html")
        var instance = this;
        //config-item devTools
        var cantOpenDevTools = (((this.store.has('session')) ? this.store.get('session').role.is_admin : false));
        if(!cantOpenDevTools)
            $('.config-item.devTools').remove();
        $('.settings__open_devTools').on('click', function(){
            const { ipcRenderer } = require('electron');
            ipcRenderer.send('showDevTools');
        })
        $('.settings__lang_item').on('click', function(){
            $('.settings__lang_dmenu').addClass('disabled');
            $('.settings__lang_dmenu').html('...')
            var langKey = $(this).attr('data-lang')
            instance.store.set('lang', langKey)
            FZUtils.loadURL('/connected/layout', [{session: instance.store.get('session')}, {linkPage: "#settings"}, {openPage: "settings"}])
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
        })
        $('.config__launcher_pnotes').on('click', function() {
            instance.showModal(false, 'changelog')
        })
    }

}

module.exports = Settings;