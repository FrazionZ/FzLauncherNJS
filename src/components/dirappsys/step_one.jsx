import { FaSearch } from 'react-icons/fa'
import FzVariable from '../FzVariable'
import FzToast from '../FzToast'
const fzVariable = new FzVariable()

export default function DACStepOne({ oldDirApp, dirApp, selectDirectory, nextStep }) {

    function stepOneSubmit() {
        if(fzVariable.store.get('launcher__dirapp_path', 'err') == dirApp) return FzToast.error('Vous devez choisir un nouveau dossier')
        if(fzVariable.fs.readdirSync(dirApp).length > 0) return FzToast.error('Le dossier n\'est pas vide.')
        nextStep()
    }

    return (
        <>
            <div className="flex gap-4">
                <input type="text" className='flex-1' value={dirApp} onChange={() => { }} disabled />
                <button className='btn icon w-20' onClick={selectDirectory} ><FaSearch /></button>
            </div>
            <button className="w-fit" onClick={stepOneSubmit}>Valider</button>
        </>
    )

}