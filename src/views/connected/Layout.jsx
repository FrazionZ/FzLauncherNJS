import React from 'react'

import Sidebar from '../../components/Sidebar'

import '../../assets/css/boxicons.min.css'
import '../../assets/css/style.css'

class Layout extends React.Component {
  constructor(props) {
    super(props)
    this.appRouter = props.appRouter
  }

  async componentDidMount() {
    /*root = ReactDOM.createRoot(document.querySelector('.main.connected .content-child'))
        renderPage('/server');*/
  }

  render() {
    return (
      <div className="body">
        <Sidebar appRouter={this.appRouter} />
        <div id="modals"></div>
        <div className="black-4 w-100" style={{ borderBottomRightRadius: '15px' }}>
          <div className="main connected w-100">
            <div className="alert black-3 fzLauncher hide">
              <div className="icon">
                <i className="fa-solid fa-triangle-exclamation fcolor-2 mr-10"></i>
              </div>
              <span id="alertFzLauncher" className="animate">
                General Message
              </span>
            </div>
            <div className="content-child"></div>
          </div>
        </div>
      </div>
    )
  }
}
export default Layout
