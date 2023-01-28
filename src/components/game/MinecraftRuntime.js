const { Client } = require('minecraft-launcher-core')
let launcher
class MinecraftRuntime {
  constructor(funcMain, ipcMain, mainWindow) {
    this.funcMain = funcMain
    this.ipcMain = ipcMain
    this.mainWindow = mainWindow
    ipcMain.removeHandler('MinecraftRuntime__setting')
    ipcMain.removeHandler('MinecraftRuntime__launching')
    ipcMain.on('MinecraftRuntime__setting', async (event, data) => {
      this.setting(data)
    })
    ipcMain.on('MinecraftRuntime__launching', async (evenct, data) => {
      await this.launching(data)
    })
  }

  setting(opts) {
    this.opts = opts
  }

  async launching(data) {
    launcher = new Client()
    var instance = this

    await launcher.launch(this.opts).then((opts) => {
      
    }).catch((err) => {
      console.log(err)
    })

    console.log('[FzLauncher] Launching instance runtime with ' + this.opts.overrides.minecraftJar)

    var launchGame = false
    launcher.on('debug', (e) => {
      console.log(e.replaceAll('\r', '').replaceAll('\n', ''))
    })
    launcher.on('data', async (e) => {
      console.log(e.replaceAll('\r', '').replaceAll('\n', ''))
      if (!launchGame) {
        launchGame = true
        instance.funcMain.hideApp()
      }
    })
    launcher.on('close', async (code) => {
      instance.funcMain.showApp()
      this.mainWindow.webContents.send('endSessionGame', { code: code })
    })
    launcher.on('error', async (error) => {
      console.log(error)
    })
  }

  arrayBufferToBase64(buffer) {
    var binary = ''
    var bytes = new Uint8Array(buffer)
    var len = bytes.byteLength
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
}

module.exports = MinecraftRuntime
