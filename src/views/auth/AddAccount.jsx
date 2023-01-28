import React, { useState, useRef } from "react"

import { RiLoader4Fill } from 'react-icons/ri'
import FzToast from "../../components/FzToast"

export default function AddAccount(props) {

    const [disabledForm, setDisabledForm] = useState(false)
    let parentClass = props.parentClass
    let inputUsername = useRef()
    let inputPassword = useRef()
    parentClass.setAllowBackHL(props.allowBackHL)

    parentClass.setTitle('Connexion à votre compte')

    async function handleClick() {
        setDisabledForm(true)
        let userMail = inputUsername.current?.value
        let userPassword = inputPassword.current?.value
        FzToast.processToast("Connexion en cours..", parentClass.auth.addAccount(userMail, userPassword, undefined, false),
            (data) => {
                sessionStorage.setItem('user', JSON.stringify(data.user))
                parentClass.appRouter.showPage('/connected')
                return `Vous êtes connectés ! Welcome ${data.user.username}`
            },
            (data) => {
                setDisabledForm(false)
                if (data.twofa){
                    sessionStorage.setItem('log2FA', JSON.stringify({ ue: userMail, up: Buffer.from(userPassword).toString('base64') }))
                    parentClass.router.showPage('/twoFaAccount')
                }
                return `${data.msg}`
            })
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="email-address" className="text-white">
                        Adresse Mail
                    </label>
                    <input
                        ref={inputUsername}
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className=""
                        placeholder="Adresse Mail"
                        disabled={disabledForm}
                        onKeyDown={ (e) => { if(e.key === 'Enter') handleClick() } }
                        defaultValue={parentClass.fzVariable.store.get('lastEmail', '')}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="text-white">
                        Mot de passe
                    </label>
                    <input
                        ref={inputPassword}
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        disabled={disabledForm}
                        onKeyDown={ (e) => { if(e.key === 'Enter') handleClick() } }
                        className="relative block w-full bg-[var(--fzbg-2)] text-white placeholder-gray-500 focus:z-10 focus:outline-none focus:ring-indigo-500"
                        placeholder="Mot de passe"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <a
                            onClick={() => { if (!disabledForm) parentClass.router.showPage('/passwordForget') }}
                            className="text-lg"
                        >
                            Mot de passe oublié ?
                        </a>
                    </div>
                </div>
                <div className="flex justify-center">
                    <button id="buttonLoginAuth" disabled={disabledForm} className="btn" onClick={handleClick}>
                        <RiLoader4Fill className="icon animate-spin hidden" />
                        Se connecter
                    </button>
                </div>
            </div>
        </>
    )

}