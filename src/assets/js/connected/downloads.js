var appRoot = require('app-root-path');
const path = require('path')
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"))
class Downloads extends FzPage {

    constructor(){
        super("connected/profile/index.html")

        //ADD CARD 

        this.htmlAppend = function(uuidDl) {
            return '<div class="card dl-items black-4" id="'+uuidDl+'">'+
                '<div class="card-body flex gap-15 direct-column justif-between">'+
                    '<div class="left flex gap-30 align-center">'+
                        '<div class="icon">'+
                            '<span class="percent"></span>'+
                        '</div>'+
                        '<div class="infos flex direct-column w-100">'+
                            '<div class="title  w-100"></div>'+
                            '<div class="subtitle  w-100"></div>'+
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
            var countsEndDl = $('.endListDls').find('.dl-items').length;
            var countsFinal = parseInt(countsDl) + parseInt(countsEndDl);
            if(countsDl > 0)
                if(!$('.avatar.nav').hasClass('animate__animated'))
                    $('.avatar.nav').addClass('animate__animated')
            else
                if($('.avatar.nav').hasClass('animate__animated'))
                    $('.avatar.nav').removeClass('animate__animated')
            if(countsFinal > 0)
                $('.downloads__countDl').text(countsFinal)
            else
                $('.downloads__countDl').text("")
        }, 500)
    }

    addDownload(uuidDl){
        if($('.listDls').find('#'+uuidDl).length == 0){
            $('.listDls').append(this.htmlAppend(uuidDl))
            $('.listDls').find('.nothing').hide();
        }
    }

    updateDownload(uuidDl, title, subtitle, percentage){
        this.addDownload(uuidDl);
        $('.downloads').find('.listDls').find('#'+uuidDl).find('.title').text(title)
        $('.downloads').find('.listDls').find('#'+uuidDl).find('.subtitle').text(subtitle)
        $('.downloads').find('.listDls').find('#'+uuidDl).find('.percent').text(percentage+"%")
        document.querySelector('#downloadbar').style.width = percentage+'%';
    }

    finishDownload(uuidDl){
        $('.endListDls').find('.nothing').hide();
        $('.downloads').find('.listDls').find('#'+uuidDl).find('.subtitle').text("Terminé")
        $('.downloads').find('.listDls').find('#'+uuidDl).find('.icon').remove()
        $('.downloads').find('.listDls').find('#'+uuidDl).find('.progress').remove()
        $('.downloads').find('.listDls').find('#'+uuidDl).prependTo('.endListDls');
        $('.downloads').find('.listDls').find('#'+uuidDl).remove();
        if($('.listDls').find('.dl-items').length == 0)
            $('.listDls').find('.nothing').show();
    }
}

module.exports = Downloads;