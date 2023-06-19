import fs from 'fs'
import path from 'path'
import FzVariable from '../FzVariable'
import Alert from '../Alert'
import { useState } from 'react'
const fzVariable = new FzVariable()
export default function DACStepTwo({ oldDirApp, dirApp, nextStep }) {

    const copyDir = oldDirApp
    const [started, setStarted] = useState(false)
    const [nbFiles, setNbFiles] = useState(-1)
    const [filesCopied, setFilesCopied] = useState([])

    var walk = function(dir, done) {
        const pathParent = dir
        var results = [];
        fs.readdir(dir, function(err, list) {
          if (err) return done(err);
          var i = 0;
          (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
              if (stat && stat.isDirectory()) {
                walk(file, function(err, res) {
                  results = results.concat(res);
                  next();
                });
              } else {
                results.push({ file: file, path: file.replace(copyDir, '')});
                next();
              }
            });
          })();
        });
    };

    if(!started)
        walk(copyDir, async function(err, results) {
            if (err) throw err;
            setStarted(true)
            setNbFiles(results.length)
            for await (const f of results) {
                const copyFile = (f) => {
                    return new Promise((resolve, reject) => {
                        const newFile = path.join(dirApp, f.path)
                        fs.cp(f.file, newFile, (err) => {
                            if(err) return;
                            setFilesCopied(filesCopied => [...filesCopied, newFile]);
                            resolve()
                        });
                    })
                }
                await copyFile(f)
            }
            nextStep()
        });

    

    document.querySelector('.body .sidebar').classList.add('hidden_protect')
    document.querySelector('.main.connected').classList.add('hidden_protect')

    return (
        <>
            <Alert state="infos" message="Le launcher redémarrera lorsque le processus sera terminé" />
            <div className="flex gap-6 items-center w-full justify-center h-48">
                <div className="loader-3"></div>
                <div className="flex flex-col">
                    <h6 id="downloadhtml" className="text-xl">
                        {nbFiles == -1 ? "Récupération des fichiers en cours" : "Copie des fichiers en cours.."}
                    </h6>
                    <h5 id="downloadpercent" className="text-[var(--text-inactive)]">
                        Veuillez ne pas fermer le launcher.
                    </h5>
                </div>
            </div>
            {nbFiles !== -1 && 
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                        <h4 className='text-[var(--text-inactive)]'><span className="text-lg text-white">{filesCopied.length}</span><br/>Fichier(s) copié(s) sur {nbFiles}</h4>
                        <h3>{parseInt((100 * filesCopied.length) / nbFiles) + `%`}</h3>
                    </div>
                    <div className="progress  w-100">
                        <div
                        className="indicator"
                        id="downloadbar"
                        style={{ width: (100 * filesCopied.length) / nbFiles + `%` }}
                        ></div>
                    </div>
                </div>
            }
            
        </>
    )

}