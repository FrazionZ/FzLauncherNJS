import React, { useState } from "react";
import AuthCode from "react-auth-code-input";
import { RiLoader4Fill } from "react-icons/ri";
import FzToast from "../../components/FzToast";
import axios from "axios"

export default function PasswordForget(props) {

  const [disabledForm, setDisabledForm] = useState(false);

  let parentClass = props.parentClass;
  parentClass.setTitle("Mot de passe oublié ?");
  parentClass.setAllowBackHL(props.allowBackHL);

  async function handleClick() {
    setDisabledForm(true);
    let email = document.querySelector('#email-address').value
    const resetPasswordRequest = async () => {
        return new Promise((resolve, reject) => {
            if (email == '') return reject({ msg: parentClass.fzVariable.lang('logging.result.empty'), twofa: false })
            axios
            .post('https://dev.frazionz.net/api/resetpwd', {
                email: email
            })
            .then((response) => {
                console.log(response)
                parentClass.router.showPage('/addAccount')
                resolve(response.data)
            })
            .catch((err) => {
                if (err.response) return reject({ msg: err.response.data.message })
                reject({ msg: err })
            })
        })
    }
    try {
        FzToast.processToast(
            'Envoie du mail de demande de mot de passe..',
            resetPasswordRequest,
            (data) => {
              if (data.result == 'success') {
                  return 'Vous avez reçus un mail de FrazionZ.'
              }
            },
            (data) => {
              return `${data.msg}`
            }
        )
    }catch(e){
        console.log(e)
    }
  }

  return (
    <>
      <div className="flex mt-40 justify-center flex-col gap-6">
        <div className="flex flex-col gap-4 w-full">
          <label htmlFor="email-address" className="text-white">
            Adresse Mail
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Adresse Mail"
            disabled={disabledForm}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleClick();
            }}
            defaultValue={parentClass.fzVariable.store.get("lastEmail", "")}
          />
        </div>
        <button
          id="buttonLoginAuth"
          disabled={disabledForm}
          className="btn w-fit"
          onClick={handleClick}
        >
          <RiLoader4Fill className="icon animate-spin hidden" />
          Envoyer
        </button>
      </div>
    </>
  );
}
