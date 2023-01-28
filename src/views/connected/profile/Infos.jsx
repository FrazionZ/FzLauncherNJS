import React from "react";

export default function Infos(props) {
    
  let session = props.session;

  return (
    <div className="column w-full flex flex-col gap-5">
      <div className="card">
        <div className="card-body">
          <div className="flex align-center gap-5">
            <span className="text-xl font-bold">Adresse Mail</span>
            <span className="text-xl font-light">{session.email}</span>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="flex align-center gap-5">
            <span className="text-xl font-bold">Points boutique</span>
            <span className="text-xl font-light">{session.money}</span>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="flex align-center gap-5">
            <span className="text-xl font-bold">Faction</span>
            <span className="text-xl font-light">Soon :)</span>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="flex align-center gap-5">
            <span className="text-xl font-bold">Compte créé le</span>
            <span className="text-xl font-light">{session.created_at}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
