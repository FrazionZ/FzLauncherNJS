"use strict"

const FzPage = require('../../js/FzPage.js')
const Messaging = require('../../js/modals/messaging.js')
class Home extends FzPage {

    constructor(afterLogin){
        super("connected/home.html")
        if(afterLogin){
            $("#header").load("includes/header.html");
        }
    }

}

module.exports = Home;