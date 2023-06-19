import React, { useState } from 'react'
import FzVariable from '../components/FzVariable'
import { ipcRenderer } from 'electron'
import { FaSearch } from 'react-icons/fa'
const fzVariable = new FzVariable()


export default function DirApp(props) {

    const dirAppPathDefault = process.env['APPDATA'] + '\\.FrazionzLauncher'
    const [dirApp, setDirApp] = useState(dirAppPathDefault)
    const router = props.appRouter
    
    ipcRenderer.removeAllListeners()

    function selectDirectory() {
        ipcRenderer.send('openDir')
        ipcRenderer.on('openDirResult', (event, path) => {
            if(path.length > 0)
                setDirApp(path)  
        })
    }

    function submitDirApp() {
        fzVariable.store.set('launcher__dirapp_path', dirApp[0])
        router.showPage('/runtime')
    }

    return (
        <div className="fz-h-100 flex flex-col gap-30 p-20">
            <div className="flex flex-col gap-3">
                <h2 className='text-white text-2xl font-semibold'>Chemin d'installation de FrazionZ Launcher</h2>
                <h4 className='text-[var(--text-inactive)] text-lg font-medium'>Vous pouvez déterminer là où les fichiers du launcher<br />et des instances de jeux seront installées</h4>
            </div>
            <div className="flex gap-4">
                <input type="text" className='flex-1' value={dirApp} onChange={() => {}} disabled />
                <button className='btn icon w-20' onClick={selectDirectory} ><FaSearch /></button>
            </div>
            <button className="w-fit" onClick={submitDirApp}>Valider</button>
        </div>
    )
}
