import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import MojangLogo from '../assets/img/icons/mojang.png'
import { RxMagnifyingGlass } from 'react-icons/rx';
import { FaFileImport, FaTimes } from "react-icons/fa";

function FzImportationSkinDialog(props) {

    const [isOpen, setIsOpen] = useState(false);
    const [inputImport, setInputImport] = useState(false);

    function closeModal() {
        if(!inputImport) setIsOpen(false);
    }

    async function openModal() {
        await setIsOpen(true);
    }

    async function disabledImport(bool) {
        await setInputImport(bool);
    }

    return (
        <>
            <button
                onClick={openModal}
                className="btn"
            >
                Importer
            </button>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-10 overflow-y-auto"
                    onClose={ () => {}}
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur" aria-hidden="true" />
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
                            <div className="importSkinDialog inline-block w-9/12 transition-all p-10  text-white transform bg-[var(--fzbg-4)] shadow-xl rounded-2xl">
                                <div className="head">
                                    <h2 className="titleDialog">Importation de Skins</h2>
                                    <span onClick={closeModal}><FaTimes /></span>
                                </div>
                                <div className="flex actions gap-[3rem]">
                                    <div className="mojang w-full">
                                        <div className="titles">
                                            <img src={MojangLogo} alt="icon_mojang" />
                                            <div>Mojang Studio</div>
                                        </div>
                                        <div className="flex justif-between gap-30 align-center">
                                            <div className="column w-100">
                                                <input type="text" disabled={ inputImport } id="searchSkinInput" className="w-full" name="searchSkinInput" placeholder="Entrez un pseudo Mojang" onKeyDown={ (e) => { 
                                                    if(e.key == 'Enter'){
                                                        disabledImport(true)
                                                        props.fcp.addSkinFromMojang(event, document.querySelector('.mojang #searchSkinInput')).then((res) =>  {
                                                            disabledImport(false)
                                                            if(res) closeModal()
                                                        })
                                                    }
                                                 }} />
                                            </div>
                                            <div className="column">
                                                <button className="searchSkinMojang btn icon" disabled={ inputImport } onClick={ (event) => { 
                                                    disabledImport(true)
                                                    props.fcp.addSkinFromMojang(event, document.querySelector('.mojang #searchSkinInput')).then((res) =>  {
                                                        disabledImport(false)
                                                        if(res) closeModal()
                                                    })
                                                }}><RxMagnifyingGlass /></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="files w-full">
                                        <div className="titles">
                                            <FaFileImport />
                                            <div>Fichier Skin</div>
                                        </div>
                                        <div className="flex justif-between gap-30 align-center">
                                            <div className="column w-100">
                                                <label className="file-upload" disabled={ inputImport }>
                                                    <input disabled={ inputImport } onChange={ (event) => {
                                                        disabledImport(true)
                                                        props.fcp.uploadFileToLauncher(event).then((result) => {
                                                            if(result){
                                                                props.fcp.addSkinFromFile(event, document.querySelector('.files #fileSkinInput')).then((res) =>  {
                                                                    disabledImport(false)
                                                                    if(res) closeModal()
                                                                })
                                                            }else disabledImport(false)
                                                        })
                                                    }} type="file" className="profile-skin custom-file-input w-full" id="fileSkinInput" name="skin" accept=".png" required />
                                                    <span>Choisir un fichier</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default FzImportationSkinDialog;