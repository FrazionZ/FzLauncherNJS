import React from 'react'
import { Tooltip } from 'flowbite-react'
import ServerConfig from '../../server_config.json'
import logo from '../assets/img/icons/icon.png'

import Server from '../views/connected/Server'
import Tasks from '../views/connected/Tasks'
import Wiki from '../views/connected/Wiki'
import Settings from '../views/connected/Settings'
import Profile from '../views/connected/Profile'
import FzCGUV from './FzCGUV'
import FzLicense from './FzLicense'
import Router from './Router'

import Config from '../assets/img/icons/config.svg'
import FzVariable from './FzVariable'

let user

const sidebarMinimize = () => {
  document.querySelector('.sidebar').classList.toggle('minimize')
}

export default class Sidebar extends React.Component {

  state = {
    avatar: null
  }

  constructor(props) {
    super(props)
    this.appRouter = props.appRouter
    user = JSON.parse(sessionStorage.getItem('user'))
    this.fzVariable = new FzVariable()
    this.navClick = this.navClick.bind(this)
    this.tasks = props.tasks
    this.functionParse = {
      AddTaskInQueue: props.fp.AddTaskInQueue
    }
  }

  async componentDidMount() {
    this.setState({ avatar: `https://auth.frazionz.net/skins/face.php?${Math.random().toString(36)}&u=${user.id}` })
    let sidebar = this;
    this.router = await new Router({
      domParent: document.querySelector('.main.connected .content-child'),
      multipleSubDom: true,
      keySubDom: 'sidepage'
    })
    this.router.setPages([
      {
        component: <Server sidebar={sidebar} taskQueue={this.taskQueue} sideRouter={this.router} functionParse={this.functionParse} idServer="0" />,
        name: 'Server',
        url: '/server'
      },
      {
        component: <Tasks sidebar={sidebar} sideRouter={this.router} taskList={this.tasks} functionParse={this.functionParse} />,
        name: 'Tasks',
        url: '/tasks'
      },
      {
        component: <Wiki sidebar={sidebar} sideRouter={this.router} taskList={this.tasks} functionParse={this.functionParse} />,
        name: 'Wiki',
        url: '/wiki'
      },
      {
        component: <Settings sidebar={sidebar} appRouter={this.appRouter} sideRouter={this.router} functionParse={this.functionParse} />,
        name: 'Settings',
        url: '/settings'
      },
      {
        component: <Profile sidebar={sidebar} appRouter={this.appRouter} sideRouter={this.router} functionParse={this.functionParse} />,
        name: 'Profile',
        url: '/profile'
      },
      {
        component: <FzCGUV sidebar={sidebar} appRouter={this.appRouter} sideRouter={this.router} functionParse={this.functionParse} />,
        name: 'CGUV',
        url: '/cguv'
      },
      {
        component: <FzLicense sidebar={sidebar} appRouter={this.appRouter} sideRouter={this.router} functionParse={this.functionParse} />,
        name: 'License',
        url: '/license'
      }
    ])
    this.router.showPage('/server')
    this.router.preRenderPage('/tasks')
  }

  navClick(instanceButton) {
    if(document.querySelector('.featuresDiscovery.open') !== null) return;
    document.querySelector('.sidebar .parent-menu-link.active').classList.remove('active')
    instanceButton.target.classList.add('active')

    let href = instanceButton.target.getAttribute('data-href')
    this.router.showPage(href)
  }

  /*
            <Tooltip content={this.fzVariable.lang('sidebar.navs.task')} placement="right">
              <li onClick={this.navClick} data-href="/tasks" className="parent-menu-link">
                <a className="menu-link">
                  <i className="bx bx-food-menu" style={{ fontSize: '36px' }}></i>
                  <span>{this.fzVariable.lang('sidebar.navs.task')}</span>{' '}
                  <span className="badge bg-secondary dl downloads__countDl">0</span>
                </a>
              </li>
            </Tooltip>*/

  render() {
    return (
      <div>
        <div className="sidebar minimize flex flex-col justify-between">
          <div id="servers">
            {ServerConfig.map((server, i) => {
              return (
                <Tooltip key={i} content={server.name} placement="right">
                  <li
                    onClick={this.navClick}
                    data-href="/server"
                    key={i}
                    className="parent-menu-link nav active"
                    id={`nav_server_${i}`}
                    title={`${server.name}`}
                  >
                    <a className="menu-link" href="#server" data-server-id={i}>
                      <img width="36" height="36" src={` ${logo} `} /> <span>{server.name}</span>
                    </a>
                  </li>
                </Tooltip>
              )
            })}
          </div>
          <div id="navs">
           <Tooltip content={this.fzVariable.lang('sidebar.navs.task')} placement="right">
              <li onClick={this.navClick} data-href="/tasks" className="parent-menu-link">
                <a className="menu-link">
                  <i className="bx bx-food-menu" style={{ fontSize: '36px' }}></i>
                </a>
              </li>
            </Tooltip>
            <Tooltip content={this.fzVariable.lang('sidebar.navs.settings')} placement="right">
              <li onClick={this.navClick} data-href="/settings" className="parent-menu-link">
                <a className="menu-link">
                  <img src={Config} style={{ width: '36px' }} />
                  <span>{this.fzVariable.lang('sidebar.navs.settings')} </span>
                </a>
              </li>
            </Tooltip>
            <Tooltip content={user.username} placement="right">
              <li onClick={this.navClick} data-href="/profile" className="parent-menu-link">
                <a className="menu-link">
                  <img id="nav_menu_avatar" width="36" height="36" className="avatar nav animate__infinite  animate__wobble" src={(this.state.avatar !== null) ? this.state.avatar : ""} />
                  <div className="text nav-text profile__data flex align-center gap-2">
                    <span>{user.username}</span>
                  </div>
                </a>
              </li>
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }
}
