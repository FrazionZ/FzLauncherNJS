const { Menu } = require('@electron/remote');
const path = require('path')
const customTitlebar = require('@treverix/custom-electron-titlebar');

/*window.addEventListener('will-navigate', async function(e, url) {
    const open = require('open');
    if(url.startsWith("https://") || url.startsWith("http://")){
        e.preventDefault()
        await open(url);
    }
})*/

window.addEventListener('DOMContentLoaded', () => {
    if (process.platform !== 'darwin') {
        var titlebar =  new customTitlebar.Titlebar({
            backgroundColor: customTitlebar.Color.fromHex('#282828'),
            icon: '../../src/img/icons/icon.png',
            titleHorizontalAlignment: "left"
        });
        titlebar.updateMenu(new Menu);
    }
})