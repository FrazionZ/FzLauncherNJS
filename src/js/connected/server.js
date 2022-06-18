const FzPage = require('../FzPage.js')
const server_config = require('../../../server_config.json')

class Server extends FzPage {

    
    constructor(server){
        super("connected/server/index.html")
        var instance = this;
        this.server = this.store.get('serverCurrent').server;
        this.keyStoreBranch = function(branch) {
            return 'server_'+this.server.name.toLowerCase()+'_'+branch+'_version';
        }

        var mcpVersion = this.store.get(this.keyStoreBranch("mcp"));
        var dependVersion = this.store.get(this.keyStoreBranch("depend"));
        
        $('.server__title').text(this.server.name)
        $('.server__version').text("Version MCP "+mcpVersion)
        $('.server__description').text(this.server.expl_server)
        $('.server__logo').find('img').attr('src', this.server.urlLogo)
    }

}

module.exports = Server;