import ReactDOM from 'react-dom/client'
import FzToast from './FzToast'

class Router {
  constructor(opts) {
    return new Promise((resolve) => {
      this.pages = opts.pages
      this.domParent = opts.domParent
      this.multipleSubDom = opts.multipleSubDom
      this.keySubDom = opts.keySubDom
      this.currentPage = ''
      this.root = null
      this.alreadyReactDomCreate = false
      if(this.pages !== undefined){
        this.setPagesDom().then(() => {
          resolve(this);
        })
      }else resolve(this)
    })
  }

  async addPagesDom(page){
    return new Promise((resolve) => {
      if (this.multipleSubDom) {
        let domChild = null;
        domChild = this.domParent.appendChild(document.createElement('div'))
        domChild.classList.add(page.name)
        domChild.classList.add(this.keySubDom)
        domChild.classList.add('hidden')
        page.root = ReactDOM.createRoot(domChild)
        page.domChild = domChild
      } else {
        if(!this.alreadyReactDomCreate){
          this.root = ReactDOM.createRoot(this.domParent)
          page.domChild = this.domParent
          this.alreadyReactDomCreate = true;
        }
      }
      resolve(this)
    })
  }

  async setPagesDom(){
    return new Promise((resolve) => {
      if (this.pages !== undefined) {
        this.pages.forEach((page) => {
          if (this.multipleSubDom) {
            let domChild = null;
            if(this.domParent.querySelector('.'+page.name) == null){
              domChild = this.domParent.appendChild(document.createElement('div'))
              domChild.classList.add(page.name)
              domChild.classList.add(this.keySubDom)
              domChild.classList.add('hidden')
              page.root = ReactDOM.createRoot(domChild)
            }else {
              domChild = this.domParent.querySelector('.'+page.name)
              console.log(page)
            }
            page.domChild = domChild
          } else {
            if(!this.alreadyReactDomCreate){
              this.root = ReactDOM.createRoot(this.domParent)
              page.domChild = this.domParent
              this.alreadyReactDomCreate = true;
            }
          }
          resolve(this)
        })
      } else {
        resolve(this)
      }
    })
  }

  async setPages(pages) {
    this.pages = pages
    this.setPagesDom();
    return this
  }

  async preRenderPage(url) {
    let tpage = await this.getPage(url)
    if (tpage == undefined)
      return FzToast.error(`La page (${url}) semble ne pas répondre ou n'existe plus.`)
    let domPage = this.domParent.querySelector(`.${tpage.name}.${this.keySubDom}`)
    if (this.multipleSubDom) {
      if (!domPage.hasAttribute('rendered')) {
        try {
          domPage.setAttribute('rendered', true)
          tpage.root.render(tpage.component)
        }catch(e){
          console.log(e)
        }
      }
    } else if (this.root !== null) this.root.render(tpage.component)
  }

  async reloadRenderPage(url, forceShowPage) {
    return new Promise(async (resolve, reject) => {
      let tpage = await this.getPage(url)
      if (tpage == undefined)
        return FzToast.error(`La page (${url}) semble ne pas répondre ou n'existe plus.`)
      if(this.root !== null) {
        this.root.unmount()
        this.root = ReactDOM.createRoot(this.domParent)
        this.root.render(tpage.component)
      }else {
        tpage.root.unmount()
        tpage.root = ReactDOM.createRoot(tpage.domChild)
        tpage.root.render(tpage.component)
      }
    })
  }

  async showPage(url, forceShow) {
    if (url == this.currentPage && !forceShow) return
    let tpage = await this.getPage(url)
    if (tpage == undefined)
      return FzToast.error(`La page (${url}) semble ne pas répondre ou n'existe plus.`)
    if (this.multipleSubDom) {
      this.domParent.querySelectorAll(`.${this.keySubDom}`).forEach((dom) => {
        if (!dom.classList.contains('hidden')) dom.classList.add('hidden')
      })
      let domPage = this.domParent.querySelector(`.${tpage.name}.${this.keySubDom}`)
      this.preRenderPage(url)
      domPage.classList.remove('hidden')
    } else if (this.root !== null) this.preRenderPage(url)
    this.currentPage = url;
    let mainContentChild = document.querySelector('.main .content-child');
    if(mainContentChild !== null) 
      mainContentChild.scrollTop = 0;
  }

  async unmountPage(url) {
    let tpage = await this.getPage(url)
    if (tpage == undefined)
      return FzToast.error(`La page (${url}) semble ne pas répondre ou n'existe plus.`)
    if (this.multipleSubDom) {
      let domPage = this.domParent.querySelector(`.${tpage.name}.${this.keySubDom}`) 
      domPage.removeAttribute('rendered')
      tpage.root.unmount()
      tpage.root = ReactDOM.createRoot(tpage.domChild)
    }else{ 
      this.root.unmount()
      this.root = ReactDOM.createRoot(tpage.component)
    }
  }

  async getPage(url) {
    return this.pages.find(page => page.url == url);
  }
}

export default Router
