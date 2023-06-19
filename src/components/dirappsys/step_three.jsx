import { useState } from 'react'
import FzToast from '../FzToast'
import FzVariable from '../FzVariable'
import { ipcRenderer } from 'electron'
const fzVariable = new FzVariable()
export default function DACStepThree({ oldDirApp, dirApp, nextStep }) {

    const [processing, setProcessing] = useState(false)

    function deleteOldDirApp(bool) {
        setProcessing(true)
        if (bool) fzVariable.fs.rmdirSync(oldDirApp, { recursive: true, force: true })
        fzVariable.store.set('launcher__dirapp_path', dirApp)
        ipcRenderer.send('indexApp')
    }

    document.querySelector('.body .sidebar').classList.add('hidden_protect')
    document.querySelector('.main.connected').classList.add('hidden_protect')

    return (
        <div className='flex flex-col gap-6 mt-10'>
            <h4>
                Nous avons terminé la copie de votre ancien dossier FzLauncher.<br />
                Souhaitez-vous supprimer l'ancien dossier ({oldDirApp}) ?
            </h4>
            {!processing &&
                <div className="flex items-center gap-6 ">
                    <a href="#" onClick={() => { deleteOldDirApp(false) }} className='inactive'>Non, laisser le dossier</a>
                    <button onClick={() => { deleteOldDirApp(true) }} className='btn tiny'>Oui, supprimer</button>
                </div>
            }
            {processing &&
                <>
                    <h4>Veuillez patienter..</h4>
                </>
            }
        </div>
    )

}