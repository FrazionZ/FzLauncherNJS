import React from 'react'
import FzVariable from '../../../components/FzVariable';
const axios = require('axios').default;
import moment from 'moment-timezone'
import 'moment/locale/fr'  // without this line it didn't work
import Alert from '../../../components/Alert';
moment.locale('fr')
let fzVariable;

class Pnotes extends React.Component {


    state = {
        response: [],
        error: false,
        loading: false,
    };

    ServerObj = null;

    constructor(props) {
        super(props);
        this.ServerObj = props.serverObj;
        fzVariable = new FzVariable({ serverObj: this.ServerObj });
    }

    async getAllContracts() {
        this.setState({ allContracts: [], loading: true, error: false });
        try {
            let branch = fzVariable.store.get(fzVariable.keyStoreServerOptions('branch'));
            let urlPnotes = `https://api.frazionz.net/faction/pnotes/all/server_downloader/${branch}_${this.ServerObj.name}`
            axios.get(urlPnotes).then((response) => {
                console.log(urlPnotes, response)
                this.setState({ response: response.data, loading: false, error: false, });
                return;
            }).catch((err) => {
                console.log(err)
                this.setState({ allContracts: [], response: [], loading: false, error: true, });
                return;
            });
        } catch (error) {
            console.log(error)
            this.setState({ allContracts: [], loading: false, error: true });
            return;
        } finally {
            console.log('Finally')
            this.setState({ allContracts: [], loading: false, error: false });
            return;
        }
    }


    async componentDidMount() {
        await this.getAllContracts();
    }

    render() {

        const { error, loading, allContracts, response } = this.state;

        if (loading) {
            return <div className="spinner"></div>;
        }

        if (error) {
            return <Alert className="w-fit" state="error" message="Indisponible pour le moment." />;
        }

        if (typeof response == undefined) return <div>ça charge chef</div>;

        else {
            const dateToFormat = '1976-04-19T12:59-0500';
            return (
                <div className="pnotes" id="pnotes_last">
                    <h2 className="underline">{fzVariable.lang("server.pnotes.title")}</h2>
                    <ol className="relative mt-3 border-l border-gray-200 dark:border-gray-700">
                        {response.map((item, i) => {  
                            return (
                                <li key={ i } className="mb-10 ml-6">            
                                    <span className="flex absolute -left-3 justify-center items-center w-6 h-6 rounded-full ring-2 ring-gray-900 bg-[var(--color-2)]">
                                        <svg aria-hidden="true" className="w-3 h-3" fill="white" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
                                    </span>
                                    <h3 className="flex items-center mb-1 text-lg text-white">
                                        { item.name } v{ item.tag } 
                                        {i == 0 && 
                                            <span className=" bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">
                                                Latest
                                            </span>
                                        }
                                    </h3>
                                    <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                                        Publié le { fzVariable.replaceMonth(moment(item.created_at).local("fr").tz("Europe/Paris").format('D MMMM YYYY'))}
                                    </time>
                                    <div className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col gap-1">
                                            {item.fields.map((field, f_i) => {  
                                                return (
                                                    <span key={ f_i }>- { field.description }</span>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </li>
                            )   
                        })}  
                    </ol>
                </div>
            )
        }
    }



}

export default Pnotes;