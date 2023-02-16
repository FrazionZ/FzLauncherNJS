import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import { FaEye } from 'react-icons/fa'
import FzVariable from "./FzVariable";
const fzVariable = new FzVariable();
class RpackDetails extends React.Component {

    state = {
        isOpen: false
    }

    constructor(props) {
        super(props)
        this.closeModal = this.closeModal.bind(this)
        this.openModal = this.openModal.bind(this)
        this.rpack = props.rpack
    }

    closeModal() {
        this.setState({ isOpen: false });
    }

    openModal() {
        console.log(this.rpack)
        this.setState({ isOpen: true });
    }

    render() {
        return (
            <>
                <button id="rpack__view" disabled={true} onClick={this.openModal} className="btn">
                    <FaEye />
                </button>
                <Transition appear show={this.state.isOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        className="fixed inset-0 z-10 overflow-y-auto"
                        onClose={this.closeModal}
                    >
                        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
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
                                <div className="inline-block overflow-hidden text-left align-middle transition-all transform bg-[var(--fzbg-2)] p-5 text-white shadow-xl rounded-2xl">
                                    <h2 className="text-2xl">Rpack Details</h2>
                                    <div className="flex justif-between align-center">
                                        <h2 className="pt-30 pb-10 underline">{fzVariable.lang("server.rpacks.title")} - {this.rpack.name}</h2>
                                        <span className="dialog_close"><i className="fa-solid fa-xmark"></i></span>
                                    </div>
                                    <h6>{fzVariable.lang("server.rpacks.author").replace("%author__name%", this.rpack.author)}</h6><br />
                                    <h4 className="reset-mp">Description</h4>
                                    <span>{this.rpack.description}</span><br /><br />
                                    <h4 className="reset-mp">Exemples</h4>
                                    <div className="screens">
                                        <Slide slidesToScroll={1} slidesToShow={1} indicators={true} autoplay={false}>
                                            <div style={{
                                                textAlign: 'center',
                                                background: 'red',
                                                padding: '200px 0',
                                                fontSize: '30px'
                                            }}>First Slide</div>
                                            <div style={{
                                                textAlign: 'center',
                                                background: 'orange',
                                                padding: '200px 0',
                                                fontSize: '30px'
                                            }}>Second Slide</div>
                                            <div style={{
                                                textAlign: 'center',
                                                background: 'yellow',
                                                padding: '200px 0',
                                                fontSize: '30px'
                                            }}>Third Slide</div>
                                            <div style={{
                                                textAlign: 'center',
                                                background: 'green',
                                                padding: '200px 0',
                                                fontSize: '30px'
                                            }}>Fourth Slide</div>
                                            <div style={{
                                                textAlign: 'center',
                                                background: 'blue',
                                                padding: '200px 0',
                                                fontSize: '30px'
                                            }}>Sixth Slide</div>
                                            <div style={{
                                                textAlign: 'center',
                                                background: 'indigo',
                                                padding: '200px 0',
                                                fontSize: '30px'
                                            }}>Seventh Slide</div>
                                            <div style={{
                                                textAlign: 'center',
                                                background: 'violet',
                                                padding: '200px 0',
                                                fontSize: '30px'
                                            }}>Eight Slide</div>
                                        </Slide>
                                    </div>
                                </div>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition>
            </>
        )
    }

}

export default RpackDetails;