import { ipcRenderer } from 'electron'
import FzVariable from '../components/FzVariable'
import { useState } from 'react'
import DACStepOne from '../components/dirappsys/step_one'
import DACStepTwo from '../components/dirappsys/step_two'
import DACStepThree from '../components/dirappsys/step_three'
const fzVariable = new FzVariable()

export default function DirAppChanger(props) {

    const oldDirApp = fzVariable.store.get('launcher__dirapp_path', 'Err');
    const [dirApp, setDirApp] = useState(fzVariable.store.get('launcher__dirapp_path', 'Err'))
    const [stepper, setStepper] = useState(0)
    const router = props.appRouter

    ipcRenderer.removeAllListeners()

    function selectDirectory() {
        ipcRenderer.send('openDir')
        ipcRenderer.on('openDirResult', (event, path) => {
            if (path.length > 0)
                setDirApp(path[0])
        })
    }

    const steps = [
        {
            comp: <DACStepOne oldDirApp={oldDirApp} dirApp={dirApp} nextStep={nextStep} selectDirectory={selectDirectory} />,
            title: "Pour commencer, veuillez séléctionner le dossier de destination"
        },
        {
            comp: <DACStepTwo oldDirApp={oldDirApp} dirApp={dirApp} nextStep={nextStep} />,
            title: "Nous y sommes presque, on copie tout ça"
        },
        {
            comp: <DACStepThree oldDirApp={oldDirApp} dirApp={dirApp} nextStep={nextStep} />,
            title: "Petite question avant de redémarrer 👀"
        }
    ]

    

    function nextStep() {
        setStepper(stepper + 1)
    }

    return (
        <>
            <div className="dirapp dirapp_changer modal_fullpage flex flex-col gap-[1.5rem] py-16 mb-6 h-full">
                <div className="head justify-between">
                    <h1>Changement du dossier d'application</h1>
                    <h3 className="text-[var(--text-inactive)]">{steps[stepper].title}</h3>
                </div>
                <div className="flex gap-3 flex-col">
                    {steps[stepper].comp}
                </div>
            </div>
        </>
    )

}