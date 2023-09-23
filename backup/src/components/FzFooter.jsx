const { shell, ipcRenderer } = require('electron')
import Discord from '../assets/img/icons/network/discord'
import Insta from '../assets/img/icons/network/insta'
import Tiktok from '../assets/img/icons/network/tiktok'
import Twitter from '../assets/img/icons/network/twitter'
import Youtube from '../assets/img/icons/network/youtube'

export default function FzFooter({ sideRouter }) {


    return (
        <div className="mt-12">
            <div className="flex gap-15 justif-center">
                <a onClick={() => { shell.openExternal('https://discord.gg/sSf7NCs8Ap') }} className="social flex justify-center items-center">
                    <Discord />
                </a>
                <a onClick={() => { shell.openExternal('https://www.instagram.com/frazionz/') }} className="social flex justify-center items-center">
                    <Insta />
                </a>
                <a onClick={() => { shell.openExternal('https://twitter.com/frazionz/') }} className="social flex justify-center items-center">
                    <Twitter />
                </a>
                <a onClick={() => { shell.openExternal('https://www.tiktok.com/@frazionz') }} className="social flex justify-center items-center">
                    <Tiktok />
                </a>
                <a onClick={() => { shell.openExternal('https://www.youtube.com/@frazionz533') }} className="social flex justify-center items-center">
                    <Youtube />
                </a>
            </div>
            <div className="credits">
                <span>Réalisé par <a href="#" onClick={() => { shell.openExternal('https://twitter.com/SunshineDev62') }} >SunshineDev</a> - Non affilié à Mojang AB</span>
                <span>
                    © 2022 FrazionZ. Tous droits réservés - <a href="#" onClick={() => { sideRouter.showPage('/cguv') }}>Conditions Générales</a>
                </span>
            </div>
        </div>

    )


}