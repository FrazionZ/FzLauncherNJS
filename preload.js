const { Menu } = require('@electron/remote');
const { consoleSandbox } = require('@sentry/utils');
const Store = require('electron-store');

store = new Store({accessPropertiesByDotNotation: false});

var sentryInit = ((store.has('launcher__sentry')) ? store.get('launcher__sentry') : true)
if(sentryInit){
  console.log('[FZLauncher] Launch sentry service..')
  const Sentry = require('@sentry/electron')
  Sentry.init({
    dsn:  "https://bb48df8adaeb4da6b84b94ae6382c098@o1316392.ingest.sentry.io/6570059",
    environment: process.env.NODE_ENV,
  })
}else
  console.log('[FZLauncher] Sentry service not launch..')



/*window.addEventListener('will-navigate', async function(e, url) {
    const open = require('open');
    if(url.startsWith("https://") || url.startsWith("http://")){
        e.preventDefault()
        await open(url);
    }
})*/

