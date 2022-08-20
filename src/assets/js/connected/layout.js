const path = require('path');
const Store = require('electron-store');
var appRoot = require('app-root-path');
const FZUtils = require(path.join(appRoot.path, '/src/assets/js/utils.js'))
const fetchUrl = require('fetch').fetchUrl;
const server_config = require(path.join(appRoot.path, '/server_config.json'));
const ejs = require('ejs')
const { shell } = require('electron')
class Layout {
    
    constructor(linkPage, openPage){
        var instance = this;
        this.store = new Store({accessPropertiesByDotNotation: false});
        this.fs = require('fs');
        server_config.forEach((item, key) => {
            var serverNav =
                '<li class="parent-menu-link" class="nav" id="nav_server_'+key+'" data-bs-toggle="tooltip" data-bs-placement="right" title="'+item.name+'">' +
                    '<a class="menu-link" href="#server" data-server-id="' + key + '">' +
                        '<img width="36" height="36" src="asset://' + item.urlLogo + '">' + item.name
                    '</a>'
                '</li>';
                $('.sidebar').find('#servers').append(serverNav);
        });

        
        
        if(this.store.has('maximizeWindow'))
            if(this.store.get('maximizeWindow'))
                ipcRenderer.send('maximizeWindow', []);

        //CHECK UPDATE
        FZUtils.checkUpdate().then((update) => {
            if(update){
                $('a[href="#aupdate"]').parent().removeClass('hide')
            }
        })

        
        $('body').css('background', 'transparent')
        $('.title_bar .actions .window_maximize').removeClass('hide')

        //PRELOAD DOWNLOAD PAGE AND LOAD/SHOW SERVER 0
        instance.loadContent(((typeof linkPage == "object") ? linkPage : $('#'+linkPage)), openPage, true)
        instance.loadContent(null, "downloads", false)

        $('.parent-menu-link').on('click', function() {
            if($(this).find('a').hasClass('isDisabled'))
                return notyf.error("Le launcher se mets à jour, veuillez patienter...");
            var hyperLink = $(this).find('.menu-link');
            switch(hyperLink.attr('href')){
                case '#server':
                    //LOAD SERVER DATA
                    instance.loadContent($(this), hyperLink.attr('href').replace('#', ''), true)
                    break;
                default:
                    //LOAD PAGE LAMBDA
                    instance.loadContent($(this), hyperLink.attr('href').replace('#', ''), true)
                    break;
            }
        })
    }

    loadDialog(dialog, data, parent){
        var instance = this;
        $('.page').addClass('hide')
        FZUtils.initVariableEJS(data, false).then((datar) => {
            ejs.renderFile(appRoot.path+"/src/template/connected/modals/"+dialog+".ejs", datar, {}, (err, str) => {
                if (err) return console.log(err)
                $('.dialog.page').html(str)
                $('.dialog .dialog_close').on('click', function() {
                    $('.'+parent+'.page').removeClass('hide')
                    $('.dialog.page').empty()
                    $('.dialog.page').addClass('hide')
                })
                $('.dialog.page').removeClass('hide')
            })
        })
    }

    loadContent(nav, url, show){
        var instance = this;
        $('.page').addClass('hide')
        if($('.'+url+'.page').is(':empty')){
            var langListFinal = undefined;
            FZUtils.getLangList().then((langList) => {
                var data = [{session: userSession}, {langsLocale: langList}]
                FZUtils.initVariableEJS(data, false).then((datar) => {
                    ejs.renderFile(appRoot.path+"/src/template/connected/"+url+"/index.ejs", datar, {}, (err, str) => {
                        if (err) return console.log(err)
                        $('.'+url+'.page').html(str)
                        if(show){
                            $('.'+url+'.page').removeClass('hide')
                        }
                        $('a').on('click', function(e){
                            if (this.hasAttribute("data-link")) {
                                $(this).off();
                                var link = $(this).attr('data-link');
                                var opened = false;
                                if(link !== undefined)
                                    if(!opened)
                                        shell.openExternal(link).then(() => {
                                            opened = true;
                                        });
                            }
                        })
                    })
                })
            });
        }
        if(show){
            $('.parent-menu-link').removeClass('active')
            $('.'+url+'.page').removeClass('hide')
            nav.addClass('active')
        }
    }


}

module.exports = Layout;