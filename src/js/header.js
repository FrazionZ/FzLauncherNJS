"use strict"

const FzPage = require('./FzPage.js')
const Server = require('./server.js')

class Header extends FzPage {

    constructor() {
        super(null)
    }

    getServersList() {
        return new Server();
    }

    
}

module.exports = Header;