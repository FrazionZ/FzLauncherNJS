import React from "react";
import { FaTimes } from "react-icons/fa";
import FzVariable from "./FzVariable";
import axios from "axios";

export default class FzCGUV extends React.Component {

  state = {
    loaded: false
  };

  constructor(props) {
    super(props);
    this.fcp = props.fcp;
    this.sideRouter = props.sideRouter;
    this.closeDialog = this.closeDialog.bind(this)
    this.fzVariable = new FzVariable();
  }

  async componentDidMount() {
    let response = await axios.get('https://api.frazionz.net/page/cguv')
    this.fileCGUV = response.data
    this.setState({ loaded: true })
  }

  async closeDialog(){
    this.sideRouter.showPage('/settings')
  }

  render() {
    return (
      <>
        <div className="cguv flex flex-col gap-[1.5rem] py-16">
          <div className="column w-full">
            <div className="head">
              <span onClick={this.closeDialog}>
                <FaTimes />
              </span>
            </div>
          </div>
          { this.state.loaded && 
            <div className="pb-16"
             dangerouslySetInnerHTML={{__html: this.fileCGUV.content}}
            />
          }
        </div>
      </>
    );
  }
}
