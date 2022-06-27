var appRoot = require('app-root-path');
const FzPage = require(path.join(appRoot.path, '/src/assets/js/FzPage.js'))

class Server extends FzPage {

    
    constructor(server){
        super("connected/server/index.html")
        var instance = this;
        this.server = server_config[server];
        this.keyStoreBranch = function(branch) {
            return 'server_'+this.server.name.toLowerCase()+'_'+branch+'_version';
        }

        var mcpVersion = ((this.store.has(this.keyStoreBranch("mcp"))) ? this.store.get(this.keyStoreBranch("mcp")) : " - ");
        var dependVersion = this.store.get(this.keyStoreBranch("depend"));
    }

}

module.exports = Server;