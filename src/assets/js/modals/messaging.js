
const FzModal = require('./FzModal.js')

class Messaging extends FzModal {

    constructor(showAndLoad, message){
        super(showAndLoad, "../../template/modals/messaging.html", "#messaging");
        this.message = message;
    }

    loaded(){
        this.dom.find('.modal-body').find('#msg_modal').text(this.message)
    }

}

module.exports = Messaging;