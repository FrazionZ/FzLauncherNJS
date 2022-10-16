var appRoot = require('app-root-path');
const path = require('path')
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"))
let downloadsTask = [];
class Downloads extends FzPage {

    constructor(){
        super("connected/profile/index.html")

        //ADD CARD 

        this.htmlAppend = function(uuidDl) {
            return '<div class="card dl-items black-4" id="'+uuidDl+'">'+
                '<div class="card-body flex gap-15 direct-column justif-between">'+
                    '<div class="left flex gap-30 align-center">'+
                        '<div class="icon">'+
                            '<span class="percent">0%</span>'+
                        '</div>'+
                        '<div class="infos flex direct-column w-100">'+
                            '<div class="title  w-100">Chargement des données</div>'+
                            '<div class="subtitle  w-100">veuillez patienter</div>'+
                        '</div>'+
                    '</div>'+
                    '<div class="progress  w-100">'+
                        '<div class="indicator" id="downloadbar" style="width: 0%;"></div>'+
                    '</div>'+
                '</div>'+
            '</div>';
        };
        
        setInterval(() => {
            var countsDl = $('.listDls').find('.dl-items').length;
            var countsFinal = parseInt(countsDl);
            /*if(countsDl > 0)
                if(!$('.avatar.nav').hasClass('animate__animated'))
                    $('.avatar.nav').addClass('animate__animated')
            else
                if($('.avatar.nav').hasClass('animate__animated'))
                    $('.avatar.nav').removeClass('animate__animated')*/
            if(countsFinal > 0)
                $('.downloads__countDl').text(countsFinal)
            else
                $('.downloads__countDl').text("")
        }, 500)

        
        $( '.sidebar #navs .parent-menu-link' ).hover(
            function() {
                var task = $(this).find('a').attr('href');
                if(task == "#downloads"){
                    var taskOverlay = $('.taskOverlay');
                    taskOverlay.show()
                }
            }, function() {
                var task = $(this).find('a').attr('href');
                if(task == "#downloads"){
                    var taskOverlay = $('.taskOverlay');
                    taskOverlay.hide()
                }
            }
        );
    }

    addDownload(uuidDl, type, ){
        downloadsTask.push({uuidDl: uuidDl, title: type+" - Téléchargement des fichiers", subtitle: " - ", percentage: 0, finish: false});
        if($('.listDls').find('#'+uuidDl).length == 0){
            $('.listDls').append(this.htmlAppend(uuidDl))
            $('.listDls').find('.nothing').hide();
            $('.taskOverlay').find('.nothing').hide();
            $('.taskOverlay').find('.card.dl-items').removeClass('hide');
        }
    }

    async updateDownload(uuidDl, title, subtitle, state){
        this.addDownload(uuidDl);
        $('.downloads').find('.listDls').find('#'+uuidDl).find('.title').text(title)
        $('.downloads').find('.listDls').find('#'+uuidDl).find('.subtitle').text(subtitle)
        $('.downloads').find('.listDls').find('#'+uuidDl).find('.percent').text(state.percentage+"%")
        $('.downloads').find('.listDls').find('#'+uuidDl).find('.indicator').width(state.percentage+'%');


        //OVERLAY
        var firstTask = $('.listDls').find('.dl-items')[0];
        var idFirstTask = $(firstTask).attr('id');
        if(uuidDl == idFirstTask){
            $('.taskOverlay').find('.card.dl-items').find('.title').text(title)
            $('.taskOverlay').find('.card.dl-items').find('.subtitle').text(subtitle)
            $('.taskOverlay').find('.card.dl-items').find('.percent').text(state.percentage+"%")
            $('.taskOverlay').find('.card.dl-items').find('.indicator').width(state.percentage+'%');
        }
    }

    finishDownload(uuidDl){
        $('.endListDls').find('.nothing').hide();
        $('.downloads').find('.listDls').find('#'+uuidDl).find('.subtitle').text("Terminé")
        $('.downloads').find('.listDls').find('#'+uuidDl).find('.icon').remove()
        $('.downloads').find('.listDls').find('#'+uuidDl).find('.progress').remove()
        $('.downloads').find('.listDls').find('#'+uuidDl).prependTo('.endListDls');
        $('.downloads').find('.listDls').find('#'+uuidDl).remove();
        if($('.listDls').find('.dl-items').length == 0){
            $('.listDls').find('.nothing').show();
            $('.taskOverlay').find('.nothing').show();
            $('.taskOverlay').find('.card.dl-items').addClass('hide');
        }
    }
}

module.exports = Downloads;