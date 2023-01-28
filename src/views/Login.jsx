import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FaArrowLeft } from 'react-icons/fa'
import AuthCodeRef from 'react-auth-code-input';
import logo from '../assets/img/icons/fz_logo.svg'
import FzToast from '../components/FzToast'
import Auth from '../components/Auth'
import axios from 'axios'
import FzVariable from '../components/FzVariable'
import Router from '../components/Router'

import AddAccount from './auth/AddAccount'
import PasswordForget from './auth/PasswordForget'
import TwoFaAccount from './auth/TwoFaAccount'
import VerifyAccount from './auth/VerifyAccount'

const Store = require('electron-store')
const store = new Store()

class Login extends React.Component {
  static get propTypes() {
    return {
      router: PropTypes.any
    }
  }

  state = {
    title: " - ",
    allowBackHL: false,
  }

  constructor(props) {
    super(props)
    this.appRouter = this.props.appRouter
    this.twofa = false
    this.auth = new Auth()
    this.twoFaInput = React.createRef < AuthCodeRef > (null)
    this.handleClick = this.handleClick.bind(this)
    this.resetPassword = this.resetPassword.bind(this)
    this.fzVariable = new FzVariable()
  }

  setTitle(nt) {
    this.setState({ title: nt })
  }

  setAllowBackHL(bool) {
    this.setState({ allowBackHL: bool })
  }

  disableForm() {
    document.querySelector('input[name="email"]').setAttribute('disabled', true)
    document.querySelector('input[name="password"]').setAttribute('disabled', true)
    document.querySelector('input[name="inputEmailReset"]').setAttribute('disabled', true)
    document.querySelector('.btnLogin').querySelector('.icon').classList.remove('hidden')
    document.querySelector('.btnLogin').disabled = true;
  }

  enableForm() {
    document.querySelector('input[name="email"]').removeAttribute('disabled')
    document.querySelector('input[name="password"]').removeAttribute('disabled')
    document.querySelector('input[name="inputEmailReset"]').removeAttribute('disabled')
    document.querySelector('.btnLogin').querySelector('.icon').classList.add('hidden')
    document.querySelector('.btnLogin').disabled = false;
  }

  async componentDidMount() {
    this.router = await new Router({
      domParent: document.querySelector('.login .login-pages'),
      multipleSubDom: false
    })
    this.router.setPages([
      {
        "component": <AddAccount parentClass={this} allowBackHL={false} />,
        "name": "AddAccount",
        "url": "/addAccount",
        "root": undefined
      },
      {
        "component": <PasswordForget parentClass={this} allowBackHL={true} />,
        "name": "PasswordForget",
        "url": "/passwordForget",
        "root": undefined
      },
      {
        "component": <TwoFaAccount parentClass={this} allowBackHL={true} />,
        "name": "TwoFaAccount",
        "url": "/twoFaAccount",
        "root": undefined
      },
      {
        "component": <VerifyAccount parentClass={this} appRouter={this.appRouter} allowBackHL={false} />,
        "name": "VerifyAccount",
        "url": "/verifyAccount",
        "root": undefined
      },
    ])
    try {
      if (store.has('session')){
        this.router.showPage('/verifyAccount');
      }else{
        this.router.showPage('/addAccount')
      }
    }catch(e){
      console.log(e)
    }
    /*if (store.has('session')) {
      console.log('Start Session Auth..')
      this.disableForm()
      const verifySession = auth.verifySession(store.get('session'))
      FzToast.processToast(
        'Vérification de la session en cours',
        verifySession,
        (data) => {
          sessionStorage.setItem('user', JSON.stringify(data.user))
          this.router.showPage('/connected')
          return this.fzVariable.lang('logging.result.logged', [
            { key: "%session__name%", value: data.user.username }
          ])
        },
        (data) => {
          this.enableForm()
          return `${data.msg}`
        }
      )
    }*/
  }

  async showPasswordReset() {
    document.querySelectorAll('.login_form').forEach((dom) => {
      if (!dom.classList.contains('hidden')) dom.classList.add('hidden')
    })
    document.querySelector('#login_rpwd').classList.remove('hidden')
  }

  async hidePasswordReset() {
    document.querySelectorAll('.login_form').forEach((dom) => {
      if (!dom.classList.contains('hidden')) dom.classList.add('hidden')
    })
    document.querySelector('#login_basic').classList.remove('hidden')
  }

  async resetPassword() {
    this.disableForm()
    let email = this.inputEmailReset.value
    const resetPasswordRequest = async () => {
      return new Promise((resolve, reject) => {
        if (email == '') return reject({ msg: this.fzVariable.lang('logging.result.empty'), twofa: false })
        axios
          .post('https://frazionz.net/api/frazionz/resetpwd', {
            email: email
          })
          .then((response) => {
            resolve(response.data)
          })
          .catch((err) => {
            if (err.response) return reject({ msg: err.response.data.message })
            reject({ msg: err })
          })
      })
    }
    FzToast.processToast(
      'Envoie du mail de demande de mot de passe..',
      resetPasswordRequest,
      (data) => {
        this.enableForm()
        this.hidePasswordReset()
        if (data.result == 'success') return 'Vous avez reçus un mail de FrazionZ.'
      },
      (data) => {
        this.enableForm()
        console.log(data)
        return `${data.msg}`
      }
    )
  }

  handleClick() {
    this.disableForm()
    console.log(this.state.twofaResult)
    const addAccount = auth.addAccount(
      document.querySelector('input[name="email"]').value,
      document.querySelector('input[name="password"]').value,
      "000000",
      this.twofa
    )
    FzToast.processToast(
      'Connexion en cours',
      addAccount,
      (data) => {
        sessionStorage.setItem('user', JSON.stringify(data.user))
        this.router.showPage('/connected')
        return `Vous êtes connectés ! Welcome ${data.user.username}`
      },
      (data) => {
        this.enableForm()
        if (data.twofa) {
          this.twofa = true
          document.querySelector('#login_basic').classList.add('hidden')
          document.querySelector('#login_TwoFa').classList.remove('hidden')
        }
        return `${data.msg}`
      }
    )
  }

  twoFaOnChange = (res) => {
    this.setState({ twofaResult: res });
  };

  render() {
    return (
      <div className="login">
        <div className="heading">
          {this.state.allowBackHL &&
            <a className='text-4xl' onClick={() => { this.router.showPage('/addAccount') }}><FaArrowLeft /></a>
          }
          <img src={logo} alt="frazionz" />
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            {this.state.title}
          </h2>
        </div>
        <div className="login-pages px-72"></div>
      </div>

    )
  }
}

export default Login
