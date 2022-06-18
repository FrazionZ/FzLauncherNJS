
const FzModal = require('./FzModal.js')

class CrashGameDialog extends FzModal {

    constructor(showAndLoad){
        super(showAndLoad, "../../template/modals/crashgame.html", "#crashgames");
    }

}

module.exports = CrashGameDialog;