import 'react-toastify/dist/ReactToastify.css'
import React from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './assets/css/index.css'
import './assets/fonts/poppins.css'

import Header from './components/Header'

import LayoutConnect from './views/connected/Layout'
import Login from './views/Login'
import Updater from './views/Updater'
import Router from './components/Router'
import Runtime from './views/Runtime'

const functionParse = {
  Toast: toast
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.router = undefined
  }

  async componentDidMount() {
    this.router = await new Router({
      domParent: document.querySelector('.main'),
      multipleSubDom: false
    })
    
    await this.router
      .setPages([
        {
          component: <Updater appRouter={this.router} functionParse={functionParse} />,
          name: 'Updater',
          url: '/updater'
        },
        {
          component: <Runtime appRouter={this.router} functionParse={functionParse} />,
          name: 'Runtime',
          url: '/runtime'
        },
        {
          component: <Login appRouter={this.router} functionParse={functionParse} />,
          name: 'Login',
          url: '/login'
        },
        {
          component: <Login appRouter={this.router} functionParse={functionParse} />,
          name: 'Login',
          url: '/login'
        },
        {
          component: <LayoutConnect appRouter={this.router} functionParse={functionParse} />,
          name: 'Connected',
          url: '/connected'
        }
      ])
      .then((router) => {
        router.showPage('/updater')
      })
  }

  render() {
    return (
      <div className="App">
        <ToastContainer />
        <div className="layout">
          <Header />
          <div className="main"></div>
        </div>
      </div>
    )
  }
}

export default App
