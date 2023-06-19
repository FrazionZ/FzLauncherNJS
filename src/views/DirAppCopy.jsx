import React, { useState } from 'react'
import FzVariable from '../components/FzVariable'
import { ipcRenderer } from 'electron'
import { FaSearch } from 'react-icons/fa'
const fzVariable = new FzVariable()


export default function DirAppCopy(props) {

    const dirAppPathDefault = process.env['APPDATA'] + '\\.FrazionzLauncher'
    const router = props.appRouter

    return (
        <div className="fz-h-100 flex flex-col gap-30 p-20">
            <div className="flex flex-col gap-3">
                <h2 className='text-white text-2xl font-semibold'>Chemin d'installation de FrazionZ Launcher</h2>
                <h4 className='text-[var(--text-inactive)] text-lg font-medium'>Vous pouvez déterminer là où les fichiers du launcher<br />et des instances de jeux seront installées</h4>
            </div>
        </div>
    )
}
