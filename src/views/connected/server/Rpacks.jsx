import React from 'react'
import FzVariable from '../../../components/FzVariable';
import FzToast from '../../../components/FzToast'
const { shell } = require('electron');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid')
const axios = require('axios').default;
let fzVariable;
import Alert from '../../../components/Alert'
import Loader from '../../../components/Loader'
import RpackDetails from '../../../components/RpackDetails';

import { FaTrash, FaDownload } from 'react-icons/fa'

let fp;

const SkeletonRPack = () => {
    return (
        <div className="skeleton">
            <div className="card rpack gap-15 black-4 mt-30 mb-30" style={{ border: "none" }}>
                <div className="card-body">
                    <div className="flex gap-30">
                        <div className="column bone icon"></div>
                        <div className="column flex direct-column justif-between w-100">
                            <div className="bone" id="rpack__name"></div>
                            <div className="bone" id="rpack__description"></div>
                            <div className="bone" id="rpack__author"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

class Rpacks extends React.Component {

    state = {
        rpacks: [],
        response: [],
        error: false,
        loading: false,
        disabledActionGame: sessionStorage.getItem('gameLaunched') == "true"
    };

    determineRpackState = (id) => {
        switch(id){
            case 0:
                return {id: 0, icon: <FaDownload /> }
            case 1:
                return {id: 1, icon: <FaTrash /> }
            case 2:
                return {id: 1, icon: <FaDownload /> }
            default:
                return {id: -1, icon: <FaDownload /> }
        }
    }

    ServerObj = null;

    constructor(props) {
        super(props);
        this.ServerObj = props.serverObj;
        fp = props.fp;
        fzVariable = new FzVariable(props.serverObj)
        this.resourcePackPath = fzVariable.path.join(this.ServerObj.dirServer, "resourcepacks");
        if(!fzVariable.fs.existsSync(this.resourcePackPath))
            fzVariable.fs.mkdirSync(this.resourcePackPath)
        this.handleClickRpack = this.handleClickRpack.bind(this);

        document.addEventListener('server_config_disabledActionGame', (event) => {
            let serverObjEvent = event.detail.serverObj;
            if (serverObjEvent.id == this.ServerObj.id) {
              this.setState({ disabledActionGame: event.detail.disabled })
            }
        })
    }

    async handleClickRpack(button){
        if(sessionStorage.getItem('gameLaunched') == "true") return FzToast.error(fzVariable.lang('server.instance.open.error'));
        let buttonTarget = button.currentTarget;
        if(buttonTarget.disabled) return;
        buttonTarget.disabled = true;
        let idPack =buttonTarget.getAttribute('id-pack')
        let state = buttonTarget.getAttribute('state-pack')
        let rpack = this.state.response.find(element => element.id == idPack);
        switch(parseInt(rpack.state.id)){
            case 0:
                this.downloadPack(this, rpack, false).then((response) => {
                    this.state.response.find(element => element.id == idPack).state = this.determineRpackState(1)
                    this.forceUpdate()
                    buttonTarget.disabled = false
                }).catch((err) => {
                    console.log(err)
                })
                break;
            case 1:
                this.deletePack(rpack.pathFile).then((response) => {
                    this.state.response.find(element => element.id == idPack).state = this.determineRpackState(0)
                    this.forceUpdate()
                    buttonTarget.disabled = false
                }).catch((err) => {
                    console.log(err)
                })
                break;
        }
    }

    async getAllContracts() {
        this.setState({ allContracts: [], loading: true, error: false });
        try {
            axios.get(`https://api.frazionz.net/faction/rpacks/all`).then(async (response) => {
                let rpacks = response.data;
                let i = 0;
                for await (const rpack of rpacks){
                    rpacks[i].state = this.determineRpackState(0);
                    var pathFile = fzVariable.path.join(this.resourcePackPath, rpack.name.replaceAll(' ', '_').toLowerCase()+".zip");
                    var packExist = fzVariable.fs.existsSync(pathFile);
                    if(packExist){
                        var fsFile = fzVariable.fs.readFileSync(pathFile);
                        var sha1sum = crypto.createHash('sha1').update(fsFile).digest("hex");
                        if(sha1sum == rpack.sha1) {
                            rpacks[i].state = this.determineRpackState(1);
                        } else {
                            rpacks[i].state = this.determineRpackState(2);
                        }
                    }
                    i++;
                }

                this.state.rpacks = rpacks;

                this.setState({ response: rpacks, loading: false, error: false, });
                return;
            }).catch((err) => {
                console.log(err)
                this.setState({ allContracts: [], response: undefined, loading: false, error: true });
                return;
            });
        } catch (error) {
            this.setState({ allContracts: [], loading: false, error: true });
            return;
        } finally {
            this.setState({ allContracts: [], loading: false, error: false });
            return;
        }
    }


    async componentDidMount() {
        await this.getAllContracts();
    }

    async downloadPack(instance, rpack, isUpdate){
        return new Promise((resolve, reject) => {
            
            this.downloadCurrentExist = true;
            var exist = fzVariable.fs.existsSync(fzVariable.path.join(this.ServerObj.dirServer, "resourcepacks"));
            if(!exist){
                FzToast.error('Impossible de télécharger le pack, le dossier cible n\'existe pas.');
                return resolve("Dir not exist");
            }
            
            var uuidDl = uuidv4();
            fp.AddTaskInQueue({
                type: 0,
                uuidDl: uuidDl,
                installerfileURL: "https://frazionz.net/storage/rpacks/"+rpack.uid+"/pack.zip",
                installerfilename: rpack.pathFile,
                prefix: "Resources Pack",
                lastTask: true
            }).then((result) => {
                FzToast.success('Le pack a bien été '+((isUpdate) ? "mis à jour" : "téléchargé"))
                return resolve(result);
            }).catch((err) => {
                return resolve(err);
            })
        });
    }

    async deletePack(dir){
        return new Promise((resolve, reject) => {
            fzVariable.fs.unlink(dir, (err) => {
                if(err) return FzToast.error(err);
                FzToast.success('Le pack a bien été supprimé')
                resolve()
            });
        });
    }

    render() {

        const { error, loading, allContracts, response } = this.state;

        if (loading) {
            SkeletonRPack()
        }

        if (error) {
            return <Alert state="error" message="Something went wrong" />
        }

        if (typeof response == undefined) return SkeletonRPack();

        else {
            return (
                <div className="rpack">
                    <h2 className="underline">{fzVariable.lang("server.rpacks.title")}</h2>
                    <span className="text-[var(--text-inactive)]">{fzVariable.lang("server.rpacks.staff")}</span><br /><br />
                    <div className="flex gap-20">
                        <a onClick={ () => { shell.openPath(this.resourcePackPath); } } className="btn openPathPack">Ouvrir le dossier</a>
                    </div>
                    <div className="flex direct-column gap-[15px] mt-[2rem]">
                        {response.map((rpack, i) => {
                            var dirPacks = "resourcepacks/"+rpack.name.replaceAll(' ', '_').toLowerCase()+".zip";
                            var pathFile = fzVariable.path.join(this.ServerObj.dirServer, dirPacks);
                            rpack.pathFile = pathFile;
                            return (
                                <div key={ i } className="card rpack gap-15 bg-[var(--fzbg-2)]">
                                    <div className="card-body">
                                        <div className="flex gap-30">
                                            <div className="column">
                                                <img src={`https://frazionz.net/storage/rpacks/${ rpack.uid }/icon.png`} id="rpack__icon" className="icon" alt="rpack" />
                                            </div>
                                            <div className="column flex direct-column justif-around w-100">
                                                <div id="rpack__name">{ rpack.name }</div>
                                                <div id="rpack__description">{ rpack.description.substring(0,90)+"..." }</div>
                                                <div id="rpack__author">{ rpack.author }</div>
                                            </div>
                                            <div className="column flex direct-column gap-15 align-end">
                                                <RpackDetails rpack={ rpack } />
                                                <button id="rpack__action" disabled={ this.state.disabledActionGame } onClick={ this.handleClickRpack } id-pack={ rpack.id } state-pack={ rpack.state.id } className="btn">
                                                    { rpack.state.icon }
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )

        }
    }



}

export default Rpacks;