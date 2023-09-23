import React, { useState, useRef } from "react"

import { BsMicrosoft } from "react-icons/bs"
import logo from '../../assets/img/dark/icons/top_fz.svg'
import { FaArrowRight } from "react-icons/fa"
export default function AddAccount(props) {

    let parentClass = props.parentClass
    parentClass.setAllowBackHL(props.allowBackHL)
    parentClass.setShowLogo(props.showLogo)
    parentClass.setTitle('Sélection d\'un profil (Demo)')

    const profiles = [
        {
            "type": "msa",
            "username": "PapyChauve",
            "id": "4a94f933615a4d0797810618ef798df7"
        },
        {
            "type": "fz",
            "username": "SunshineDev",
            "id": "c4f74368-5706-35ab-ab82-d73809f34f32"
        }
    ]

    return (
        <div className="flex flex-col gap-2">
            {profiles.map((profile, index) => {

                const avatar = profile.type == "msa" ? "https://crafthead.net/avatar/4a94f933615a4d0797810618ef798df7" : "https://auth.frazionz.net/skins/face.php?u=1"
                const iconType = profile.type == "msa" ? 
                                                <div className="flex items-center gap-1"><BsMicrosoft /> Microsoft</div> : 
                                                <div className="flex items-center gap-1"><img src={logo} width={14} height={14} alt="" /> FrazionZ</div>

                return (
                    <div key={index} style={{ padding: 12 }} className="card flex justify-between gap-4 items-center">
                        <div className="infos flex gap-4 items-center">
                            <img src={avatar} width={42} className="rounded-lg h-fit" alt="" />
                            <div className="flex flex-col flex-1">
                                <div className="username font-bold text-lg">{profile?.username}</div>
                                <div className="type text-sm">{iconType}</div>
                            </div>
                        </div>
                        <div className="actions">
                            <button className="btn icon tiny"><FaArrowRight /></button>
                        </div>
                    </div>
                )
            })}
        </div>
    )

}