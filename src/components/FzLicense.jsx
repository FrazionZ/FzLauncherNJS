import React from "react";
import { FaTimes } from "react-icons/fa";
import FzVariable from "./FzVariable";
import axios from "axios";
import fs from 'fs'
import path from "path";
import StringBuilder from "string-builder";
import readLine from 'readline'
const { app } = require('@electron/remote');
import MarkdownIt from "markdown-it";
import Package from '../../package.json'
import FzDependLicense from '../components/FzDependLicense'

export default class FzCGUV extends React.Component {

    state = {
        licenses: []
    };

    md = new MarkdownIt()


    constructor(props) {
        super(props);
        this.fcp = props.fcp;
        this.sideRouter = props.sideRouter;
        this.closeDialog = this.closeDialog.bind(this)
        this.fzVariable = new FzVariable();
    }

    async processLineByLine(pathCrashReport) {
        const fileStream = fs.createReadStream(pathCrashReport);
        const rl = readLine.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        const sb = new StringBuilder();
        for await (const line of rl)
            sb.appendLine(line + '<br />')

        return sb.toString()
    }

    async componentDidMount() {
        this.processListingDependancies(Object.keys(Package.devDependencies))
        this.processListingDependancies(Object.keys(Package.dependencies))
        this.setState({ licensesJson: this.state.licenses.sort((a, b) => a.package.localeCompare(b.package)) })
    }

    async processListingDependancies(list) {
        for await (const val of list) {
            let path = app.getAppPath() + '/node_modules/' + val + '/LICENSE';
            if (fs.existsSync(path)) {
                this.state.licenses.push({ package: val, license: await this.processLineByLine(path) })
                this.setState({ licensesJson: this.state.licenses })
            }
        }
    }

    async closeDialog() {
        this.sideRouter.showPage('/settings')
    }

    render() {
        return (
            <>
                <div className="licenses flex flex-col gap-[1.5rem] py-16 mb-6 h-full">
                    <div className="column w-full">
                        <div className="head justify-between">
                            <h1>Licences tiers</h1>
                            <span onClick={this.closeDialog}>
                                <FaTimes />
                            </span>
                        </div>
                    </div>
                    {this.state.licenses.map((val, index) => {
                        return (
                            <div key={index} className="card overflow-hidden h-fit" style={{ padding: "0px" }}>
                                <FzDependLicense license={val} />
                            </div>
                        )
                    })}
                </div>
            </>
        );
    }
}
