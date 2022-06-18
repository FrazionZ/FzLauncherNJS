const Store = require('electron-store');

class Language {

    
    constructor(){
        const store = new Store({accessPropertiesByDotNotation: false});
        this.langDefault = "fr";
        this.langLocal = true;
        if(store.has('lang')){
            this.langDefault = store.get('lang').key;
            this.langLocal = store.get('lang').local;
        }
        if(this.langLocal){
            this.lang = require('../languages/'+this.langDefault+'.json')
        }
    }

    getLanguage(){
    }




}

module.exports = Language;