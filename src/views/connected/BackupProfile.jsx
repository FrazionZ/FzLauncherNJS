import React, { Suspense, useState } from 'react'
import money from '../../assets/img/icons/money.png'
import FzToast from '../../components/FzToast';
import FzVariable from '../../components/FzVariable';
import Auth from '../../components/Auth'
import { Button, Spinner } from 'flowbite-react';
import { FaTrash } from 'react-icons/fa';
const FzSkinViewer = React.lazy(() => import('react-skinview3d'));
const imageToBase64 = require('image-to-base64');
const auth = new Auth()
import axios from 'axios';
import FzImportationSkinDialog from '../../components/FzImportationSkinDialog';
import FzEditSkinDialog from '../../components/FzEditSkinDialog';
import SteveSkin from '../../assets/img/steve.png'
import { Tooltip } from 'flowbite-react';
import { cp } from 'original-fs';
let skinsListRequire;
let skinsPreviewPicture = [];
const { v4: uuidv4 } = require('uuid');

export default function Profile(props) {


  const [globalSkin, setGlobalSkin] = useState(null)
  const [previewSkinIndex, setPreviewSkinIndex] = useState(0)
  const [previewSkinData, setPreviewSkinData] = useState(null)
  const [skinsList, setSkinsList] = useState([])
  const [disableImport, setDisabledImport] = useState(false)
  const [isInit, setIsInit] = useState(false)


  let appRouter = props.appRouter;
  let sidebar = props.sidebar;
  let fzVariable = new FzVariable();
  let session = JSON.parse(sessionStorage.getItem('user'));
  logout = logout.bind(this)

  setGlobalSkin(`https://api.frazionz.net/skins/display?username=${session.username}`)
  let capeUrl = `https://api.frazionz.net/capes/display?username=${session.username}`

  selectSkinPreview = selectSkinPreview.bind(this)
  addSkinFromMojang = addSkinFromMojang.bind(this)
  addSkinFromFile = addSkinFromFile.bind(this)
  uploadFileToLauncher = uploadFileToLauncher.bind(this)
  deleteSkinPreview = deleteSkinPreview.bind(this)
  uploadSkin = uploadSkin.bind(this)

  setSkinsList(skinsListRequire)
  if (skinsList.length > 0) {
    setPreviewSkinIndex(0)
    setPreviewSkinData(skinsList[0])
    /*console.log(previewSkinData)
    var file = fzVariable.dataURLtoFile("data:image/png;base64," + previewSkinData.base64, uuidv4() + ".png");
    let container = new DataTransfer();
    container.items.add(file);
    document.querySelector('#skinPreviewApplyInput').files = container.files;*/
  }

  skinsListRequire = require(fzVariable.path.join(fzVariable.shelfFzLauncherSkins));


  async function logout(button) {
    button.disabled = false;
    auth.logout(session.access_token).then(() => {
      sessionStorage.removeItem('user')
      fzVariable.store.delete('session')
      appRouter.showPage('/login')
      FzToast.success('Vous avez bien été déconnecté de votre session !')
    })
  }

  async function selectSkinPreview(idSkin) {
    let dskin = skinsList[idSkin]
    setPreviewSkinIndex(idSkin)
    setPreviewSkinData(dskin)
    var file = await fzVariable.dataURLtoFile("data:image/png;base64," + dskin.base64, uuidv4() + ".png");
    let container = new DataTransfer();
    container.items.add(file);
    document.querySelector('#skinPreviewApplyInput').files = container.files;
  }

  async function deleteSkinPreview() {
    try {
      let instance = this;
      let skinsJson = skinsList.filter(function (skin, i) {
        return i !== previewSkinIndex;
      });
      skinsPreviewPicture = skinsPreviewPicture.filter(function (skin, i) {
        return i !== previewSkinIndex;
      });
      setSkinsList(skinsJson)
      fzVariable.fs.writeFileSync(fzVariable.shelfFzLauncherSkins, JSON.stringify(skinsJson));
      fzVariable.fs.rmSync(fzVariable.path.join(fzVariable.dirFzLauncherSkins, previewSkinData.id + ".png"))
      if (skinsJson.length > 0)
        selectSkinPreview(0)
      else {
        setPreviewSkinIndex(0)
        setPreviewSkinData(null)
      }
    } catch (e) {
      console.log(e)
    }
  }

  async function skinLoadPreview(instance, dskin) {
    var file = await instance.dataURLtoFile("data:image/png;base64," + dataSkin.base64, uuidv4() + ".png");
    let container = new DataTransfer();
    container.items.add(file);
    document.querySelector('#skinPreviewApplyInput').files = container.files;
  }

  async function getSkinFromB64(b64Skin) {
    return new Promise((resolve, reject) => {
      skinsList.forEach((skin, key, array) => {
        if (skin.base64 == b64Skin)
          resolve(skin);
        if (key === array.length - 1) resolve(null);
      })
      if (skinsList.length == 0) resolve(null);
    })
  }

  async function addSkinFromMojang(event, inputUsername) {
    event.preventDefault()
    let instance = this
    return new Promise(async (resolve, reject) => {
      FzToast.processToast("Recherche et ajout du skin via Mojang..", () => {
        return new Promise(async (resolve, reject) => {
          let searchUserMojang = inputUsername
          if (inputUsername == "") return reject('Veuillez indiquer un pseudo.')
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
                          instance.storeSkinShelf(dataAxios.decoded.profileName, response)
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

  async function addSkinFromFile(event) {
    event.preventDefault()
    let instance = this
    return new Promise(async (resolve, reject) => {
      let file_data = event.target.files[0];
      FzToast.processToast("Ajout du skin via le fichier..", () => {
        return new Promise(async (resolve, reject) => {
          await imageToBase64(file_data.path) // Path to the image
            .then(
              (response) => {
                instance.storeSkinShelf(file_data.name.replace('.png', ''), response)
                event.target.value = ""
                event.target.parentNode.querySelector('span').innerHTML = "Choisir un fichier"

                setDisabledImport(false)
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
    checkRulesSize(event.target.files[0], 64, 64).then((result) => {
      let spanInputFile = event.target.parentNode.querySelector('span')
      spanInputFile.innerHTML = "Choisir un fichier"
      if (result)
        spanInputFile.innerHTML = event.target.files[0].name
      else {
        event.target.value = ""
        FzToast.error("Votre skin doit faire une taille de 64x64 pour être valide !")
      }
    });
  }

  async function checkRulesSize(file, checkWidth, checkHeight) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (e) {
        var image = new Image();
        image.src = e.target.result;
        image.onload = function () {
          var height = height;
          var width = width;
          if (height == checkWidth && width == checkHeight)
            resolve(true);
          else
            resolve(false);
        };
      };
    })
  }

  async function storeSkinShelf(name, base64) {
    const { v4: uuidv4 } = require('uuid');
    const skinsJson = skinsList;
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
          let skinObject = { id: uuidSkin, name: name, base64: base64, model: "default" };
          skinsJson.push(skinObject)
          fzVariable.fs.writeFileSync(fzVariable.shelfFzLauncherSkins, JSON.stringify(skinsJson));


          skinsPreviewPicture = [];
          for await (const [i, skin] of skinsJson.entries()) {
            let skinPreview = await getPreviewSkin(skin)
            skinsPreviewPicture.push({ id: i, b64: skinPreview })
          }

          setSkinsList(skinsJson)
          selectSkinPreview(skinsJson.findIndex((element) => element.id == skinObject.id))
        })
      }

    })
  }

  async function downloadSkinPreview3D(base64, uuidSkin) {
    let urlSkinPreview = `https://auth.frazionz.net/skins/3d.php?user=${base64}&b64=true&bustOnly=true&aa=true&vr=6&hr=10`;
    console.log("Download preview skin ", urlSkinPreview)
    let skinPathPreview = fzVariable.path.join(fzVariable.dirFzLauncherSkins, uuidSkin + ".png")
    return new Promise((resolve, reject) => {
      fzVariable.downloadImage(urlSkinPreview, skinPathPreview).then((filepath) => {
        resolve(filepath)
      }).catch((err) => {
        console.log(err)
        FzToast.error('Une erreur est survenue lors du téléchargement de la preview du skin.')
        resolve()
      })
    })
  }

  async function uploadSkin() {
    try {
      setDisabledImport(true)
      FzToast.processToast("Upload de votre skin..", () => {
        return new Promise(async (resolve, reject) => {
          var file_data = document.querySelector('#skinPreviewApplyInput').files[0];
          var form_data = new FormData()
          form_data.append('skin', file_data);
          form_data.append('type', "steve");
          form_data.append('access_token', session.access_token);
          await axios.post('https://frazionz.net/api/skin-api/skins/update', form_data, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((response) => {
            if (response.data.status) {
              sidebar.setState({ avatar: `https://auth.frazionz.net/skins/face.php?${Math.random().toString(36)}&u=${session.id}` })
              setGlobalSkin(`data:image/png;base64,${response.data.base64}`)
              return resolve("Votre skin a bien été upload !")
            } else
              return reject("Une erreur est survenue, " + response.data.message)
          }).catch((err) => {
            console.log(err)
            return reject("Une erreur est survenue, " + err)
          })
        })
      }, (message) => {
        setDisabledImport(false)
        return message
      }, (errorMessage) => {
        setDisabledImport(false)
        return errorMessage
      })
    } catch (err) {
      console.log(err)
    }
  }

  async function getPreviewSkin(skin) {
    return new Promise((resolve, reject) => {
      let pathSkin = fzVariable.path.join(fzVariable.dirFzLauncherSkins, skin.id + ".png");
      if (fzVariable.fs.existsSync(pathSkin)) {
        return resolve(fzVariable.fs.readFileSync(pathSkin, { encoding: 'base64' }));
      } else {
        downloadSkinPreview3D(Buffer.from(skin.base64).toString('base64url'), skin.id).then((filepath) => {
          return resolve(fzVariable.fs.readFileSync(filepath, { encoding: 'base64' }));
        })
      }
    })
  }

  async function updateSkinData(event, data) {
    event.preventDefault()
    let skinsList = skinsList;
    if (event.target.value == "") return FzToast.error('Vous devez saisir un nom valide.')
    if (data == "username") {
      let newName = event.target.value;
      previewSkinData.name = event.target.value
      for await (const skin of skinsList)
        if (skin.id == previewSkinData.id) {
          skin.name = newName;
        }
    }
    fzVariable.fs.writeFileSync(fzVariable.shelfFzLauncherSkins, JSON.stringify(skinsList));
    for await (const skin of skinsList) {
      skin.testVariable = "Ceci est un test d'enculé."
    }
    setPreviewSkinData(previewSkinData)
    setPreviewSkinIndex(previewSkinIndex)
  }

  return (
    <>

      <div className="flex profile">
        <div className="column flex justify-center direct-column">
          <div className="column">
            <Suspense fallback={<Spinner className='mx-20' size="lg" />}>
              <FzSkinViewer
                skinUrl={(globalSkin !== null) ? globalSkin : SteveSkin}
                capeUrl={capeUrl}
                height="352"
                width="240"
                onReady={(ready) => {
                  ready.viewer.playerObject.rotation.y = 31.7
                  ready.viewer.controls.enableRotate = true;
                  ready.viewer.controls.enableZoom = false;
                  ready.viewer.controls.enablePan = false;
                }}
              />
            </Suspense>
          </div>
        </div>
        <div className="column w-100 flex justif-end gap-15 direct-column">
          <div className="flex align-center justif-between">
            <div><h2 className="underline session__username">{session.username}</h2></div>
            <div>
              <button className="danger" onClick={logout}>Se Déconnecter</button>
            </div>
          </div>
          <div className="flex gap-15 flex-col justify-center">
            <div className="card w-100">
              <div className="card-body flex gap-15 align-center">
                <div className="column">
                  <img src={money} width="24" height="24" alt="money" />
                </div>
                <div className="column flex align-center">
                  <h2 className="infos session__money reset-mp">
                    <span className="key">{session.money}</span>
                    <span className="text-gray">Points Boutique</span>
                  </h2>
                </div>
              </div>
            </div>
            <div className="card w-100">
              <div className="card-body">
                <div className="flex align-center gap-15">
                  <div className="column">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                      <g clipPath="url(#clip0_1053_3896)">
                        <path d="M23.954 5.54199L15.536 13.96C14.5974 14.8963 13.3257 15.422 12 15.422C10.6743 15.422 9.40263 14.8963 8.464 13.96L0.046 5.54199C0.032 5.69999 0 5.84299 0 5.99999V18C0.00158786 19.3256 0.528882 20.5964 1.46622 21.5338C2.40356 22.4711 3.6744 22.9984 5 23H19C20.3256 22.9984 21.5964 22.4711 22.5338 21.5338C23.4711 20.5964 23.9984 19.3256 24 18V5.99999C24 5.84299 23.968 5.69999 23.954 5.54199Z" fill="var(--text)" />
                        <path d="M14.122 12.546L23.256 3.411C22.8135 2.67732 22.1895 2.07004 21.444 1.64773C20.6985 1.22542 19.8568 1.00234 19 1H5.00002C4.14324 1.00234 3.30152 1.22542 2.55605 1.64773C1.81057 2.07004 1.1865 2.67732 0.744019 3.411L9.87802 12.546C10.4416 13.1073 11.2046 13.4225 12 13.4225C12.7954 13.4225 13.5584 13.1073 14.122 12.546Z" fill="var(--text)" />
                      </g>
                      <defs>
                        <clipPath id="clip0_1053_3896">
                          <rect width="24" height="24" fill="var(--text)" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <div className="column flex align-center">
                    <h2 className="infos session__email reset-mp">
                      <span className="key">{session.email}</span>
                      <span className="text-gray">Adresse Mail</span>
                    </h2>
                  </div>
                </div>
              </div>
            </div>
            <div className="card w-100">
              <div className="card-body">
                <div className="flex align-center gap-15">
                  <div className="column">
                    <svg style={{ width: "24px", fill: "white" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                      <path d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z" />
                    </svg>
                  </div>
                  <div className="column flex align-center">
                    <h2 className="infos session__email reset-mp">
                      <span className="key">{session.role.name}</span>
                      <span className="text-gray">Rôle</span>
                    </h2>
                  </div>
                </div>
              </div>
            </div>
            <div className="card w-100">
              <div className="card-body">
                <div className="flex align-center gap-15">
                  <div className="column">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_1053_3902)">
                        <path d="M0 19C0.00158786 20.3256 0.528882 21.5964 1.46622 22.5338C2.40356 23.4711 3.6744 23.9984 5 24H19C20.3256 23.9984 21.5964 23.4711 22.5338 22.5338C23.4711 21.5964 23.9984 20.3256 24 19V10H0V19ZM17 14.5C17.2967 14.5 17.5867 14.588 17.8334 14.7528C18.08 14.9176 18.2723 15.1519 18.3858 15.426C18.4993 15.7001 18.5291 16.0017 18.4712 16.2926C18.4133 16.5836 18.2704 16.8509 18.0607 17.0607C17.8509 17.2704 17.5836 17.4133 17.2926 17.4712C17.0017 17.5291 16.7001 17.4994 16.426 17.3858C16.1519 17.2723 15.9176 17.08 15.7528 16.8334C15.588 16.5867 15.5 16.2967 15.5 16C15.5 15.6022 15.658 15.2206 15.9393 14.9393C16.2206 14.658 16.6022 14.5 17 14.5ZM12 14.5C12.2967 14.5 12.5867 14.588 12.8334 14.7528C13.08 14.9176 13.2723 15.1519 13.3858 15.426C13.4994 15.7001 13.5291 16.0017 13.4712 16.2926C13.4133 16.5836 13.2704 16.8509 13.0607 17.0607C12.8509 17.2704 12.5836 17.4133 12.2926 17.4712C12.0017 17.5291 11.7001 17.4994 11.426 17.3858C11.1519 17.2723 10.9176 17.08 10.7528 16.8334C10.588 16.5867 10.5 16.2967 10.5 16C10.5 15.6022 10.658 15.2206 10.9393 14.9393C11.2206 14.658 11.6022 14.5 12 14.5ZM7 14.5C7.29667 14.5 7.58668 14.588 7.83336 14.7528C8.08003 14.9176 8.27229 15.1519 8.38582 15.426C8.49935 15.7001 8.52906 16.0017 8.47118 16.2926C8.4133 16.5836 8.27044 16.8509 8.06066 17.0607C7.85088 17.2704 7.58361 17.4133 7.29264 17.4712C7.00166 17.5291 6.70006 17.4994 6.42597 17.3858C6.15189 17.2723 5.91762 17.08 5.7528 16.8334C5.58797 16.5867 5.5 16.2967 5.5 16C5.5 15.6022 5.65804 15.2206 5.93934 14.9393C6.22064 14.658 6.60218 14.5 7 14.5V14.5Z" fill="var(--text)" />
                        <path d="M19 2H18V1C18 0.734784 17.8946 0.48043 17.7071 0.292893C17.5196 0.105357 17.2652 0 17 0C16.7348 0 16.4804 0.105357 16.2929 0.292893C16.1054 0.48043 16 0.734784 16 1V2H8V1C8 0.734784 7.89464 0.48043 7.70711 0.292893C7.51957 0.105357 7.26522 0 7 0C6.73478 0 6.48043 0.105357 6.29289 0.292893C6.10536 0.48043 6 0.734784 6 1V2H5C3.6744 2.00159 2.40356 2.52888 1.46622 3.46622C0.528882 4.40356 0.00158786 5.6744 0 7L0 8H24V7C23.9984 5.6744 23.4711 4.40356 22.5338 3.46622C21.5964 2.52888 20.3256 2.00159 19 2V2Z" fill="var(--text)" />
                      </g>
                      <defs>
                        <clipPath id="clip0_1053_3902">
                          <rect width="24" height="24" fill="var(--text)" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <div className="column flex align-center">
                    <h2 className="infos session__createdAt reset-mp">
                      <span className="key">{session.created_at}</span>
                      <span className="text-gray">Compte créé le</span>
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex direct-column gap-15">
        <div id="profile-appearance">
          <div className="apparence">
            <div className="flex direct-column gap-15">
              {skinsList !== null &&
                <div className="flex gap-15">
                  {previewSkinData !== null &&
                    <>
                      <div className="card skinPreview" style={{ height: "fit-content" }}>
                        <div className="card-body justif-center flex gap-36 direct-column">
                          <div className="flex justify-center">
                            <Suspense fallback={<Spinner className='mx-20' size="lg" />}>
                              <FzSkinViewer
                                id="skin"
                                skinUrl={`data:image/png;base64,${previewSkinData.base64}`}
                                capeUrl={`${capeUrl}`}
                                height="345"
                                width="318"
                                onReady={(ready) => {
                                  ready.viewer.playerObject.rotation.y = 31.7;
                                  ready.viewer.controls.enableRotate = true;
                                  ready.viewer.controls.enableZoom = false;
                                  ready.viewer.controls.enablePan = false;
                                }}
                              />
                            </Suspense>
                          </div>
                          <input type="file" className="profile-skin custom-file-input hide" disabled={disableImport} id="skinPreviewApplyInput" name="skin" accept=".png" required />
                          <div className="flex gap-15">
                            <div className="column">
                              <button className="deleteSkinPreview btn font-sml icon danger" onClick={deleteSkinPreview}><FaTrash /></button>
                            </div>
                            <div className="column">
                              <FzEditSkinDialog callClass={this} />
                            </div>
                            <div className="column w-100">
                              <button className="w-100 btn font-sml" disabled={disableImport} onClick={uploadSkin}>Appliquer</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  }
                  <div className="card w-100">
                    <div className="card-body flex gap-36 direct-column">
                      <div className="column">
                        <div className="flex justify-between">
                          <div className="column">
                            <h2 className="underline">Bibliothèque de skin</h2>
                            <span id="shelfCountSkinsSpan">{skinsList.length} / 10 - Skins enregistrés dans la bibliothèque</span>
                          </div>
                          <div className="column">
                            <FzImportationSkinDialog callClass={this} />
                          </div>
                        </div>
                        <div id="skins_list" className="skinList mt-6">
                          {skinsList.map((skin, i) => {
                            return (
                              <Tooltip key={i} content="Cette preview n'est pas représentative du skin, elle ne prend pas en compte le type du skin">
                                <div onClick={() => { selectSkinPreview(i) }} className={`card skin_item gap-15 ${(previewSkinIndex == i) ? "active" : ""}`} data-base64="">
                                  <div className="card-body">
                                    <img style={{ width: "6rem", marginBottom: "1rem" }} src={`data:image/png;base64,${skinsPreviewPicture[i]?.b64}`} alt="" />
                                    <h6 id="skin_name" className="text-center">{skin.name}</h6>
                                    <h6 id="skin_model" className="text-center">{skin.model}</h6>
                                  </div>
                                </div>
                              </Tooltip>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              }
            </div>
          </div>
        </div>
      </div>
    </>
  )

}
