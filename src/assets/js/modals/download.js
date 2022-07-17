
const FzModal = require('./FzModal.js')

class DownloadDialog extends FzModal {

    constructor(showAndLoad){
        super(showAndLoad, "../../template/modals/download.html", "#download");
    }

    loaded(){}

    setTitlelabel(titlelabel){
        $("body").find("#modal").find(this.idDom).find('#title_download').text(titlelabel);
    }

    setSublabel(sublabel){
        $("body").find("#modal").find(this.idDom).find('#state_download').text(sublabel);
    }

    setPercentBar(percent){
        console.log(parseInt(percent, 10))
        document.querySelector('body').querySelector('#modal').querySelector(this.idDom).querySelector("#downloadbar").style.width = ""+parseInt(percent, 10).toString()+"%";
    }

}

module.exports = DownloadDialog;