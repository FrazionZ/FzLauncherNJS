import React from 'react'
import { FiMaximize } from 'react-icons/fi'
import { FaWindowMinimize, FaTimes } from 'react-icons/fa'
import logo from '../assets/img/dark/icons/top_fz.svg'
import FzToast from './FzToast'

class Header extends React.Component {
  toggleReduceApp() {
    window.ipcRenderer.send('reduceApp')
  }

  toggleMaximizeApp() {
    window.ipcRenderer.send('maximizeApp')
  }

  closeApp() {
    if(sessionStorage.getItem('gameLaunched') == "true"){
      window.ipcRenderer.send('reduceApp')
      window.ipcRenderer.send('hideApp')
      window.ipcRenderer.send('notification', { title: "FrazionZ", body: "Une instance est ouverte, le launcher s'est donc minimisé dans la barre d'outils." })
    }else
      window.ipcRenderer.send('closeApp')
  }

  render() {
    return (
      <div className="flex justify-between header">
        <div className="icon">
          <img src={logo} alt="Logo" />
          <h4>
            Launcher <span className="beta font-thin">Preview</span>
          </h4>
        </div>
        <div className="actions">
          <div className="grid grid-cols-3 grid-flow-col">
            <div
              onClick={this.toggleReduceApp}
              className="window_reduce flex items-center text-lg justify-center text-white"
            >
              <FaWindowMinimize />
            </div>
            <div
              onClick={this.toggleMaximizeApp}
              className="window_maximize flex items-center text-lg justify-center text-white"
            >
              <FiMaximize />
            </div>
            <div
              onClick={this.closeApp}
              className="window_close flex items-center text-lg justify-center text-white"
            >
              <FaTimes />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Header
