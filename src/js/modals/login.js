
const FzModal = require('./FzModal.js')

class LoginDialog extends FzModal {

    constructor(showAndLoad){
        super(showAndLoad, "../../template/modals/login.html", "#login");
    }

    loaded(){}

}

module.exports = LoginDialog;