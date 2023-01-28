import React from "react";
import FzToast from "../../components/FzToast";

export default function VerifyAccount(props) {
  
  let parentClass = props.parentClass;
  let appRouter = props.appRouter;
  parentClass.setTitle("Frazionz");
  parentClass.setAllowBackHL(props.allowBackHL);

  const verifySession = parentClass.auth.verifySession(parentClass.fzVariable.store.get("session"));
  FzToast.processToast(
    "Vérification de la session en cours",
    verifySession,
    (data) => {
      sessionStorage.setItem("user", JSON.stringify(data.user));
      appRouter.showPage("/connected");
      return parentClass.fzVariable.lang("logging.result.logged", [
        { key: "%session__name%", value: data.user.username },
      ]);
    },
    (data) => {
      parentClass.router.showPage('/addAccount')
      return `${data.msg}`;
    }
  );

  return (
    <div className="verifyAccount flex align-center justify-center h-[inherit]">
      <div className="flex items-center justify-center gap-30">
        <div className="loader-3"></div>
        <div className="flex flex-col">
          <h6 id="downloadhtml" className="text-xl">
            Authentification en cours..
          </h6>
          <h5 id="downloadpercent" className="text-base">
            Préparation de la session
          </h5>
        </div>
      </div>
    </div>
  );
}
