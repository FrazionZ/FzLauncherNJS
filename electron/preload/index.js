window.ipcRenderer = require('electron').ipcRenderer

import { join } from 'node:path'
const Store = require('electron-store')
const { Lang } = require('../../src/components/Lang')
let store = new Store()
let keyCodeLangStore = store.get('lang', 'fr');

window.initLang = (keyLoad) => {
    return new Promise((resolve, reject) => {
        let lang = new Lang(join(__dirname, '../src/'))
        lang.setLang(keyLoad).then(() => {
            window.lang = lang;
            resolve()
        })
    })
    
}

initLang(keyCodeLangStore)
