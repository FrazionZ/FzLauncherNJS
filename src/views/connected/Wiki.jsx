import React from "react";
import { shell } from "electron";
import FzToast from "../../components/FzToast";

export default class Wiki extends React.Component {

    constructor(props){
        super(props)
        this.webviewURL = ""
        this.webviewDom = null
    }

    componentDidMount(){
        document.querySelector('webview').addEventListener('dom-ready', function(e) {
            this.webviewDom = e.target
            document.querySelector('.loader').remove()
            e.target.style.display = "flex"
        })
        document.querySelector('webview').addEventListener('will-navigate', function(e) {
            console.log(typeof e.url, e.url)
            if(!e.url.startsWith('https://wiki.frazionz.net')){
                shell.openExternal(e.url)
                FzToast.info('Ce lien a été ouvert sur votre navigateur')
                e.target.stop()
            }
        })
    }

    render(){
        return (
            <>
                <div className="flex justify-center items-center gap-6 loader" style={{  height: "calc(100vh - 80px)" }}>
                    <div className="loader-3"></div>
                    <span className="text-2xl">Chargement du Wiki</span>
                </div>
                <webview src="https://wiki.frazionz.net" style={{ display: "none", height: "calc(100vh - 80px)" }} />
            </>
        )  
    }
}