//const Authenticator = require('azuriom-auth').Authenticator;

const Store = require('electron-store')

const store = new Store()

import FzVariable from './FzVariable';

class Auth {
  constructor() {
    this.urlApi = 'https://auth.frazionz.net'
    //this.authenticator = new Authenticator(this.urlApi)
    this.fzVariable = new FzVariable()
  }

  async addAccount(email, password, intfa, typetfa, twofa) {
    return new Promise(async (resolve, reject) => {
      /* DETERMINE OS */
      var opsys = process.platform
      if (opsys == 'darwin') opsys = 'MacOS'
      else if (opsys == 'win32' || opsys == 'win64') opsys = 'Windows'
      else if (opsys == 'linux') opsys = 'Linux'
      else opsys = 'Other'
      /* DETERMINE OS */
      try {
        if (email == '' || password == '') {
          return reject({ msg: this.fzVariable.lang('logging.result.empty'), twofa: false })
        }
        var user = undefined
        if (!twofa) user = await this.authenticator.auth(email, password, opsys, 'fzlauncher')
        else user = await this.authenticator.authWith2FA(email, password, opsys, 'fzlauncher', intfa, typetfa)

        this.fzVariable.store.set('lastEmail', email)

        console.log(user)
        if (user.status !== undefined) {
          if (user.status == 'error') {
            return reject({ msg: this.fzVariable.lang('logging.result.credentials'), twofa: false })
          }
          if (user.status == 'pending') {
            if (user.reason == '2fa') {
              return reject({ msg: this.fzVariable.lang('logging.result.2fa.require'), twofa: true })
            }
          }
        }
        user = user.data
        const userFinal = { uuid: user.uuid, access_token: user.access_token }
        store.set('session', userFinal)
        setTimeout(() => {
          resolve({ msg: 'success', user: user })
        }, 500)
      } catch (e) {
        console.log(e)
        return reject({ msg: e, twofa: false })
      }
    })
  }

  async verifySession(session) {
    return new Promise(async (resolve, reject) => {
      var accessToken = session.access_token
      try {
        var user = await this.authenticator.verify(accessToken)

        if (user.status !== undefined) {
          if (user.status == 'error') {
            return reject({ msg: 'Une erreur est survenue lors de la vérification' })
          }
        }
        user = user.data
        const userFinal = { uuid: user.uuid, access_token: user.access_token }
        store.set('session', userFinal)
        setTimeout(() => {
          resolve({ msg: 'success', user: user })
        }, 500)
      } catch (e) {
        return reject({ msg: 'Une erreur est survenue lors de la vérification' })
      }
    })
  }

  async logout(access_token){
    return new Promise(async (resolve, reject) => {
      try {
        this.authenticator.logout(access_token).then(() => {
          resolve();
        }).catch((err) => {
          console.log(err)
          reject()
        })
      }catch(e){
        console.log(e)
        reject(e);
      }
    })
  }
}

export default Auth
