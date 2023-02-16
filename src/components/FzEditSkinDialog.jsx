import React from "react";
import axios from "axios";
import { Radio, Label } from "flowbite-react";
import { RadioGroup } from "@headlessui/react";
import { FaSave, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import FzVariable from "./FzVariable";
import ReactSkinview3d from "react-skinview3d";
import CheckIcon from "../components/CheckIcon";
import Apparence from "../views/connected/profile/Apparence";

export default class FzEditSkinDialog extends React.Component {
  state = {
    skinCurrent: null,
    fetchCapes: false,
    loadedCapes: false,
    capeURL: null,
    typeSkin: "steve",
    capeSelected: null,
    downloadedCape: []
  };

  constructor(props) {
    super(props);
    this.fcp = props.fcp;
    this.fzVariable = new FzVariable();
    this.closeDialog = this.closeDialog.bind(this);
    this.setTypeSkin = this.setTypeSkin.bind(this);
    this.selectCape = this.selectCape.bind(this);
    this.skinsList = JSON.parse(sessionStorage.getItem("skinsList"));
    this.session = JSON.parse(sessionStorage.getItem("user"));
    this.typeSkins = [
      {
        display: "Steve",
        key: "steve",
        description: "Type pour les skins de tailles normal",
      },
      {
        display: "Alex",
        key: "alex",
        description: "Type pour les skins plus fin",
      },
    ];
  }

  async getLibraryCapes() {
    let libraryURL = "https://api.frazionz.net/capes/library";
    return new Promise(async (resolve, reject) => {
      let responseLibrary = await axios.get(libraryURL);
      this.libraryCape = responseLibrary.data
      let capeIDActiveFirst = (this.state.skinCurrent.cape !== undefined)
      if(capeIDActiveFirst){
        let indexCapeCurrent = this.libraryCape.findIndex(cape => cape.id == this.state.skinCurrent.cape)
        this.libraryCape.unshift(this.libraryCape.splice(indexCapeCurrent, 1)[0]);
        this.setState({ capeSelected: 0 })
      }
      let cacheJSON = [];
      this.downloadCape = []
      this.downloadedCape = []
      for await (const cape of this.libraryCape) {
        cacheJSON.push({ id: cape.id, sha1: cape.sha1 });
        let cacheCape = this.fzVariable.path.join(
          this.fzVariable.dirFzLauncherCapes,
          cape.id + ".png"
        );
        let existFile = await this.fzVariable.checkFileExists(cacheCape)
        if (!existFile) {
          this.downloadCape.push({ cape: cape })
        }
      }

      this.setState({ fetchCapes: true })

      for await (const capedl of this.downloadCape) {
        console.log('Download picture ', capedl.cape.id)
        await this.fzVariable
        .downloadImage(
          "https://api.frazionz.net/capes/display/2d/" + capedl.cape.id,
          this.fzVariable.path.join(
            this.fzVariable.dirFzLauncherCapes,
            capedl.cape.id + ".png"
          )
        )
        .then((filepath) => {
          this.state.downloadedCape.push({ cape: capedl.cape })
          this.setState({ downloadedCape: this.state.downloadedCape })
        })
        .catch((err) => {
          console.log(err);
        });
      }

      this.fzVariable.fs.writeFileSync(
        this.fzVariable.shelfFzLauncherCapes,
        JSON.stringify(cacheJSON)
      );
      resolve();
    });
  }

  getURLCape(id){
    return (id > -1) ? `https://api.frazionz.net/capes/display/brut/${id}` : ''
  }

  async selectCape(i){
    let cape = this.libraryCape[i]
    this.setState({ capeURL: this.getURLCape(cape.id) })
    this.setState({ capeSelected: i })  
  }

  async componentDidMount() {
    this.setState({
      skinCurrent: this.skinsList[sessionStorage.getItem("selectedSkin")],
    });
    this.setState({
      typeSkin: this.skinsList[sessionStorage.getItem("selectedSkin")].model,
    });
    this.getLibraryCapes().then(() => {
      this.setState({
        capeURL: this.getURLCape((this.state.skinCurrent.cape !== undefined) ? this.state.skinCurrent.cape : -1),
      });
      this.setState({ loadedCapes: true });
    });
  }

  async setTypeSkin(skinType) {
    this.setState({ typeSkin: skinType })
  }

  async closeDialog() {
    sessionStorage.removeItem("selectedSkin");
    sessionStorage.removeItem("skinsList");
    this.props.sideRouter.showPage("/profile", true);
    this.props.parentRouter.unmountPage("/profile_appareance_editskin");
  }

  render() {
    if (this.state.skinCurrent !== null) {
      return (
        <>
          <div className="editSkinDialog flex flex-col gap-[1.5rem]">
            <div className="column w-full">
              <div className="head">
                <h2 className="underline">Édition du skin</h2>
                <span onClick={this.closeDialog}>
                  <FaTimes />
                </span>
              </div>
              <div className="flex flex-col gap-[40px] justify-between actions">
                <div className="flex items-center gap-30">
                  <div className="inputs">
                    <label>Nom du skin</label>
                    <input
                      type="text"
                      id="nameSkinInput"
                      className="w-full"
                      name="nameSkinInput"
                      defaultValue={this.state.skinCurrent.name}
                      placeholder="Nom du skin"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label>Choisir le type du skin</label>
                    <div className="flex align-center items-center gap-2">
                      <RadioGroup
                        value={this.state.typeSkin}
                        onChange={this.setTypeSkin}
                      >
                        <RadioGroup.Label className="sr-only">
                          Server size
                        </RadioGroup.Label>
                        <div className="flex gap-4 items-center">
                          {this.typeSkins.map((elem, i) => (
                            <RadioGroup.Option
                              key={elem.key}
                              value={elem.key}
                              className={({ active, checked }) =>
                                ` ${
                                  checked
                                    ? "branch selected bg-opacity-75 text-white"
                                    : "branch bg-[var(--fzbg-3)]"
                                }
                                                            relative flex cursor-pointer rounded-lg px-5 py-4`
                              }
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
                                            {elem.display}
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
                                );
                              }}
                            </RadioGroup.Option>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
                <div className="actions done">
                  <button
                    className="btn icon save"
                    onClick={() => {
                      let name = document.querySelector("#nameSkinInput").value;
                      let model = this.state.typeSkin;
                      let capeIDSelect = (this.state.capeSelected !== null) ? this.libraryCape[this.state.capeSelected].id : -1;
                      this.fcp
                        .saveSkin({
                          id: this.state.skinCurrent.id,
                          name: name,
                          model: model,
                          capeIDSelect: capeIDSelect,
                          apply: false
                        })
                        .then(() => {
                          this.closeDialog();
                        });
                    }}
                  >
                    <FaSave /> <span>Sauvegarder</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-10">
              <div className="flex justify-center">
                <ReactSkinview3d
                  id="skin"
                  skinUrl={`data:image/png;base64,${this.state.skinCurrent.base64}`}
                  capeUrl={this.state.capeURL}
                  height="345"
                  width="318"
                  onReady={(ready) => {
                    ready.viewer.playerObject.rotation.y = -3.5;
                    ready.viewer.controls.enableRotate = true;
                    ready.viewer.controls.enableZoom = false;
                    ready.viewer.controls.enablePan = false;
                  }}
                />
              </div>
              <div className="apparence w-full">
                <h2 className="underline mb-3">Bibliothèque des capes</h2>
                  {this.state.loadedCapes && (
                    <>
                      <div className="library">
                        {this.libraryCape.map((cape, i) => {
                          let capePreviewPath = this.fzVariable.path.join(
                            this.fzVariable.dirFzLauncherCapes,
                            cape.id + ".png"
                          );
                          return (
                            <div key={i} onClick={ () => { this.selectCape(i) } } className={`card skin ${((i == this.state.capeSelected) ? "active" : "")}`}>
                              <div className="card-body">
                                <img src={capePreviewPath} alt="" />
                                <div className="datas">
                                  <span className="name">{cape.display}</span>
                                  <span className="model">
                                    {cape.category.display}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {!this.state.loadedCapes && this.state.fetchCapes && (
                    <>
                      <div className="flex justify-center items-center gap-10" style={{ padding: "7rem 0rem" }}>
                        <div role="status">
                          <svg aria-hidden="true" className="inline w-10 h-10 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                          </svg>
                          <span className="sr-only">Loading...</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-2xl">Chargement des données</span>
                          <span className="text-xs">{ this.state.downloadedCape.length }/{this.downloadCape.length} capes</span>
                        </div>
                      </div>
                    </>
                  )}
              </div>
            </div>
          </div>
        </>
      );
    } else {
      <></>;
    }
  }
}
