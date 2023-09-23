import React from "react";
import ReactSkinview3d from "react-skinview3d";

class FzSkinViewer extends React.Component {

    state = { }

    constructor(props) {
        super(props)
        this.skinUrl = props.skinUrl
        this.capeUrl = props.capeUrl
        this.height = props.height
        this.width = props.width
        this.onReady = props.onReady
    }

    componentDidUpdate() {
    }

    render() {
        try {
            return (<ReactSkinview3d
                skinUrl={this.skinUrl}
                capeUrl={this.capeUrl}
                height={this.height}
                width={this.width}
                onReady={(ready) => {
                    this.onReady(ready)
                }}
            />)
        } catch (e) {
            console.log(e)
        }

    }

}

export default FzSkinViewer