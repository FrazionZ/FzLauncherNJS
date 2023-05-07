import React from 'react'
import FzPackage from '../../../package.json'
import { Switch } from '@headlessui/react'
import { shell } from 'electron'
const Store = require('electron-store')
const store = new Store()


import FzVariable from '../../components/FzVariable'
import FzLangListBox from '../../components/FzLangListbox'
import FzFooter from '../../components/FzFooter'

class Settings extends React.Component {

  fzVariable = new FzVariable(this.props)

  state = {
    branch: null,
    ram: 0,
    disabledActionGame: false,
    config_checkbox: [
      {
        key: "launcher__sentry",
        value: this.fzVariable.store.get("launcher__sentry", true),
        view: {
          title: this.fzVariable.lang('settings.sentry.title'),
          subtitle: this.fzVariable.lang('settings.sentry.subtitle')
        }
      },
      {
        key: "launcher__drpc",
        value: this.fzVariable.store.get("launcher__drpc", true),
        view: {
          title: "Discord RPC",
          subtitle: "Afficher le statut du Launcher sur votre compte Discord"
        }
      },
    ]
  }
  
  langCurrent = null
  lglist = window.lang.langs

  constructor(props) {
    super(props)
    this.appRouter = this.props.appRouter;
    this.sideRouter = this.props.sideRouter;
    this.setCheckbox = this.setCheckbox.bind(this)
  }

  async componentDidMount() {
    this.setState({ langCurrent: await window.lang.getLangCurrent() })
    document.querySelectorAll('.config__launcher_checkbox').forEach((element) => {
      if (store.has(element.getAttribute('data-id'))) {
        element.checked = store.get(element.getAttribute('data-id')) ? true : false
      } else {
        var defaultValue = JSON.parse(element.getAttribute('data-default').toLowerCase())
        store.set(element.getAttribute('data-id'), defaultValue)
        element.checked = store.get(element.getAttribute('data-id')) ? true : false
      }
    })
  }


  openExternal(hyperlink) {
    console.log(hyperlink)
    //shell.openExternal(hyperlink.getAttribute('data-link'))
  }

  
  async setCheckbox(event){
    event.preventDefault()
    let dataID = event.currentTarget.getAttribute('data-id')
    let indexCheckBox = this.state.config_checkbox.findIndex(elem => elem.key == dataID)
    let checkBox = this.state.config_checkbox.find(elem => elem.key == dataID)
    let oldValue = checkBox.value
    let newValue = (oldValue === true) ? false : true
    this.state.config_checkbox[indexCheckBox].value = newValue
    this.setState({ config_checkbox: this.state.config_checkbox })
    this.fzVariable.store.set(dataID, newValue)
  }

  render() {
    return (
      <div className="config pl-60 pr-60 pb-30">
        <h2 className="pt-30 pb-10 underline">{this.fzVariable.lang('settings.title')}</h2>
        <div className="flex flex-col gap-20">
          <div className="card">
            <div className="card-body flex gap-20 justif-between direct-column">
              <div className="config-item">
                <div className="column flex direct-column justif-center">
                  <h2 className="label__config reset-mp">{this.fzVariable.lang('settings.lang.title')}</h2>
                  <h2 className="expl__config reset-mp">{this.fzVariable.lang('settings.lang.subtitle')}</h2>
                </div>
                <div className="flex align-center gap-20">
                  {this.state.langCurrent !== null &&
                    <>
                      <FzLangListBox appRouter={ this.appRouter } sideRouter={ this.sideRouter } currentLang={this.state.langCurrent} lglist={this.lglist} />
                    </>
                  }
                </div>
              </div>
            </div>
          </div>
          {this.state.config_checkbox.map((checkbox, i) =>
              <div key={i} data-id={checkbox.key} className="card checkbox_config" onClick={ this.setCheckbox }>
                <div className="card-body flex gap-20 justif-between direct-column">
                  <div className="config-item">
                    <div className="column flex direct-column justif-center">
                      <h2 className="label__config reset-mp">{ checkbox.view.title }</h2>
                      <h2 className="expl__config reset-mp">{ checkbox.view.subtitle }</h2>
                    </div>
                    <div className="flex align-center gap-20">
                      <Switch
                          checked={checkbox.value}
                          className={`${checkbox.value ? '' : 'bg-[var(--fzbg-3)]'
                              } relative inline-flex h-6 w-11 items-center rounded-full`}
                          >
                          <span
                            className={`${checkbox.value ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                            />
                      </Switch>
                    </div>
                  </div>
                </div>
              </div>
          )}
          <div className="card">
            <div className="card-body flex gap-20 justif-between direct-column">
              <div className="config-item">
                <div className="column flex direct-column justif-center">
                  <h2 className="label__config reset-mp">Version actuelle</h2>
                  <h2 className="expl__config reset-mp">{FzPackage.version}</h2>
                </div>
                <div className="flex align-center gap-20">
                  <a className="btn config__launcher_pnotes" onClick={() => {shell.openExternal('https://frazionz.net/launcher')}}>{this.fzVariable.lang('settings.pnotes.action')}</a>
                </div>
              </div>
              <div className="config-item">
                <div className="column flex direct-column justif-center">
                  <h2 className="label__config reset-mp">Licences des librairies</h2>
                  <h2 className="expl__config reset-mp">Liste comprenant les dépendances utilisées par FzLauncher</h2>
                </div>
                <div className="flex align-center gap-20">
                  <a className="btn config__launcher_pnotes" onClick={() => { this.sideRouter.showPage('/license') }}>{this.fzVariable.lang('settings.licenses.action')}</a>
                </div>
              </div>
              <div className="config-item">
                <div className="column flex direct-column justif-center">
                  <h2 className="label__config reset-mp">Node</h2>
                  <h2 className="expl__config reset-mp">{process.versions.node}</h2>
                </div>
              </div>
              <div className="config-item">
                <div className="column flex direct-column justif-center">
                  <h2 className="label__config reset-mp">Chrome</h2>
                  <h2 className="expl__config reset-mp">{process.versions.chrome}</h2>
                </div>
              </div>
              <div className="config-item">
                <div className="column flex direct-column justif-center">
                  <h2 className="label__config reset-mp">Electron</h2>
                  <h2 className="expl__config reset-mp">{process.versions.electron}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FzFooter sideRouter={this.sideRouter} />
      </div>
    )
  }
}

export default Settings
