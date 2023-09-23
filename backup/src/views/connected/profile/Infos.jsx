import React from "react";
import FzToast from "../../../components/FzToast";
import { HiOutlineLogout } from 'react-icons/hi'
import FzVariable from "../../../components/FzVariable";
import * as minecraftAuth from "minecraft-auth";
import { BsMicrosoft } from 'react-icons/bs'
import moment from 'moment-timezone'
import 'moment/locale/fr'  // without this line it didn't work
moment.locale('fr')

const MicrosoftAuth = minecraftAuth.MicrosoftAuth;

export default function Infos(props) {
    
  const session = props.session;
  const fzVariable = new FzVariable()

  let emailFormat = session.email.split('@'); 
  emailFormat = emailFormat[0].substr(0,3)+'*******@'+emailFormat[1];

  async function logout() {
    if(sessionStorage.getItem('gameLaunched') == "true") return FzToast.error(fzVariable.lang('server.instance.open.error'));
    props.parentClass.auth.logout(props.session.access_token).then(() => {
      sessionStorage.removeItem('user')
      props.parentClass.fzVariable.store.delete('session')
      props.parentClass.appRouter.showPage('/login')
      FzToast.success('Vous avez bien été déconnecté de votre session !')
    })
  }
  
  return (
    <div className="column w-full flex flex-col justify-center items-end gap-5">
      <div className="card w-full">
        <div className="card-body">
          <div className="flex align-center gap-5">
            <span className="text-xl font-bold">Adresse Mail</span>
            <span className="text-xl font-light"></span>
          </div>
        </div>
      </div>
      <div className="card w-full">
        <div className="card-body">
          <div className="flex align-center gap-5">
            <span className="text-xl font-bold">Points boutique</span>
            <span className="text-xl font-light">{session.money}</span>
          </div>
        </div>
      </div>
      <div className="card w-full">
        <div className="card-body">
          <div className="flex align-center gap-5">
            <span className="text-xl font-bold">Faction</span>
            <span className="text-xl font-light">Soon :)</span>
          </div>
        </div>
      </div>
      <div className="card w-full">
        <div className="card-body">
          <div className="flex align-center gap-5">
            <span className="text-xl font-bold">Compte créé le</span>
            <span className="text-xl font-light">{fzVariable.replaceMonth(moment(session.created_at).local("fr").tz("Europe/Paris").format('D MMMM YYYY'))}</span>
          </div>
        </div>
      </div>
      <button className="btn w-fit logout" onClick={ logout }><HiOutlineLogout /><span>Se déconnecter</span></button>
    </div>
  );
}
