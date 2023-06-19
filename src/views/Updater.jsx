import React from 'react'
import PropTypes from 'prop-types'
const { app } = require('@electron/remote');
const EAU = require('electron-asar-hot-updater')
import FzVariable from '../components/FzVariable'
const fzVariable = new FzVariable()
import packageJson from '../../package.json'
let branch
switch (process.platform) {
  case 'linux':
    branch = 'linux'
    break
  case 'win32':
  default:
    branch = 'windows'
    break
}

class Updater extends React.Component {
  static get propTypes() {
    return {
      router: PropTypes.any
    }
  }

  constructor(props) {
    super(props)
    this.router = this.props.appRouter

    if (!fzVariable.fs.existsSync(fzVariable.dirFzLauncherRoot))
      fzVariable.fs.mkdirSync(fzVariable.dirFzLauncherRoot)

    if (!fzVariable.fs.existsSync(fzVariable.dirFzLauncherDatas))
      fzVariable.fs.mkdirSync(fzVariable.dirFzLauncherDatas)

    if (!fzVariable.fs.existsSync(fzVariable.dirFzLauncherServer))
      fzVariable.fs.mkdirSync(fzVariable.dirFzLauncherServer)
  }

  componentDidMount() {
    let instance = this
    EAU.init({
      api: 'https://download.frazionz.net/serverNodeJS/?branch=' + branch,
      server: false,
      debug: false,
      body: {
        name: packageJson.name,
        current: packageJson.version
      },
      formatRes: function (res) {
        return res
      }
    })

    EAU.check(function (error) {
      if (error) {
        if (error === 'no_update_available') {
          setTimeout(() => {
            instance.finishDownload()
          }, 1500)
          return false
        }
        if (error === 'version_not_specified' && process.env.NODE_ENV === 'development') {
          setTimeout(() => {
            instance.finishDownload()
          }, 1500)
          return false
        }
        setTimeout(() => {
          instance.finishDownload()
        }, 1500)
        return false
      }

      EAU.progress(function (state) {
        var percent = Math.round(state.percent * 100)
        document.getElementById('downloadhtml').innerHTML = fzVariable.lang('updater.in_progress')
        document.getElementById('downloadpercent').innerHTML = percent + '%'
        document.getElementById('downloadbar').style.width = percent + '%'
      })

      EAU.download(function () {
        document.getElementById('downloadpercent').innerHTML = 100 + '%'
        document.getElementById('downloadbar').style.width = 100 + '%'
        app.exit()
        process.exit()
      })
    })
  }

  finishDownload() {
    const defaultDirAppWindows = process.env['APPDATA'] + '\\.FrazionzLauncher'
    fzVariable.fs.cop
    if (!fzVariable.store.has('launcher__dirapp_path')){
      if(!fzVariable.fs.existsSync(defaultDirAppWindows)){
        this.router.showPage('/dirapp')
      }else{
        fzVariable.store.set('launcher__dirapp_path', defaultDirAppWindows)
      }
    }
    
    if (!fzVariable.fs.existsSync(fzVariable.path.join(fzVariable.dirFzLauncherDatas, 'runtime'))) {
      fzVariable.fs.mkdirSync(fzVariable.path.join(fzVariable.dirFzLauncherDatas  , 'runtime'))
      this.router.showPage('/runtime')
    } else
      this.router.showPage('/login')
  }

  render() {
    return (
      <div className="updater flex align-center justify-center h-[inherit]">
        <div className="flex items-center justify-center gap-30">
          <div className="loader-3"></div>
          <div className="flex flex-col gap-1 w-75">
            <div className="flex gap-10 align-end">
              <h6 id="downloadhtml">{fzVariable.lang('updater.research')}</h6>
              <h5 id="downloadpercent"></h5>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                id="downloadbar"
                style={{ width: '0%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Updater
