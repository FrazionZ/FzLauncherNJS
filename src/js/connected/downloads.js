const FzPage = require('../../js/FzPage.js')

class Downloads extends FzPage {

    constructor(){
        super("connected/profile/index.html")

        //ADD CARD 

        this.htmlAppend = function(uuidDl) {
            return '<div class="card dl-items black-4" id="'+uuidDl+'">'+
                '<div class="card-body flex gap-15 justif-between align-center">'+
                    '<div class="left flex gap-15">'+
                        '<div class="icon">'+
                            '<img src="../img/icons/icon.png" alt="icon" width="58" height="58">'+
                        '</div>'+
                        '<div class="infos flex direct-column">'+
                            '<div class="title"></div>'+
                            '<div class="subtitle"></div>'+
                        '</div>'+
                    '</div>'+
                    '<div class="percent"></div>'+
                '</div>'+
            '</div>';
        };
        
        setInterval(() => {
            var countsDl = $('.listDls').find('.dl-items').length;
            if(countsDl > 0)
                $('.downloads__countDl').text(countsDl)
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
        $('#downloads').find('.listDls').find('#'+uuidDl).find('.title').text(title)
        $('#downloads').find('.listDls').find('#'+uuidDl).find('.subtitle').text(subtitle)
        $('#downloads').find('.listDls').find('#'+uuidDl).find('.percent').text(percentage)
    }

    finishDownload(uuidDl){
        $('.endListDls').find('.nothing').hide();
        $('#downloads').find('.listDls').find('#'+uuidDl).find('.subtitle').text("Terminé")
        $('#downloads').find('.listDls').find('#'+uuidDl).find('.percent').text("")
        $('#downloads').find('.listDls').find('#'+uuidDl).appendTo('.endListDls');
        $('#downloads').find('.listDls').find('#'+uuidDl).remove();
        if($('.listDls').find('.dl-items').length == 0)
            $('.listDls').find('.nothing').show();
    }
}

module.exports = Downloads;