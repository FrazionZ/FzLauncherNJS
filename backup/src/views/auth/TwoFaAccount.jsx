import React, { useState, useRef } from "react"
import AuthCode from "react-auth-code-input"
import { RiLoader4Fill } from "react-icons/ri"
import FzToast from "../../components/FzToast"

export default function TwoFaAccount(props) {

  const [disabledForm, setDisabledForm] = useState(false);
  const [typeCode, setTypeCode] = useState(0);
  const [result, setResult] = useState();


  let parentClass = props.parentClass;
  parentClass.setTitle("Verrouillage 2FA");
  parentClass.setAllowBackHL(props.allowBackHL);

  let log2FA = JSON.parse(sessionStorage.getItem("log2FA"));
  log2FA.up = Buffer(log2FA.up, "base64").toString();

  const switchTypeCode = (type) => {
    if(disabledForm) return;
    setResult(null)
    setTypeCode(type)
  }

  const handleOnChangeBackup = (e) => {
    setResult(e.target.value)
  }

  const handleOnChange = (res) => {
    setResult(res);
    if(res !== undefined)
      if(res.length == 6)
        handleClick(res)
  };

  async function handleClick(code) {
    let codeRes = (code !== undefined) ? code : result
    setDisabledForm(true);
    FzToast.processToast(
      "Connexion en cours..",
      parentClass.auth.addAccount(log2FA.ue, log2FA.up, codeRes, typeCode, true),
      (data) => {
        sessionStorage.removeItem("log2FA");
        sessionStorage.setItem("user", JSON.stringify(data.user));
        parentClass.appRouter.showPage("/connected");
        return `Vous êtes connectés ! Welcome ${data.user.username}`;
      },
      (data) => {
        setDisabledForm(false);
        return `${data.msg}`;
      }
    );
  }

  return (
    <>
      <div className="flex mt-40 justify-center items-center flex-col gap-6 2FA">
        <div className="flex flex-col gap-4">
          {typeCode == 0 && 
            <>
              <h2 className="text-xl">Entrez le code à deux facteurs</h2>
                <AuthCode
                  autoFocus={true}
                  containerClassName="flex gap-10"
                  disabled={disabledForm}
                  allowedCharacters="numeric"
                  onChange={handleOnChange}
                />
            </>
          }
          {typeCode == 1 &&
            <>
                <h2 className="text-xl">Entrez l'un de vos codes de secours</h2>
                <input type="text" disabled={disabledForm} onChange={(e) => { handleOnChangeBackup(e) }} />
            </>
          }
          <span className="cursor-pointer flex justify-center my-4 text-lg text-[var(--color-2)]" onClick={() => { switchTypeCode(typeCode == 0 ? 1 : 0) }}>
              Utiliser {typeCode == 0 ? "l'un des codes de secours" : "le code 2FA"}</span>
        </div>
        <button
          id="buttonLoginAuth"
          disabled={disabledForm}
          className="btn w-fit"
          onClick={() => { handleClick(result) }}
        >
          <RiLoader4Fill className="icon animate-spin hidden" />
          Vérifier le code
        </button>
      </div>
    </>
  );
}
