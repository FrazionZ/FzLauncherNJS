import React, { useState, useRef } from "react"

import { BsMicrosoft } from 'react-icons/bs'
import Alert from '../../components/Alert'

import fzLogo from '../../assets/img/icons/fz_logo.svg'

export default function AddAccount(props) {

    let parentClass = props.parentClass
    parentClass.setAllowBackHL(props.allowBackHL)
    parentClass.setTitle('Quel type de compte ajouter ?')

    return (
        <>
            <Alert state="infos" className="mb-24" message="Les types de comptes hors Frazion, n'ont pas accès à certains serveurs liés à FzLauncher" />
            <div className="flex gap-4 justify-center">
                <button className="btn w-fit" onClick={() => { parentClass.router.showPage('/fzAccount') }}>FrazionZ</button>
                <button className="btn w-fit"><BsMicrosoft /> Microsoft</button>
            </div>
        </>
    )

}