import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
const fs = require('fs'),
    path = require('path'),
    StringBuilder = require("string-builder"),
    readline = require('readline')

class CrashGame extends React.Component {

    state = {
        isOpen: false
    }

    constructor(props) {
        super(props)
        this.closeModal = this.closeModal.bind(this)
        ipcRenderer.on('endSessionGame', async (event, args) => {
            if (args.code !== undefined) {
                if (args.code > 0) {
                    var dirCrashReports = path.join(props.dirServer, "crash-reports");
                    if (!fs.existsSync(dirCrashReports))
                        fs.mkdirSync(dirCrashReports)
                    var lastCrashReports = await this.getMostRecentFileName(dirCrashReports);
                    let pathLCR = undefined;
                    if (lastCrashReports !== -Infinity)
                        pathLCR = path.join(dirCrashReports, lastCrashReports).replaceAll('\\', '/').toString('base64');
                    
                    
                    this.processLineByLine(pathLCR).then((result) => {
                        this.fileCrash = result;
                        this.openModal()
                    });
                }
            }
        })
    }

    closeModal() {
        this.setState({ isOpen: false });
    }

    openModal() {
        this.setState({ isOpen: true });
    }

    async processLineByLine(pathCrashReport) {
        const fileStream = fs.createReadStream(pathCrashReport);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        const sb = new StringBuilder();
        for await (const line of rl)
            sb.appendLine(line+'<br />')
        
        return sb.toString()
    }

    async getMostRecentFileName(dir) {
        var fs = require('fs'),
            path = require('path'),
            _ = require('underscore');
        var files = fs.readdirSync(dir);
    
        // use underscore for max()
        return _.max(files, function (f) {
            var fullpath = path.join(dir, f);
    
            // ctime = creation time is used
            // replace with mtime for modification time
            return fs.statSync(fullpath).ctime;
        });
    }

    render() {
        return (
            <>
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
                                    <h2 className="text-2xl">Crash du jeu</h2>
                                    <p style={{ marginTop: "18px", wordBreak: "break-word", fontSize: "15px", overflowY: "auto", height: "23rem" }} dangerouslySetInnerHTML={{ __html: this.fileCrash }}></p>
                                </div>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition>
            </>
        )
    }

}

export default CrashGame;