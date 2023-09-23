import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import { Radio, Label } from "flowbite-react";
import { FaSave, FaTimes } from "react-icons/fa";
import Brush from "../assets/img/icons/brush.svg";

function FzEditSkinDialog(props) {
  let skin = props.dataSkin;

  const [isOpen, setIsOpen] = useState(false);
  const [modelSkin, setModelSkin] = useState(skin.model);

  const openImgEditor = () => {
    setIsImgEditorShown(true);
  };

  const closeImgEditor = () => {
    setIsImgEditorShown(false);
  };

  let fcp = props.fcp;

  let types = [
    {
      key: "steve",
      display: "Steve",
    },
    {
      key: "alex",
      display: "Alex",
    },
  ];

  function closeModal() {
    setIsOpen(false);
  }

  async function openModal() {
    await setIsOpen(true);
  }

  console.log(skin.base64)

  return (
    <>
      <button onClick={openModal} className="btn icon">
        <img src={Brush} alt="" />
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className=" fixed inset-0 z-10 overflow-y-auto"
          onClose={() => {}}
        >
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur"
            aria-hidden="true"
          />
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div
                style={{ position: "relative", top: "-8rem" }}
                className="importSkinDialog inline-block w-7/12 transition-all p-10 text-white transform bg-[var(--fzbg-4)] shadow-xl rounded-2xl"
              >
                <div className="flex flex-col gap-[1rem]">
                  <div className="head">
                    <h2 className="titleDialog">Édition du skin</h2>
                    <span onClick={closeModal}>
                      <FaTimes />
                    </span>
                  </div>
                  <div className="flex gap-[40px] align-center justify-between actions">
                    <input
                      type="text"
                      id="nameSkinInput"
                      className="w-full"
                      name="nameSkinInput"
                      defaultValue={skin.name}
                      placeholder="Nom du skin"
                    />
                    <fieldset
                      className="flex align-center justify-center gap-4 w-9/12"
                      id="radio"
                    >
                      <legend>Choisir le type du skin</legend>
                      <div className="flex align-center items-center gap-2">
                        <Radio
                          id="steve"
                          name="typeSkin"
                          value="steve"
                          checked={modelSkin === "steve"}
                          onChange={(e) => {
                            setModelSkin(e.target.value);
                          }}
                        />
                        <Label className="mb-0" htmlFor="steve">
                          Steve
                        </Label>
                      </div>
                      <div className="flex align-center items-center gap-2">
                        <Radio
                          id="alex"
                          name="typeSkin"
                          value="alex"
                          checked={modelSkin === "alex"}
                          onChange={(e) => {
                            setModelSkin(e.target.value);
                          }}
                        />
                        <Label className="mb-0" htmlFor="alex">
                          Alex
                        </Label>
                      </div>
                    </fieldset>
                    <div className="actions">
                      <button
                        className="btn icon"
                        onClick={() => {
                          let name =
                            document.querySelector("#nameSkinInput").value;
                          let model = document.querySelector(
                            'input[type="radio"][name="typeSkin"]:checked'
                          ).value;
                          fcp
                            .saveSkin({ id: skin.id, name: name, model: model })
                            .then(() => {
                              closeModal();
                            });
                        }}
                      >
                        <FaSave />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default FzEditSkinDialog;
