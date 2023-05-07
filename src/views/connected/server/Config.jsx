import React from 'react'
import FzVariable from '../../../components/FzVariable';
import FzToast from '../../../components/FzToast';
import CheckIcon from '../../../components/CheckIcon';
import { Switch } from '@headlessui/react'
import { RadioGroup } from '@headlessui/react'
import { Range } from 'konsta/react';
import Brush from '../../../assets/img/icons/brush_white.svg'
import { FaDiscord, FaWindowMaximize, FaJava, FaExpand } from 'react-icons/fa';

const { shell } = require('electron')

class Config extends React.Component {

  branches = []

  fzVariable = new FzVariable(this.props)

  state = {
    branch: null,
    ram: 0,
    disabledActionGame: false,
    config_checkbox: [
      {
        key: "config__server_discord_rpc",
        value: this.fzVariable.store.get(this.fzVariable.keyStoreServerOptions("config__server_discord_rpc"), true),
        view: {
          title: this.fzVariable.lang("server.config.drpc.title"),
          subtitle: this.fzVariable.lang("server.config.drpc.subtitle")
        }
      },
      {
        key: "config__server_runtime_launch",
        value: this.fzVariable.store.get(this.fzVariable.keyStoreServerOptions("config__server_runtime_launch"), true),
        view: {
          title: this.fzVariable.lang("server.config.runtime.title"),
          subtitle: this.fzVariable.lang("server.config.runtime.subtitle")
        }
      },
      {
        key: "config__server_clean_auto_cache",
        value: this.fzVariable.store.get(this.fzVariable.keyStoreServerOptions("config__server_clean_auto_cache"), false),
        view: {
          title: this.fzVariable.lang("server.config.auto_cache.title"),
          subtitle: this.fzVariable.lang("server.config.auto_cache.subtitle")
        }
      },
      {
        key: "config__server_display_fullscreen",
        value: this.fzVariable.store.get(this.fzVariable.keyStoreServerOptions("config__server_display_fullscreen"), false),
        view: {
          title: this.fzVariable.lang("server.config.fullscreen.title"),
          subtitle: this.fzVariable.lang("server.config.fullscreen.subtitle")
        }
      }
    ]
  }

  constructor(props) {
    super(props)
    this.fzVariable = new FzVariable(props)
    this.ServerObj = props.serverObj;
    this.sideRouter = props.sideRouter;
    this.serverRouter = props.serverRouter;
    this.branches = this.ServerObj.github;
    this.setBranch = this.setBranch.bind(this)
    this.setCheckbox = this.setCheckbox.bind(this)
    this.clearSkinCapeDir = this.clearSkinCapeDir.bind(this)
    this.repareServer = this.repareServer.bind(this)
    this.clearDirServer = this.clearDirServer.bind(this)
    this.ramAllocateIndexProperties = this.fzVariable.store.has(this.fzVariable.keyStoreServerOptions("ramIndex")) ? this.fzVariable.store.get(this.fzVariable.keyStoreServerOptions("ramIndex")) : undefined;
    if (this.ramAllocateIndexProperties == undefined)
      this.ramAllocateIndexProperties = 0;

    this.gb = this.fzVariable.listRamAllocate().list[this.ramAllocateIndexProperties].gb;


    this.windowClientSize = { width: 1280, height: 720 }
    if (this.fzVariable.store.has(this.fzVariable.keyStoreServerOptions("config__server_display_size"))) {
      let size = this.fzVariable.store.get(this.fzVariable.keyStoreServerOptions("config__server_display_size")).split(":");
      this.windowClientSize = { width: size[0], height: size[1] }
    }

    document.addEventListener('server_config_disabledActionGame', (event) => {
      let serverObjEvent = event.detail.serverObj;
      if (serverObjEvent.id == this.ServerObj.id) {
        this.setState({ disabledActionGame: event.detail.disabled })
      }
    })
  }


  componentDidMount() {
    let instance = this;
    this.setState({ branch: this.branches.find(element => element.branch == this.fzVariable.store.get(this.fzVariable.keyStoreServerOptions('branch'))).branch, ram: this.ramAllocateIndexProperties })
    this.ramAllocateInput = document.querySelector('#ramAllocateInput input[type="range"]');
    this.range_ram_indicator = document.querySelector('.range_ram_indicator');

    var percent = (this.gb / 16) * 100 - 5;
    this.ramAllocateInput.style.background = "linear-gradient(to right, var(--color-1) 0%, var(--color-1) " + percent + "%, var(--fzbg-1) " + percent + "%, var(--fzbg-1) 100%)"

    if (this.fzVariable.store.has(this.fzVariable.keyStoreServerOptions("config__server_display_size"))) {
      let size = this.fzVariable.store.get(this.fzVariable.keyStoreServerOptions("config__server_display_size")).split(":");
      this.setState({ windowClientSize: { width: size[0], height: size[1] } })
    }
  }


  setRangeSliderRam(value, max) {
    var percent = (value / max) * 100 - 5;
    this.range_ram_allocate.setAttribute("value", value);
    this.range_ram_indicator.innerHTML = `${value} Go`;

  }

  setRamAllocate(e) {
    //SAVE RAM
    this.gb = this.fzVariable.listRamAllocate().list[e.target.value].gb;
    this.range_ram_indicator.innerHTML = `${this.gb} Go`;
    var percent = (this.gb / 16) * 100 - 5;
    e.target.style.background = "linear-gradient(to right, var(--color-1) 0%, var(--color-1) " + percent + "%, var(--fzbg-1) " + percent + "%, var(--fzbg-1) 100%)"
    this.fzVariable.store.set(
      this.fzVariable.keyStoreServerOptions("ramIndex"),
      parseInt(e.target.value)
    );
  }

  setBranch(inst) {
    this.fzVariable.store.set(this.fzVariable.keyStoreServerOptions('branch'), inst)
    this.setState({ branch: inst })
    sessionStorage.setItem('routerForce', '/config')
    this.sideRouter.reloadRenderPage('/server')
  }

  setWindowClientSize() {
    var widthDisplay = document.querySelector('#config__display_width')
    var heightDisplay = document.querySelector('#config__display_height')
    if (parseInt(widthDisplay.value) < parseInt(widthDisplay.getAttribute("min")) || parseInt(heightDisplay.value) < parseInt(heightDisplay.getAttribute("min")))
      return FzToast.error("La taille de la fenêtre doit être au minimum à 800x600");
    this.fzVariable.store.set(fzVariable.keyStoreServerOptions("config__server_display_size"), `${widthDisplay.value}:${heightDisplay.value}`);
    FzToast.success("La taille de la fenêtre a bien été changée !");
  }

  async repareServer() {
    this.setState({ disabledActionGame: true })
    this.props.functionParse.repareServer();
  }

  async clearDirServer(event) {
    let excludesFiles = [
      "resourcepacks",
      "saves",
      "screenshots",
      "shaderpacks",
      "options.txt",
      "optionsof.txt",
      "mods.txt",
      "mods"
    ];
    let instance = this
    this.fzVariable.fs.readdir(this.ServerObj.dirServer, function (err, files) {
      //handling error
      if (err) resolveGlobal(false);
      var rmOrUnlinkLoop = new Promise((resolve, reject) => {
        files.forEach(function (fileOrDir, index, array) {
          if (!excludesFiles.includes(fileOrDir)) {
            var statFile = instance.fzVariable.fs.lstatSync(
              instance.fzVariable.path.join(instance.ServerObj.dirServer, fileOrDir)
            );
            if (statFile.isDirectory()) {
              instance.fzVariable.fs.rm(
                instance.fzVariable.path.join(instance.ServerObj.dirServer, fileOrDir), {
                recursive: true,
                force: true
              },
                (err) => {
                  if (index === array.length - 1) resolve();
                }
              );
            } else if (statFile.isFile()) {
              instance.fzVariable.fs.unlink(
                instance.fzVariable.path.join(instance.ServerObj.dirServer, fileOrDir),
                (err) => {
                  if (index === array.length - 1) resolve();
                }
              );
            }
          } else if (index === array.length - 1) resolve();
        });
      });
      rmOrUnlinkLoop.then(() => {
        instance.setState({ disabledActionGame: true })
        instance.props.functionParse.reinitServer().then(() => {
          FzToast.success("Le dossier a bien été supprimé !");
        })
      });
    });
  }

  async clearSkinCapeDir(event) {
    event.disabled = true;
    let errorsList = [];
    let dirs = [
      this.fzVariable.path.join(this.ServerObj.dirServer, "assets/frazionz/cache")
    ]
    for await (const dir of dirs) {
      this.fzVariable.fs.rmSync(dir, {
        recursive: true,
        force: true
      },
        (err) => {
          errorsList.push(err)
        }
      );
    }

    event.disabled = false;

    if (errorsList.length > 0) return FzToast.error(err);
    else
      FzToast.success("Le dossier a bien été supprimé !");
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
    this.fzVariable.store.set(this.fzVariable.keyStoreServerOptions(dataID), newValue)
  }

  render() {
    return (
      <div className="config flex gap-15 direct-column">
        <h2 className="underline">{this.fzVariable.lang("server.config.title")}</h2>
        <div className="flex flex-col gap-[24px]">
          <div className="column flex flex-col gap-[12px]">
            <div className="card">
              <div className="card-body flex gap-30 direct-column">
                <div className="column flex gap-15 direct-column">
                  <h2 className="label__config">{this.fzVariable.lang("server.config.ram.title")}</h2>
                  <h2 className="expl__config">{this.fzVariable.lang("server.config.ram.subtitle")}</h2>
                </div>
                <div className="flex align-center gap-2 justif-center">
                  <span className="range_ram_indicator">{this.gb} Go</span>
                  <Range
                    value={this.state.ram}
                    step={1}
                    min={0}
                    max={15}
                    id="ramAllocateInput"
                    onMouseUp={(e) => {
                      FzToast.success(fzVariable.lang("server.config.ram.saved"))
                    }}
                    onChange={(e) => {
                      this.setRamAllocate(e)
                      this.setState({ ram: e.target.value })
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body flex gap-30 direct-column">
                <div className="column flex gap-15 direct-column">
                  <h2 className="label__config">{this.fzVariable.lang("server.config.branch.title")}</h2>
                  <h2 className="expl__config">
                    {
                      this.fzVariable.lang("server.config.branch.subtitle", [
                        {key: '%server_name%', value: this.props.serverObj.name}
                      ])
                    }
                  </h2>
                </div>
                <div className="flex align-center gap-20">
                  <RadioGroup value={this.state.branch} onChange={this.setBranch}>
                    <RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
                    <div className="flex gap-4 items-center">
                      {this.branches.map((elem, i) => (
                        <RadioGroup.Option
                          key={elem.branch}
                          value={elem.branch}
                          disabled={this.state.disabledActionGame}
                          className={({ active, checked }) =>
                            ` ${checked ? 'branch selected bg-opacity-75 text-white' : 'branch bg-[var(--fzbg-3)]'}
                              relative flex cursor-pointer rounded-lg px-5 py-4` }
                        >
                          {({ active, checked }) => {
                            return (
                              <>
                                <div className="flex w-full gap-4 items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="text-sm">
                                      <RadioGroup.Label
                                        as="p"
                                        className={`font-medium  `}
                                      >
                                        {elem.title}
                                      </RadioGroup.Label>
                                      <RadioGroup.Description
                                        as="span"
                                        className={`inline`}
                                      >
                                        <span> {elem.description} </span>
                                      </RadioGroup.Description>
                                    </div>
                                  </div>
                                  {checked && (
                                    <div className="shrink-0">
                                      <CheckIcon className="h-6 w-6" />
                                    </div>
                                  )}
                                </div>
                              </>
                            )
                          }}
                        </RadioGroup.Option>
                      ))}
                    </div>
                  </RadioGroup>
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
              <div className="card-body flex gap-15 justif-between direct-column">
                <div className="config-item">
                  <div className="flex align-center gap-30">
                    <div className="icon">
                      <FaWindowMaximize />
                    </div>
                    <div className="column flex direct-column justif-center">
                      <h2 className="label__config reset-mp">{this.fzVariable.lang("server.config.display.title")}</h2>
                      <h2 className="expl__config reset-mp">{this.fzVariable.lang("server.config.display.subtitle")}</h2>
                    </div>
                  </div>
                  <div className="flex align-center gap-20">
                    <div className="flex align-center gap-15">
                      <input type="number" id="config__display_width" style={{ width: "10rem", height: "3.5rem" }} min="800" defaultValue={this.windowClientSize.width} />
                      <input type="number" id="config__display_height" style={{ width: "10rem", height: "3.5rem" }} min="600" defaultValue={this.windowClientSize.height} />
                      <button className="config__server_display_size" onClick={this.setWindowClientSize}>{this.fzVariable.lang("general.done")}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="column flex flex-col gap-[12px]">
            <div className="card">
              <div className="card-body flex gap-15 justif-between direct-column">
                <div className="config-item">
                  <div className="column flex direct-column justif-center">
                    <h2 className="label__config reset-mp">{this.fzVariable.lang("server.config.viewdir.title")}</h2>
                    <h2 className="expl__config reset-mp">{this.fzVariable.lang("server.config.viewdir.subtitle")}</h2>
                  </div>
                  <div className="flex align-center gap-20">
                    <button className='btn' onClick={() => { shell.openPath(this.ServerObj.dirServer); }}>{this.fzVariable.lang("server.config.viewdir.action")}</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body flex gap-15 justif-between direct-column">
                <div className="config-item">
                  <div className="column flex direct-column justif-center">
                    <h2 className="label__config reset-mp">{this.fzVariable.lang("server.config.cleandir.title")}</h2>
                    <h2 className="expl__config reset-mp">{this.fzVariable.lang("server.config.cleandir.subtitle")}</h2>
                  </div>
                  <div className="flex align-center gap-20">
                    <button className='btn' onClick={this.clearDirServer} disabled={this.state.disabledActionGame}>{this.fzVariable.lang("server.config.cleandir.action")}</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body flex gap-15 justif-between direct-column">
                <div className="config-item">
                  <div className="column flex direct-column justif-center">
                    <h2 className="label__config reset-mp">{this.fzVariable.lang("server.config.repare.title")}</h2>
                    <h2 className="expl__config reset-mp">{this.fzVariable.lang("server.config.repare.subtitle")}</h2>
                  </div>
                  <div className="flex align-center gap-20">
                    <button className='btn' onClick={this.repareServer} disabled={this.state.disabledActionGame}>{this.fzVariable.lang("server.config.repare.action")}</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body flex gap-15 justif-between direct-column">
                <div className="config-item">
                  <div className="column flex direct-column justif-center">
                    <h2 className="label__config reset-mp">{this.fzVariable.lang("server.config.cleansc.title")}</h2>
                    <h2 className="expl__config reset-mp">{this.fzVariable.lang("server.config.cleansc.subtitle")}</h2>
                  </div>
                  <div className="flex align-center gap-20">
                    <button className='btn' disabled={this.state.disabledActionGame} onClick={this.clearSkinCapeDir}>{this.fzVariable.lang("server.config.cleansc.action")}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Config;
