import React, { useState, useRef } from "react"
import AuthCode from "react-auth-code-input"
import { RiLoader4Fill } from "react-icons/ri"
import FzToast from "../../components/FzToast"

export default function TwoFaAccount(props) {

  const [disabledForm, setDisabledForm] = useState(false);
  const [result, setResult] = useState();


  let parentClass = props.parentClass;
  parentClass.setTitle("Verrouillage 2FA");
  parentClass.setAllowBackHL(props.allowBackHL);

  let log2FA = JSON.parse(sessionStorage.getItem("log2FA"));
  log2FA.up = Buffer(log2FA.up, "base64").toString();

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
      parentClass.auth.addAccount(log2FA.ue, log2FA.up, codeRes, true),
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
          <h2 className="text-xl">Entrez le code à deux facteurs</h2>
          <AuthCode
            autoFocus={true}
            containerClassName="flex gap-10"
            disabled={disabledForm}
            allowedCharacters="numeric"
            onChange={handleOnChange}
          />
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
