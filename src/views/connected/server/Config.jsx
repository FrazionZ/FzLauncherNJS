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

let fzVariable

class Config extends React.Component {

  branches = []

  state = {
    branch: null,
    ram: 0,
    disabledActionGame: false,
    config_checkbox: [
      {
        key: "config__server_discord_rpc",
        value: true
      },
      {
        key: "config__server_close_app",
        value: false
      },
      {
        key: "config__server_runtime_launch",
        value: true
      },
      {
        key: "config__server_clean_autosc",
        value: true
      },
      {
        key: "config__server_display_fullscreen",
        value: false
      }
    ]
  }

  constructor(props) {
    super(props)
    fzVariable = new FzVariable(props)
    this.ServerObj = props.serverObj;
    this.sideRouter = props.sideRouter;
    this.serverRouter = props.serverRouter;
    this.branches = this.ServerObj.github;
    this.setBranch = this.setBranch.bind(this)
    this.setCheckBoxSettings = this.setCheckBoxSettings.bind(this)
    this.clearSkinCapeDir = this.clearSkinCapeDir.bind(this)
    this.repareServer = this.repareServer.bind(this)
    this.clearDirServer = this.clearDirServer.bind(this)
    this.ramAllocateIndexProperties = fzVariable.store.has(fzVariable.keyStoreServerOptions("ramIndex")) ? fzVariable.store.get(fzVariable.keyStoreServerOptions("ramIndex")) : undefined;
    if (this.ramAllocateIndexProperties == undefined)
      this.ramAllocateIndexProperties = 0;

    this.gb = fzVariable.listRamAllocate().list[this.ramAllocateIndexProperties].gb;


    this.windowClientSize = { width: 1280, height: 720 }
    if (fzVariable.store.has(fzVariable.keyStoreServerOptions("config__server_display_size"))) {
      let size = fzVariable.store.get(fzVariable.keyStoreServerOptions("config__server_display_size")).split(":");
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
    this.setState({ branch: this.branches.find(element => element.branch == fzVariable.store.get(fzVariable.keyStoreServerOptions('branch'))).branch, ram: this.ramAllocateIndexProperties })
    this.ramAllocateInput = document.querySelector('#ramAllocateInput input[type="range"]');
    this.range_ram_indicator = document.querySelector('.range_ram_indicator');

    var percent = (this.gb / 16) * 100 - 5;
    this.ramAllocateInput.style.background = "linear-gradient(to right, var(--color-1) 0%, var(--color-1) " + percent + "%, var(--fzbg-1) " + percent + "%, var(--fzbg-1) 100%)"

    if (fzVariable.store.has(fzVariable.keyStoreServerOptions("config__server_display_size"))) {
      let size = fzVariable.store.get(fzVariable.keyStoreServerOptions("config__server_display_size")).split(":");
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
    this.gb = fzVariable.listRamAllocate().list[e.target.value].gb;
    this.range_ram_indicator.innerHTML = `${this.gb} Go`;
    var percent = (this.gb / 16) * 100 - 5;
    e.target.style.background = "linear-gradient(to right, var(--color-1) 0%, var(--color-1) " + percent + "%, var(--fzbg-1) " + percent + "%, var(--fzbg-1) 100%)"
    fzVariable.store.set(
      fzVariable.keyStoreServerOptions("ramIndex"),
      parseInt(e.target.value)
    );
  }

  setBranch(inst) {
    fzVariable.store.set(fzVariable.keyStoreServerOptions('branch'), inst)
    this.setState({ branch: inst })
    sessionStorage.setItem('routerForce', '/config')
    this.sideRouter.reloadRenderPage('/server')
  }

  getCheckBoxSettingsValue(key) {
    return this.state.config_checkbox.find(elem => elem.key == key);
  }

  setCheckBoxSettingsValue(key) {
    return new Promise(async (resolve, reject) => {
      let checked = (elem) => elem.key == key
      let index = this.state.config_checkbox.findIndex(checked);
      let newValue = ((this.getCheckBoxSettingsValue(key).value) ? false : true);
      let indexFor = 0;
      for await (const elem of this.state.config_checkbox) {
        if (elem.key == key)
          this.state.config_checkbox[indexFor].value = newValue
        indexFor++;
      }
      this.setState({ config_checkbox: this.state.config_checkbox })
      resolve(newValue)
    })
  }

  setCheckBoxSettings(event) {
    event.preventDefault();
    if (event.currentTarget !== undefined) {
      let dataId = event.currentTarget.querySelector('button[role="switch"]').getAttribute('data-id');
      this.setCheckBoxSettingsValue(dataId).then((newValue) => {
        fzVariable.store.set(fzVariable.keyStoreServerOptions(dataId), newValue);
      })
    }
  }

  setWindowClientSize() {
    var widthDisplay = document.querySelector('#config__display_width')
    var heightDisplay = document.querySelector('#config__display_height')
    if (parseInt(widthDisplay.value) < parseInt(widthDisplay.getAttribute("min")) || parseInt(heightDisplay.value) < parseInt(heightDisplay.getAttribute("min")))
      return FzToast.error("La taille de la fenêtre doit être au minimum à 800x600");
    fzVariable.store.set(fzVariable.keyStoreServerOptions("config__server_display_size"), `${widthDisplay.value}:${heightDisplay.value}`);
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
      "shaderpacks",
      "options.txt",
      "optionsof.txt",
    ];
    let instance = this
    fzVariable.fs.readdir(this.ServerObj.dirServer, function (err, files) {
      //handling error
      if (err) resolveGlobal(false);
      var rmOrUnlinkLoop = new Promise((resolve, reject) => {
        files.forEach(function (fileOrDir, index, array) {
          var hasDelete = true;
          excludesFiles.forEach((excludesFile) => {
            if (excludesFile == fileOrDir) hasDelete = false;
          });
          if (hasDelete) {
            var statFile = fzVariable.fs.lstatSync(
              fzVariable.path.join(instance.ServerObj.dirServer, fileOrDir)
            );
            if (statFile.isDirectory()) {
              fzVariable.fs.rm(
                fzVariable.path.join(instance.ServerObj.dirServer, fileOrDir), {
                recursive: true,
                force: true
              },
                (err) => {
                  if (index === array.length - 1) resolve();
                }
              );
            } else if (statFile.isFile()) {
              fzVariable.fs.unlink(
                fzVariable.path.join(instance.ServerObj.dirServer, fileOrDir),
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
      fzVariable.path.join(this.ServerObj.dirServer, "assets/frazionz/skins"),
      fzVariable.path.join(this.ServerObj.dirServer, "assets/frazionz/capes")
    ]
    for await (const dir of dirs) {
      fzVariable.fs.rmSync(dir, {
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

  render() {
    return (
      <div className="config flex gap-15 direct-column">
        <h2 className="underline">{fzVariable.lang("server.config.title")}</h2>
        <div className="flex flex-col gap-[24px]">
          <div className="column flex flex-col gap-[12px]">
            <div className="card">
              <div className="card-body flex gap-30 direct-column">
                <div className="column flex gap-15 direct-column">
                  <h2 className="label__config">{fzVariable.lang("server.config.ram.title")}</h2>
                  <h2 className="expl__config">{fzVariable.lang("server.config.ram.subtitle")}</h2>
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
                  <h2 className="label__config">{fzVariable.lang("server.config.branch.title")}</h2>
                  <h2 className="expl__config">
                    {
                      fzVariable.lang("server.config.branch.subtitle", [
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
            <div className="card checkbox_config" onClick={this.setCheckBoxSettings}>
              <div className="card-body flex gap-15 justif-between direct-column">
                <div className="config-item">
                  <div className="flex align-center gap-30">
                    <div className="icon">
                      <FaDiscord />
                    </div>
                    <div className="column flex direct-column justif-center">
                      <h2 className="label__config reset-mp">{fzVariable.lang("server.config.drpc.title")}</h2>
                      <h2 className="expl__config reset-mp">{fzVariable.lang("server.config.drpc.subtitle")}</h2>
                    </div>
                  </div>
                  <div className="flex align-center gap-20">
                    <Switch
                      data-id="config__server_discord_rpc"
                      checked={this.getCheckBoxSettingsValue("config__server_discord_rpc").value}
                      className={`${this.getCheckBoxSettingsValue("config__server_discord_rpc").value ? '' : 'bg-[var(--fzbg-3)]'
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span
                        className={`${this.getCheckBoxSettingsValue("config__server_discord_rpc").value ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                      />
                    </Switch>
                  </div>
                </div>
              </div>
            </div>
            <div className="card checkbox_config" onClick={this.setCheckBoxSettings}>
              <div className="card-body flex gap-15 justif-between direct-column">
                <div className="config-item ">
                  <div className="flex align-center gap-30">
                    <div className="icon">
                      <FaJava />
                    </div>
                    <div className="column flex direct-column justif-center">
                      <h2 className="label__config reset-mp">{fzVariable.lang("server.config.runtime.title")}</h2>
                      <h2 className="expl__config reset-mp">{fzVariable.lang("server.config.runtime.subtitle")}</h2>
                    </div>
                  </div>
                  <div className="flex align-center gap-20">
                    <Switch
                      data-id="config__server_runtime_launch"
                      checked={this.getCheckBoxSettingsValue("config__server_runtime_launch").value}
                      className={`${this.getCheckBoxSettingsValue("config__server_runtime_launch").value ? '' : 'bg-[var(--fzbg-3)]'
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span
                        className={`${this.getCheckBoxSettingsValue("config__server_runtime_launch").value ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                      />
                    </Switch>
                  </div>
                </div>
              </div>
            </div>
            <div className="card checkbox_config" onClick={this.setCheckBoxSettings}>
              <div className="card-body flex gap-15 justif-between direct-column">
                <div className="config-item">
                  <div className="flex align-center gap-30">
                    <div className="icon">
                      <img src={Brush} style={{ width: '36px' }} />
                    </div>
                    <div className="column flex direct-column justif-center">
                      <h2 className="label__config reset-mp">{fzVariable.lang("server.config.autosc.title")}</h2>
                      <h2 className="expl__config reset-mp">{fzVariable.lang("server.config.autosc.subtitle")}</h2>
                    </div>
                  </div>
                  <div className="flex align-center gap-20">
                    <Switch
                      data-id="config__server_clean_autosc"
                      checked={this.getCheckBoxSettingsValue("config__server_clean_autosc").value}
                      className={`${this.getCheckBoxSettingsValue("config__server_clean_autosc").value ? '' : 'bg-[var(--fzbg-3)]'
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span
                        className={`${this.getCheckBoxSettingsValue("config__server_clean_autosc").value ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                      />
                    </Switch>
                  </div>
                </div>
              </div>
            </div>
            <div className="card checkbox_config" onClick={this.setCheckBoxSettings}>
              <div className="card-body flex gap-15 justif-between direct-column">
                <div className="config-item">
                  <div className="flex align-center gap-30">
                    <div className="icon">
                      <FaExpand />
                    </div>
                    <div className="column flex direct-column justif-center">
                      <h2 className="label__config reset-mp">{fzVariable.lang("server.config.fullscreen.title")}</h2>
                      <h4 className="expl__config reset-mp">{fzVariable.lang("server.config.fullscreen.subtitle")}</h4>
                    </div>
                  </div>
                  <div className="flex align-center gap-20">
                    <Switch
                      data-id="config__server_display_fullscreen"
                      checked={this.getCheckBoxSettingsValue("config__server_display_fullscreen").value}
                      className={`${this.getCheckBoxSettingsValue("config__server_display_fullscreen").value ? '' : 'bg-[var(--fzbg-3)]'
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span
                        className={`${this.getCheckBoxSettingsValue("config__server_display_fullscreen").value ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                      />
                    </Switch>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body flex gap-15 justif-between direct-column">
                <div className="config-item">
                  <div className="flex align-center gap-30">
                    <div className="icon">
                      <FaWindowMaximize />
                    </div>
                    <div className="column flex direct-column justif-center">
                      <h2 className="label__config reset-mp">{fzVariable.lang("server.config.display.title")}</h2>
                      <h2 className="expl__config reset-mp">{fzVariable.lang("server.config.display.subtitle")}</h2>
                    </div>
                  </div>
                  <div className="flex align-center gap-20">
                    <div className="flex align-center gap-15">
                      <input type="number" id="config__display_width" style={{ width: "10rem", height: "3.5rem" }} min="800" defaultValue={this.windowClientSize.width} />
                      <input type="number" id="config__display_height" style={{ width: "10rem", height: "3.5rem" }} min="600" defaultValue={this.windowClientSize.height} />
                      <button className="config__server_display_size" onClick={this.setWindowClientSize}>{fzVariable.lang("general.done")}</button>
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
                    <h2 className="label__config reset-mp">{fzVariable.lang("server.config.viewdir.title")}</h2>
                    <h2 className="expl__config reset-mp">{fzVariable.lang("server.config.viewdir.subtitle")}</h2>
                  </div>
                  <div className="flex align-center gap-20">
                    <button className='btn' onClick={() => { shell.openPath(this.ServerObj.dirServer); }}>{fzVariable.lang("server.config.viewdir.action")}</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body flex gap-15 justif-between direct-column">
                <div className="config-item">
                  <div className="column flex direct-column justif-center">
                    <h2 className="label__config reset-mp">{fzVariable.lang("server.config.cleandir.title")}</h2>
                    <h2 className="expl__config reset-mp">{fzVariable.lang("server.config.cleandir.subtitle")}</h2>
                  </div>
                  <div className="flex align-center gap-20">
                    <button className='btn' onClick={this.clearDirServer} disabled={this.state.disabledActionGame}>{fzVariable.lang("server.config.cleandir.action")}</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body flex gap-15 justif-between direct-column">
                <div className="config-item">
                  <div className="column flex direct-column justif-center">
                    <h2 className="label__config reset-mp">{fzVariable.lang("server.config.repare.title")}</h2>
                    <h2 className="expl__config reset-mp">{fzVariable.lang("server.config.repare.subtitle")}</h2>
                  </div>
                  <div className="flex align-center gap-20">
                    <button className='btn' onClick={this.repareServer} disabled={this.state.disabledActionGame}>{fzVariable.lang("server.config.repare.action")}</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body flex gap-15 justif-between direct-column">
                <div className="config-item">
                  <div className="column flex direct-column justif-center">
                    <h2 className="label__config reset-mp">{fzVariable.lang("server.config.cleansc.title")}</h2>
                    <h2 className="expl__config reset-mp">{fzVariable.lang("server.config.cleansc.subtitle")}</h2>
                  </div>
                  <div className="flex align-center gap-20">
                    <button className='btn' disabled={this.state.disabledActionGame} onClick={this.clearSkinCapeDir}>{fzVariable.lang("server.config.cleansc.action")}</button>
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
