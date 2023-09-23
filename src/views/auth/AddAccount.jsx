import React, { Fragment, useState, useRef } from "react"
import { Dialog, Transition } from "@headlessui/react";
import * as minecraftAuth from "minecraft-auth";
import { BsMicrosoft } from 'react-icons/bs'
import FzVariable from '../../components/FzVariable';
import Alert from '../../components/Alert'
import axios from 'axios';
import fetch from "node-fetch";
import fzLogo from '../../assets/img/icons/fz_logo.svg'
import { Spinner } from 'flowbite-react'
import FzToast from "../../components/FzToast";

const MICROSOFT_AUTHORIZATION_ENDPOINT = "https://login.live.com/oauth20_authorize.srf";
const MICROSOFT_TOKEN_ENDPOINT = "https://login.live.com/oauth20_token.srf";
const MICROSOFT_REDIRECTION_ENDPOINT = "https://login.live.com/oauth20_desktop.srf";
const XBOX_LIVE_AUTH_HOST = "user.auth.xboxlive.com";
const XBOX_LIVE_CLIENT_ID = "000000004C12AE6F";
const XBOX_LIVE_SERVICE_SCOPE = "service::user.auth.xboxlive.com::MBI_SSL";
const XBOX_LIVE_AUTHORIZATION_ENDPOINT = "https://user.auth.xboxlive.com/user/authenticate";
const XSTS_AUTHORIZATION_ENDPOINT = "https://xsts.auth.xboxlive.com/xsts/authorize";
const MINECRAFT_AUTH_ENDPOINT = "https://api.minecraftservices.com/authentication/login_with_xbox";
const XBOX_LIVE_AUTH_RELAY = "http://auth.xboxlive.com";
const MINECRAFT_AUTH_RELAY = "rp://api.minecraftservices.com/";
const MINECRAFT_STORE_ENDPOINT = "https://api.minecraftservices.com/entitlements/mcstore";
const MINECRAFT_PROFILE_ENDPOINT = "https://api.minecraftservices.com/minecraft/profile";
const MINECRAFT_STORE_IDENTIFIER = "game_minecraft";
const URL_OBTAIN_TOKEN = MICROSOFT_AUTHORIZATION_ENDPOINT + "?client_id=" + XBOX_LIVE_CLIENT_ID + "&redirect_uri=" + MICROSOFT_REDIRECTION_ENDPOINT + "&scope=" + XBOX_LIVE_SERVICE_SCOPE + "&response_type=token";

export default function AddAccount(props) {

    const fzVariable = new FzVariable()
    const appRouter = props.appRouter
    let parentClass = props.parentClass
    parentClass.setAllowBackHL(props.allowBackHL)
    parentClass.setTitle(fzVariable.store.has('msa') ? 'FrazionZ' : 'Quel type de compte ajouter ?')

    const [isOpen, setIsOpen] = useState(false);
    const webview = useRef(null);

    const startMSA = async () => {
        /*const MicrosoftAuth = minecraftAuth.MicrosoftAuth;

        let account = new minecraftAuth.MicrosoftAccount();
        MicrosoftAuth.setup({ appID:"000000004C12AE6F"});
        let code = await MicrosoftAuth.listenForCode();
        
        if(code !== undefined){
            await account.authFlow(code);
        }*/
        return new Promise((resolve, reject) => {
            const el = document.querySelector('webview');
            el.addEventListener('did-navigate', async (event) => {
                if (event.url.startsWith(MICROSOFT_REDIRECTION_ENDPOINT)) {
                    const getExtractValue = (key) => {
                        const regex = new RegExp(key + "=([^&]*)");
                        return ((event.url.match(regex) !== null) ? event.url.match(regex)[1] : "");
                    }
                    const access_token = getExtractValue("access_token");
                    const refresh_token = getExtractValue("refresh_token");
                    if (access_token == "" || refresh_token == "")
                        return el.loadURL(URL_OBTAIN_TOKEN);
                    await loginTokens(access_token, refresh_token).then(async (profile) => {
                        await axios.get('https://api.frazionz.net/user/' + profile.mcProfile.id + '/account').then((response) => {
                            closeModal()
                            const fzProfile = response.data;
                            sessionStorage.setItem('fzProfile', JSON.stringify({ fzProfile }))
                            sessionStorage.setItem('mcProfile', JSON.stringify({ profile }))
                            appRouter.showPage('/connected')
                            resolve(profile)
                        }).catch((err) => {
                            fzVariable.store.delete('msa');
                            closeModal()
                            FzToast.error("Vous n'avez pas de compte FrazionZ lié à Minecraft. Connectez-vous à Frazionz.net et faites la liaison.")
                        })
                    }).catch((err) => {
                        fzVariable.store.delete('msa');
                        closeModal()
                        FzToast.error("Une erreur est survenue lors de la connexion au compte Microsoft")
                    })
                }
            })
        })
    }

    function StringFormat(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };

    function closeModal() {
        setIsOpen(false);
    }

    async function openModal() {
        await setIsOpen(true);
    }

    async function loginTokens(access_token, refresh_token) {
        var instance = this;
        let xboxLiveResponse;
        let xstsResponse;
        let minecraftResponse;
        let minecraftProfile;
        return new Promise(async (resolve, reject) => {
            try {
                await axios({
                    method: 'post',
                    url: XBOX_LIVE_AUTHORIZATION_ENDPOINT,
                    data: {
                        Properties: {
                            AuthMethod: "RPS",
                            SiteName: XBOX_LIVE_AUTH_HOST,
                            RpsTicket: access_token
                        },
                        RelyingParty: XBOX_LIVE_AUTH_RELAY,
                        TokenType: 'JWT'
                    }
                }).then((result) => {
                    xboxLiveResponse = result.data;
                }).catch((error) => {
                    reject(error)
                })
                await axios({
                    method: 'post',
                    url: XSTS_AUTHORIZATION_ENDPOINT,
                    data: {
                        Properties: {
                            SandboxId: "RETAIL",
                            UserTokens: [xboxLiveResponse.Token],
                        },
                        RelyingParty: MINECRAFT_AUTH_RELAY,
                        TokenType: 'JWT'
                    }
                }).then((result) => {
                    xstsResponse = result.data;
                }).catch((error) => {
                    reject(error)
                })

                const userHash = xstsResponse.DisplayClaims.xui[0].uhs;
                const MINECRAFT_AUTH_ENDPOINT_POST = {
                    identityToken: StringFormat("XBL3.0 x={0};{1}", userHash, xstsResponse.Token),
                    ensureLegacyEnabled: 'true',
                };

                const minecraftAuthEndpoint = await fetch(MINECRAFT_AUTH_ENDPOINT, { method: 'post', headers: { "Content-Type": "application/json" }, body: JSON.stringify(MINECRAFT_AUTH_ENDPOINT_POST) });
                minecraftResponse = await minecraftAuthEndpoint.json();

                const resultMinecraftStoreEndpoint = await fetch(MINECRAFT_STORE_ENDPOINT, { method: 'get', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${minecraftResponse.access_token}` } });
                const mcStoreData = await resultMinecraftStoreEndpoint.json();

                const gameMinecraft = mcStoreData.items.find(element => element.name == MINECRAFT_STORE_IDENTIFIER);
                if (gameMinecraft !== null || gameMinecraft !== undefined) {
                    const minecraftProfileEndpoint = await fetch(MINECRAFT_PROFILE_ENDPOINT, { method: 'get', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${minecraftResponse.access_token}` } });
                    minecraftProfile = await minecraftProfileEndpoint.json();
                    fzVariable.store.set('msa', { accessToken: minecraftResponse.access_token, refreshToken: refresh_token })
                    resolve({ mcProfile: minecraftProfile, mcResponse: minecraftResponse });
                }
            }catch(error) {
                reject(error)
            }
        })
    }

    async function loginRefreshTokens() {
        return new Promise(async (resolve, reject) => {
            try {
                const microsoftTokenEndpoint = "https://login.live.com/oauth20_token.srf?client_id=" + XBOX_LIVE_CLIENT_ID + "&grant_type=refresh_token&refresh_token=" + fzVariable.store.get('msa').refreshToken + "&scope=" + XBOX_LIVE_SERVICE_SCOPE
                const responseMicrosoftTokenEndpoint = await fetch(microsoftTokenEndpoint, { method: 'get', headers: { "Content-Type": "application/x-www-form-urlencoded" } });
                const microsoftRefreshResponse = await responseMicrosoftTokenEndpoint.json();
                fzVariable.store.set('msa', { accessToken: microsoftRefreshResponse.access_token, refreshToken: microsoftRefreshResponse.refresh_token })
                await loginTokens(microsoftRefreshResponse.access_token, microsoftRefreshResponse.refresh_token).then((profile) => {
                    resolve({ mcProfile: profile.mcProfile, mcResponse: profile.mcResponse });
                })
            }catch(error) {
                reject(error)
            }
        })
    }


    if (fzVariable.store.has('msa')) {
        loginRefreshTokens().then(async(profile) => {
            await axios.get('https://api.frazionz.net/user/' + profile.mcProfile.id + '/account').then((response) => {
                const fzProfile = response.data;
                sessionStorage.setItem('fzProfile', JSON.stringify({ fzProfile }))
                sessionStorage.setItem('mcProfile', JSON.stringify({ profile }))
                appRouter.showPage('/connected')
            }).catch((err) => {
                fzVariable.store.delete('msa');
                parentClass.router.reloadRenderPage('/addAccount')
                FzToast.error("Vous n'avez pas de compte FrazionZ lié à Minecraft. Connectez-vous à Frazionz.net et faites la liaison.")
            })
        }).catch((err) => {
            fzVariable.store.delete('msa');
            parentClass.router.reloadRenderPage('/addAccount')
            FzToast.error("Une erreur est survenue lors de la connexion au compte Microsoft")
        })
        return (
            <div className="verifyAccount flex align-center justify-center h-[inherit]">
                <div className="flex items-center justify-center gap-30">
                    <div className="loader-3"></div>
                    <div className="flex flex-col">
                    <h6 id="downloadhtml" className="text-xl">
                        Authentification en cours..
                    </h6>
                    <h5 id="downloadpercent" className="text-base">
                        Préparation de la session
                    </h5>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <>
                <div className="flex gap-4 justify-center">
                    <button className="btn w-fit" onClick={openModal}><BsMicrosoft /> Microsoft</button>
                    <Transition appear beforeEnter={startMSA} show={isOpen} as={Fragment}>
                        <Dialog
                            as="div"
                            initialFocus={webview}
                            className="fixed inset-0 z-10 overflow-y-auto"
                            onClose={closeModal}
                        >
                            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                            <div className="min-h-screen px-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Dialog.Overlay className="fixed inset-0" />
                                </Transition.Child>

                                {/* This element is to trick the browser into centering the modal contents. */}
                                <span
                                    className="inline-block h-screen align-middle"
                                    aria-hidden="true"
                                >
                                    &#8203;
                                </span>
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <div className="inline-block w-full max-w-md overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                                        <webview ref={webview} id="foo" src={URL_OBTAIN_TOKEN} style={{ width: "inherit", height: "500px" }} />
                                    </div>
                                </Transition.Child>
                            </div>
                        </Dialog>
                    </Transition>
                </div>
            </>
        )
    }

}