import React from 'react'
import PropTypes from 'prop-types'
import FzVariable from '../components/FzVariable'
const fzVariable = new FzVariable()
import Task from '../components/Task'
const { v4: uuidv4 } = require('uuid')

let task
let uuid
//https://cdn.azul.com/zulu/bin/zulu8.66.0.15-ca-jre8.0.352-win_x64.zip

class Runtime extends React.Component {
  static get propTypes() {
    return {
      router: PropTypes.any
    }
  }

  constructor(props) {
    super(props)
    this.router = this.props.appRouter
    this.dirRuntime = fzVariable.path.join(fzVariable.dirFzLauncherDatas, 'runtime')
    uuid = uuidv4()
    task = new Task({
      type: 0,
      uuidDl: uuid,
      installerfileURL: 'https://download.frazionz.net/FZLauncher/runtime/java.zip',
      installerfilename: fzVariable.path.join(this.dirRuntime, 'java.zip'),
      prefix: "Téléchargement de Java",
      update: false
    })
    task.start().then(() => {
      task = new Task({
        type: 1,
        uuidDl: uuid,
        fileZipDepend: fzVariable.path.resolve(this.dirRuntime, 'java.zip'),
        dirServer: fzVariable.path.resolve(this.dirRuntime),
        prefix: "Extraction de Java",
        update: false
      })
      task.start().then(() => {
        fzVariable.fs.rmSync(fzVariable.path.join(this.dirRuntime, 'java.zip'))
        this.router.showPage('/login')
      })
    })
  }

  componentDidMount(){
    document.addEventListener('update', (event) => {
      let downloadbar = document.querySelector('#downloadbar')
      let percentage = (typeof event.detail.state.percentage == 'string') ? parseInt(event.detail.state.percentage) : event.detail.state.percentage
      console.log(event.detail.title, percentage, downloadbar)
      downloadbar.style.width = percentage+"%";
      document.querySelector('#download-label').innerHTML = event.detail.title
      document.querySelector('#downloadpercent').innerHTML = percentage+"%"
    })
  }

  render() {
    return (
      <div className="fz-h-100 flex flex-col items-center justify-center gap-30">
        <div className="flex content gap-20 align-center">
          <span className="loader-3"></span>
          <div className="flex direct-column gap-10 align-center actionsText">
            <div className="flex gap-1 text-white">
              <h4 className="btext" id="download-label"></h4> <span id="downloadpercent">0%</span>
            </div>
            <div className="progress">
              <div className="indicator" id="downloadbar" style={{ width: "0%" }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Runtime
