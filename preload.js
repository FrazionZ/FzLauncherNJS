const { Menu } = require('@electron/remote');
const { consoleSandbox } = require('@sentry/utils');

const Sentry = require('@sentry/electron')
Sentry.init({
  dsn: 'https://22c32b0ec90c4a56924fd5d6e485e698@o1296996.ingest.sentry.io/6524957',
  environment: process.env.NODE_ENV,
})


/*window.addEventListener('will-navigate', async function(e, url) {
    const open = require('open');
    if(url.startsWith("https://") || url.startsWith("http://")){
        e.preventDefault()
        await open(url);
    }
})*/

