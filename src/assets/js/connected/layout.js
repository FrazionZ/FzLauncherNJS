const path = require('path');
const Store = require('electron-store');
var appRoot = require('app-root-path');
const FZUtils = require(path.join(appRoot.path, '/src/assets/js/utils.js'))
const fetchUrl = require('fetch').fetchUrl;
const server_config = require(path.join(appRoot.path, '/server_config.json'));
const ejs = require('ejs')
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


        //PRELOAD DOWNLOAD PAGE AND LOAD/SHOW SERVER 0
        instance.loadContent(((typeof linkPage == "object") ? linkPage : $('#'+linkPage)), openPage, true)
        instance.loadContent(null, "downloads", false)

        $('.parent-menu-link').on('click', function() {
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

    loadContent(nav, url, show){
        var instance = this;
        $('.page').addClass('hide')
        if($('.'+url+'.page').is(':empty')){
            var langListFinal = undefined;
            FZUtils.getLangList().then((langList) => {
                var data = [{session: instance.store.get('session')}, {langsLocale: langList}]
                FZUtils.initVariableEJS(data).then((datar) => {
                    ejs.renderFile(appRoot.path+"/src/template/connected/"+url+"/index.ejs", datar, {}, (err, str) => {
                        if (err) return console.log(err)
                        $('.'+url+'.page').html(str)
                        if(show){
                            $('.'+url+'.page').removeClass('hide')
                        }
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