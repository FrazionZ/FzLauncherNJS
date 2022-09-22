var appRoot = require('app-root-path');
const FzPage = require(path.join(appRoot.path, '/src/assets/js/FzPage.js'))

class Server extends FzPage {

    
    constructor(server){
        super("connected/server/index.html")
        var instance = this;
        this.server = server_config[server];
        this.dirServer = path.join(this.dirFzLauncherServer, this.server.name);
        this.keyStoreBranch = function(branch) {
            return 'server_'+this.server.name.toLowerCase()+'_'+branch+'_version';
        }

        var mcpVersion = ((this.store.has(this.keyStoreBranch("mcp"))) ? this.store.get(this.keyStoreBranch("mcp")) : " - ");
        var dependVersion = this.store.get(this.keyStoreBranch("depend"));

        var versions = path.join(this.dirServer, "versions");
        if(!this.fs.existsSync(this.dirServer))
            this.fs.mkdirSync(this.dirServer);
        if(!this.fs.existsSync(versions))
            this.fs.mkdirSync(versions);
        this.server.github.forEach((git) => {
            var gitBranch = path.join(versions, git.branch);
            if(!this.fs.existsSync(gitBranch))
                this.fs.mkdirSync(gitBranch);
        })
    }

}

module.exports = Server;