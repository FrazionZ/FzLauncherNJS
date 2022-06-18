const FzPage = require('./FzPage.js')
const Server = require('./server.js')
const { ipcRenderer } = require("electron");

class Header extends FzPage {

    constructor(load) {
        super(null)
        var instance = this;

        if(load){
            $('.sidebar').find('#navs').load('../template/includes/nav.html', () => {

                servers.forEach((item, key) => {
                    var serverNav =
                    '<li class="parent-menu-link" class="nav" id="nav_server_'+key+'" data-bs-toggle="tooltip" data-bs-placement="right" title="'+item.name+'">' +
                            '<a class="menu-link" href="#server" data-server-id="' + key + '">' +
                                '<img width="36" height="36" src="' + item.urlLogo + '">' + item.name
                            '</a>'
                        '</li>';
                    $('.sidebar').find('#servers').append(serverNav);
                })

                $('.sidebar').removeClass('hide');
                $('.main').removeClass('w-100');
                $('.main').addClass('connected');
                $('#nav_menu_avatar').attr('src', "https://auth.frazionz.net/skins/face.php?u="+this.session.id);
                $('#nav_menu_username').text(this.session.username);
                $('.parent-menu-link').on('click', function() {
                    console.log("loadContent")
                    var contentLink = $(this).find('.menu-link').attr('href');
                    $('[data-bs-toggle="tooltip"]').tooltip('dispose');
                    if(contentLink == "#profilDp") return;
                    if(contentLink == "#logout"){
                        return this.logout();
                    }
                    if(linkCurrent !== contentLink){
                        console.log("linkCurrent contentLink")
                        //var messLoadPage = new Messageging(true, "Veuillez patienter");
                        switch (contentLink) {
                            case "#server":
                                instance.store.set('serverCurrent', {
                                    idServer: $(this).find('.menu-link').attr('data-server-id'),
                                    server: servers[$(this).find('.menu-link').attr('data-server-id')]
                                })
                                instance.loadContent(false, $(this).find('.menu-link'), contentLink, true);
                                break;
                            default:
                                instance.loadContent(false, $(this).find('.menu-link'), contentLink, true);
                                break;
                        }
                    }
                });

                this.store.set('serverCurrent', {
                    idServer: 0,
                    server: servers[0]
                })
                this.loadContent(true, $('#nav_server_0').find('.menu-link'), 'server', true);
                this.loadContent(true, $('#downloads').find('.menu-link'), 'downloads', false);

                //this.loadContent(true, $("#nav_home"), 'home');

                $('.logout').on('click', function() {
                    $('.sidebar').removeClass('hide');
                    $('.main').removeClass('w-100');
                    $('.main').addClass('connected');
                    instance.logout()
                });
            })
        }
    }

    getServersList() {
        return new Server();
    }

    loadContent(afterLogin, linkNav, urlContent, show) {
        console.log("call loadContent")
        var urlFinal = urlContent.replace('#', '')
        if (!($('.login').length == 0)) $('.login').remove();
        $('.pageConnected').hide();
        if ($('.main').find(urlContent).length == 0) {
            var urlContent = "connected/" + urlFinal;
            var backupTop = $("#top").find('#title').text();
            $('.main').append('<div class="pageConnected" id="'+urlFinal+'"><div class="content-child"></div></div>')
            $('.main').find("#" + urlFinal).find('.content-child').load(urlContent + "/index.html", function(response, status, xhr) {
                if (status == "error") {
                    header.notyf('error', 'Impossible de charger la page (' + urlContent + ')')
                    setTitleTop(backupTop)
                } else {
                    if(show){
                        $('.main').find("#" + urlFinal).show();
                        linkCurrent = "#"+urlFinal;
                        $('.menu-link').parent().removeClass('active');
                        linkNav.parent().addClass('active');
                    }else
                        $('.main').find("#" + urlFinal).hide();
                }
            });
        } else {
            linkCurrent = "#"+urlFinal;
            $('.menu-link').parent().removeClass('active');
            linkNav.parent().addClass('active');
            $('#' + urlFinal).fadeIn();
        }
    }

    
}

module.exports = Header;