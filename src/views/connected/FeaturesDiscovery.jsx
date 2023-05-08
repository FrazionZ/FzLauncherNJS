import Logo from '../../assets/img/icons/fz_logo.svg'
import { useState } from 'react'
import FzVariable from '../../components/FzVariable'

export default function FeaturesDiscovery() {

    const fzVariable = new FzVariable()

    const features = [
        {
            title: "Bienvenue sur FrazionZ Launcher",
            subtitle: "Découvrons ensemble, les possibilités de ce Launcher !"
        },
        {
            title: "Les serveurs de jeu Minecraft",
            subtitle: "Notre launcher peut accueillir plusieurs serveurs. Le menu à gauche avec les logos représente les différents serveurs disponibles sur le Launcher ;)",
            domElem: '.sidebar #servers #nav_server_0'
        },
        {
            title: "Gestionnaire des tâches",
            subtitle: "Dans cet onglet, vous pouvez voir les tâches effectuées par le Launcher. Comme les téléchargements des resources packs ou des jeux !",
            domElem: '.sidebar #navs li[data-href="/tasks"]'
        },
        {
            title: "Paramètres Launcher",
            subtitle: "Via cette page, vous pouvez gérer la configuration de votre launcher, comme la langue, Discord RPC ou encore voir certaines infos liées à FrazionZ",
            domElem: '.sidebar #navs li[data-href="/settings"]'
        },
        {
            title: "Votre profil",
            subtitle: "Accédez à votre profil et gérez votre apparence de A à Z. Changez votre skin ou votre cape n'a jamais été aussi simple !",
            domElem: '.sidebar #navs li[data-href="/profile"]'
        }
    ]

    const [feature, setFeature] = useState(0)

    function nextFocus() {
        const featureCurrent = features[feature];
        let i = feature
        i += 1
        if(!(i >= features.length)){
            setFeature(i)
            const featureTarget = features[i];
            if(featureTarget.domElem !== null)
                document.querySelector(featureTarget.domElem).classList.add('featuresDiscovery', 'focus')
        }else{
            passGuid()
        }
        if(featureCurrent.domElem !== undefined)
            document.querySelector(featureCurrent.domElem).classList.remove('featuresDiscovery', 'focus')

    }

    function passGuid() {
        document.querySelector('.featuresDiscovery.dialog').remove()
        fzVariable.store.set('launcher__guide', true)
    }

    return (
        <div className="featuresDiscovery dialog open">
            <div className="infos">
                <img src={Logo} alt="logo" width={90} />
                <div className="block">
                    <div className="titles">
                        <h2 className="text-2xl text-right  text-white">{features[feature].title}</h2>
                        <h4 className="text-lg text-right text-[var(--text-inactive)] subtitle">{features[feature].subtitle}</h4>
                    </div>
                    <div className="flex gap-4 justify-between w-full">
                        <button className="btn tiny" onClick={passGuid}>Passer</button>
                        <button className="btn tiny" onClick={nextFocus}>Suivant</button>
                    </div>
                </div>
            </div>
        </div>
    )


}