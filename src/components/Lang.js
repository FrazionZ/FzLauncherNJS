const fs = require('fs')
const path = require('path')

class Lang {

    dirLang = null
    langs = []

    langSelect
    langSelectIndex
    langDefault
    langDefaultKeyCode = "fr"

    constructor(dir) {
        this.dirLang = path.join(dir, '../../src/assets/languages');
    }
        
    async initLang() {
        return new Promise(async (resolve, reject) => {
            let dirLangs = fs.readdirSync(this.dirLang);
            for await (const lang of dirLangs) {
                let langRequire = require(path.join(this.dirLang, lang))
                this.langs.push(langRequire)
            }
            resolve()
        })
    }

    async setLang(keycode) {
        this.langs = [];
        this.langSelect = null;
        this.langSelectIndex = null;
        return new Promise((resolve, reject) => {
            this.initLang().then(() => {
                if (this.langs.length > 0) {
                    this.langSelect = this.langs.find(lang => lang?.infos?.keycode == keycode)
                    this.langSelectIndex = this.langs.findIndex(lang => lang?.infos?.keycode == keycode)
                    this.langDefault = this.langs.find(lang => lang?.infos?.keycode == this.langDefaultKeyCode)
                    resolve()
                }
            })
        })
    }

    getLangCurrent() {
        return this.langSelect;
    }

    getLangIndex() {
        return this.langSelectIndex;
    }

}


module.exports = { Lang }
