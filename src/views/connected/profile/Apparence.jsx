import React, { Suspense, useState, useEffect } from "react";
import FzSkinViewer from "../../../components/FzSkinViewer";
import { Spinner } from "flowbite-react";
import FzVariable from "../../../components/FzVariable";
import FzToast from "../../../components/FzToast";
import { Tooltip } from "flowbite-react";
import axios from 'axios'
const imageToBase64 = require("image-to-base64");
import ReactSkinview3d from "react-skinview3d";
import FzImportationSkinDialog from "../../../components/FzImportationSkinDialog";
import FzEditSkinDialog from "../../../components/FzEditSkinDialog";
import { FaTrashAlt } from "react-icons/fa";
import Router from "../../../components/Router";
import Brush from '../../../assets/img/icons/brush.svg'

export default function Apparence(props) {

  let session = props.session;
  let fzVariable = new FzVariable();
  let maximumSkinImport = 24;
  let sidebar = props.sidebar;
  let parentClass = props.parentClass;
  let skinDefault = `https://api.frazionz.net/skins/display?username=${session.username}`;
  const [selectedSkin, setSelectedSkin] = useState(null);
  const [skinUrl, setSkinUrl] = useState(skinDefault);
  const [capeUrl, setCapeUrl] = useState((session.appareance.cape_id > -1) ? `https://api.frazionz.net/capes/display/brut/${session.appareance.cape_id}` : null);
  const [playerObjectRotateY, setPlayerObjectRotateY] = useState(31.7)
  const [disabledEditUpload, setDisabledEditUpload] = useState(true)
  const [routerAlreadyInit, setRouterAlreadyInit] = useState(false)
  const [router, setRouter] = useState()
  const [skinViewer, setSkinViewer] = useState(null)
  const [modelSkin, setModelSkin] = useState((session.isSlim) ? "slim" : "default")
  const [skinsList, setSkinsList] = useState(require(fzVariable.path.join(
    fzVariable.shelfFzLauncherSkins
  )))

  async function editSkinDialog(){
    sessionStorage.setItem("selectedSkin", selectedSkin)
    sessionStorage.setItem("skinsList", JSON.stringify(skinsList))
    router.showPage('/profile_appareance_editskin', true)
  }

  async function downloadSkinPreview3D(base64, uuidSkin) {
    let urlSkinPreview = `https://auth.frazionz.net/skins/3d.php?user=${base64}&b64=true&bustOnly=true&aa=true&vr=6&hr=10`;
    console.log("Download preview skin ", urlSkinPreview);
    let skinPathPreview = fzVariable.path.join(
      fzVariable.dirFzLauncherSkins,
      uuidSkin + ".png"
    );
    return new Promise((resolve, reject) => {
      fzVariable
        .downloadImage(urlSkinPreview, skinPathPreview)
        .then((filepath) => {
          resolve(filepath);
        })
        .catch((err) => {
          console.log(err);
          FzToast.error(
            "Une erreur est survenue lors du téléchargement de la preview du skin."
          );
          resolve();
        });
    });
  }

  async function getPreviewSkin(skin) {
    return new Promise((resolve, reject) => {
      let pathSkin = fzVariable.path.join(
        fzVariable.dirFzLauncherSkins,
        skin.id + ".png"
      );
      if (fzVariable.fs.existsSync(pathSkin)) {
        return resolve(
          fzVariable.fs.readFileSync(pathSkin, { encoding: "base64" })
        );
      } else {
        downloadSkinPreview3D(
          Buffer.from(skin.base64).toString("base64url"),
          skin.id
        ).then((filepath) => {
          return resolve(
            fzVariable.fs.readFileSync(filepath, { encoding: "base64" })
          );
        });
      }
    });
  }

  async function setPreviewSkinSelected(index){
    return new Promise(async (resolve, reject) => {
      if(index == null){
        setDisabledEditUpload(true)
        setSelectedSkin(null)
        setSkinUrl(skinDefault)
        resolve()
      }else{
        setDisabledEditUpload(false)
        setSelectedSkin(index)
        setPlayerObjectRotateY(31.7)
        setSkinUrl(`data:image/png;base64,${skinsList[index].base64}`)
        if(skinsList[index].cape !== undefined)
          setCapeUrl(`https://api.frazionz.net/capes/display/brut/${skinsList[index].cape}`)
        else
          if(skinViewer !== null)
            skinViewer.viewer.resetCape()
        var file = await fzVariable.dataURLtoFile("data:image/png;base64," + skinsList[index].base64, skinsList[index].id + ".png");
        let container = new DataTransfer();
        container.items.add(file);
        document.querySelector('#skinPreviewApplyInput').files = container.files;
        resolve()
      }
    })
  }

  async function addSkinFromMojang(event, inputUsername) {
    event.preventDefault()
    return new Promise(async (resolve, reject) => {
      FzToast.processToast("Recherche et ajout du skin via Mojang..", () => {
        return new Promise(async (resolve, reject) => {
          let searchUserMojang = inputUsername
          if (searchUserMojang.value == "") return reject({ message: 'Veuillez indiquer un pseudo.' })
          let valueUsername = searchUserMojang.value.replaceAll('\'', '')
          await axios.get("https://api.minetools.eu/uuid/" + valueUsername).then(async (response) => {
            var uuid = response.data.id;
            if (uuid !== null || uuid !== undefined) {
              await axios.get("https://api.minetools.eu/profile/" + uuid).then(async (response) => {
                if (response.data.status == "ERR") return reject({ message: `Le profil ${valueUsername} semble ne pas ou ne plus existé` })
                var dataAxios = response.data;
                await imageToBase64(dataAxios.decoded.textures.SKIN.url) // Path to the image
                  .then(
                    async (response) => {
                      const img = new Image();

                      img.src = "data:image/png;base64," + response;

                      img.onload = async function () {
                        const imgWidth = img.naturalWidth;
                        const imgHeight = img.naturalHeight;

                        if (imgWidth != 64 || imgHeight != 64) {
                          searchUserMojang.value = ""
                          return reject({ message: "Le skin n'est pas valide !" })
                        } else {
                          searchUserMojang.value = ""
                          storeSkinShelf(dataAxios.decoded.profileName, response)
                          return resolve({ message: "Le skin a bien été importé via Mojang." })
                        }
                      };


                    }
                  )
                  .catch(
                    async (error) => {
                      console.log(error)
                      searchUserMojang.value = ""
                      return reject({ message: "Une erreur est survenue lors du téléchargement du skin" })
                    }
                  )
              })
            }
          })
        })
      }, (data) => {
        resolve(true)
        return data.message
      }, (data) => {
        resolve(false)
        return data.message
      })
    })
  }

  async function storeSkinShelf(name, base64) {
    const { v4: uuidv4 } = require('uuid');
    const skinsJson = skinsList;
    if(skinsJson.length >= maximumSkinImport) return FzToast.error("Vous avez atteint la limite de skin importé.")
    var checkSkinExit = async () => {
      return new Promise((resolve, reject) => {
        skinsJson.forEach((skin, key, array) => {
          if (skin.base64 == base64)
            resolve(true);
          if (key === array.length - 1) resolve(false);
        })
        if (skinsJson.length == 0) resolve(false);
      })
    }
    await checkSkinExit().then((result) => {
      let uuidSkin = uuidv4()
      if (!result) {
        let base64SkinPreview = Buffer.from(base64).toString('base64url')
        downloadSkinPreview3D(base64SkinPreview, uuidSkin).then(async () => {
          let skinObject = { id: uuidSkin, name: name, base64: base64, model: "steve" };
          skinsJson.push(skinObject)
          fzVariable.fs.writeFileSync(fzVariable.shelfFzLauncherSkins, JSON.stringify(skinsJson));
          setSkinsList(skinsJson)
          setPreviewSkinSelected(skinsJson.findIndex((element) => element.id == skinObject.id))
        })
      }

    })
  }

  async function addSkinFromFile(event) {
    event.preventDefault()
    return new Promise(async (resolve, reject) => {
      let file_data = event.target.files[0];
      FzToast.processToast("Ajout du skin via le fichier..", () => {
        return new Promise(async (resolve, reject) => {
          await imageToBase64(file_data.path) // Path to the image
            .then(
              (response) => {
                storeSkinShelf(file_data.name.replace('.png', ''), response)
                event.target.value = ""
                event.target.parentNode.querySelector('span').innerHTML = "Choisir un fichier"
                return resolve({ message: "Le skin a bien été importé via un fichier." })
              })
            .catch(
              (error) => {
                console.log(error)
                return reject({ message: error })
              }
            )
        })
      }, (data) => {
        resolve(true)
        return data.message
      }, (data) => {
        resolve(false)
        return data.message
      })
    })

  }

  async function uploadFileToLauncher(event) {
    return new Promise((resolve, reject) => {
      checkRulesSize(event.target.files[0], 64, 64).then((result) => {
        let spanInputFile = event.target.parentNode.querySelector('span')
        spanInputFile.innerHTML = "Choisir un fichier"
        if (result)
          spanInputFile.innerHTML = event.target.files[0].name
        else {
          event.target.value = ""
          FzToast.error("Votre skin doit faire une taille de 64x64 pour être valide !")
        }
        resolve(result);
      });
    })
  }

  async function checkRulesSize(file, checkWidth, checkHeight) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (e) {
        var image = new Image();
        image.src = e.target.result;
        image.onload = function () {
          var height = image.height;
          var width = image.width;
          if (height == checkWidth && width == checkHeight)
            resolve(true);
          else
            resolve(false);
        };
      };
    })
  }

  async function uploadSkin(index) {
    try {
      if(selectedSkin == null) return;
      setDisabledEditUpload(true)
      FzToast.processToast("Upload de votre skin..", () => {
        return new Promise(async (resolve, reject) => {
          let skin = skinsList[selectedSkin];
          var file_data = document.querySelector('#skinPreviewApplyInput').files[0];
          var form_data = new FormData()
          form_data.append('skin', file_data);
          form_data.append('type', skin.model);
          form_data.append('capeID', (skin.cape !== undefined) ? skin.cape : -1);
          form_data.append('access_token', session.access_token);
          await axios.post('https://frazionz.net/api/skins/update', form_data, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((response) => {
            if (response.data.status) {
              let session = JSON.parse(sessionStorage.getItem('user'))
              session.appareance.cape_id = (fzVariable.store.has('capeIDSelect')) ? fzVariable.store.get('capeIDSelect') : session.appareance.cape_id
              sessionStorage.setItem('user', JSON.stringify(session))
              sidebar.setState({ avatar: `https://auth.frazionz.net/skins/face.php?${Math.random().toString(36)}&u=${session.id}` })
              parentClass.setState({ avatar: `https://auth.frazionz.net/skins/face.php?${Math.random().toString(36)}&u=${session.id}` })
              return resolve("Votre skin a bien été upload !")
            } else
              return reject("Une erreur est survenue, " + response.data.message)
          }).catch((err) => {
            console.log(err)
            return reject("Une erreur est survenue, " + err)
          })
        })
      }, (message) => {
        setDisabledEditUpload(false)
        return message
      }, (errorMessage) => {
        setDisabledEditUpload(false)
        return errorMessage
      })
    } catch (err) {
      console.log(err)
    }
  }

  async function deleteSkinPreview() {
    try {
      setDisabledEditUpload(true)
      let skinsJson = skinsList.filter(function (skin, i) {
        return i !== selectedSkin;
      });
      fzVariable.fs.writeFileSync(fzVariable.shelfFzLauncherSkins, JSON.stringify(skinsJson));
      fzVariable.fs.rmSync(fzVariable.path.join(fzVariable.dirFzLauncherSkins, skinsList[selectedSkin].id + ".png"))
      setSkinsList(skinsJson)
      setPreviewSkinSelected(null)
    } catch (e) {
      console.log(e)
    }
  }

  async function saveSkin(data){
    let indexSkin = skinsList.findIndex((skin) => skin.id == data.id)
    return new Promise(async (resolve, reject) => {
      skinsList[indexSkin].name = data.name
      skinsList[indexSkin].model = data.model
      if(data.capeIDSelect > -1){
        skinsList[indexSkin].cape = data.capeIDSelect
        setCapeUrl(`https://api.frazionz.net/capes/display/brut/${data.capeIDSelect}`)
      }
      fzVariable.fs.writeFileSync(fzVariable.shelfFzLauncherSkins, JSON.stringify(skinsList))
      setSkinsList([])
      setTimeout(async () => {
        setSkinsList(skinsList)
        await setPreviewSkinSelected(indexSkin)
        FzToast.success('Le skin a bien été mis à jour !')
        resolve()
      }, 90)
    })
  }

  let fcp = { addSkinFromMojang, addSkinFromFile, uploadFileToLauncher, saveSkin }


  async function initRouterAlreadyInit(){
    let router = new Router({
      domParent: document.querySelector('.main.connected .content-child'),
      multipleSubDom: true,
      keySubDom: 'sidepage',
    })
    router.then((router) => {
      router.setPages([
        {
          component: <FzEditSkinDialog sideRouter={ sidebar.router } parentRouter={ router } fcp={fcp} />,
          name: 'Profile_Appareance_EditSkin',
          url: '/profile_appareance_editskin'
        }
      ])
      setRouterAlreadyInit(true)
      setRouter(router)
    })
  }

  if(!routerAlreadyInit) initRouterAlreadyInit()

  return (
    <>
      <div className="apparence">
        <div className="flex align-center gap-20 justify-between apparence">
          <div className="skinPreview">
              <ReactSkinview3d
                id="skin"
                skinUrl={`${skinUrl}`}
                capeUrl={`${(capeUrl !== null) ? capeUrl : null}`}
                height="345"
                width="318"
                options={{
                  model: modelSkin
                }}
                onReady={(ready) => {
                  setSkinViewer(ready)
                  ready.viewer.playerObject.rotation.y = playerObjectRotateY;
                  ready.viewer.controls.enableRotate = true;
                  ready.viewer.controls.enableZoom = false;
                  ready.viewer.controls.enablePan = false;
                }}
              />
              <input type="file" disabled={disabledEditUpload} className="profile-skin custom-file-input hide" id="skinPreviewApplyInput" name="skin" accept=".png" required />
                {selectedSkin !== null &&
                  <div className="flex gap-10">
                    <button onClick={ deleteSkinPreview } disabled={disabledEditUpload} className="btn icon danger"><FaTrashAlt /></button>
                    <button onClick={ editSkinDialog } className="btn icon"><img src={Brush} alt="" /></button>
                    <button onClick={ uploadSkin } disabled={disabledEditUpload} className="btn w-full">Appliquer</button>
                  </div>
                }
          </div>
          <div className="skins gap-20 w-full">
            <div className="head">
              <div className="titles">
                <h2 className="text-white text-3xl">Bibliothèque des skins</h2>
                <h2 className="text-xl text-inactive">Skins ({skinsList.length}/{maximumSkinImport})</h2>
              </div>
              <div className="actions">
                <FzImportationSkinDialog fcp={fcp} />
              </div>
            </div>
            <div className="library">
              {skinsList.map((skin, i) => {
                let skinPreviewPath = fzVariable.path.join(
                  fzVariable.dirFzLauncherSkins,
                  skin.id + ".png"
                );
                return (
                  <div key={i} onClick={ () => { setPreviewSkinSelected(i) }} className={`card skin ${(selectedSkin == i) ? "active" : ""}`}>
                    <div className="card-body">
                      <img src={skinPreviewPath} alt="" />
                      <div className="datas">
                        <span className="name">{skin.name}</span>
                        <span className="model">{fzVariable.firstUCase(skin.model)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
