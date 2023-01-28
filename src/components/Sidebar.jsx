import React from 'react'
import { Tooltip } from 'flowbite-react'
import ServerConfig from '../../server_config.json'
import logo from '../assets/img/icons/icon.png'
import Task from '../components/Task'

import Server from '../views/connected/Server'
import Tasks from '../views/connected/Tasks'
import Settings from '../views/connected/Settings'
import Profile from '../views/connected/Profile'

import Router from './Router'

import Config from '../assets/img/icons/config.svg'
import FzVariable from './FzVariable'

let user

const sidebarMinimize = () => {
  document.querySelector('.sidebar').classList.toggle('minimize')
}

const GetTask = async (uuidDl) => {
  for await (const task of tasks) {
    if (uuidDl == task.uuidDl) return task
  }
}

const AddTask = async (taskObj) => {
  let ntask = await GetTask(taskObj.uuidDl)
  if (ntask == undefined || ntask == null) {
    ntask = new Task(taskObj)
    tasks.push(ntask)
  } else ntask.constUpdate(taskObj)
  return ntask.start()
}

let functionParse = {
  AddTask: AddTask
}
let router
let tasks = []

export default class Sidebar extends React.Component {

  state = {
    avatar: null
  }

  constructor(props) {
    super(props)
    this.appRouter = props.appRouter
    user = JSON.parse(sessionStorage.getItem('user'))
    this.fzVariable = new FzVariable()
  }

  async componentDidMount() {
    this.setState({ avatar: `https://auth.frazionz.net/skins/face.php?${Math.random().toString(36)}&u=${user.id}` })
    let sidebar = this;
    router = await new Router({
      domParent: document.querySelector('.main.connected .content-child'),
      multipleSubDom: true,
      keySubDom: 'sidepage'
    })
    router.setPages([
      {
        component: <Server sidebar={sidebar} sideRouter={router} functionParse={functionParse} idServer="0" />,
        name: 'Server',
        url: '/server'
      },
      {
        component: <Tasks sidebar={sidebar} sideRouter={router} taskList={tasks} functionParse={functionParse} />,
        name: 'Tasks',
        url: '/tasks'
      },
      {
        component: <Settings sidebar={sidebar} appRouter={this.appRouter} sideRouter={router} functionParse={functionParse} />,
        name: 'Settings',
        url: '/settings'
      },
      {
        component: <Profile sidebar={sidebar} appRouter={this.appRouter} sideRouter={router} functionParse={functionParse} />,
        name: 'Profile',
        url: '/profile'
      }
    ])
    router.showPage('/server')
    router.preRenderPage('/tasks')
  }

  navClick(instanceButton) {
    document.querySelector('.sidebar .parent-menu-link.active').classList.remove('active')
    instanceButton.target.classList.add('active')

    let href = instanceButton.target.getAttribute('data-href')
    router.showPage(href)
  }

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
                  <span>{this.fzVariable.lang('sidebar.navs.task')}</span>{' '}
                  <span className="badge bg-secondary dl downloads__countDl">0</span>
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
        <div className="taskOverlay">
          <span className="nothing">Aucun téléchargements en cours</span>
          <div className="card dl-items black-4 hide" id="uuidDl">
            <div className="card-body flex gap-15 direct-column justif-between">
              <div className="left flex gap-30 align-center">
                <div className="icon">
                  <span className="percent">0%</span>
                </div>
                <div className="infos flex direct-column w-100">
                  <div className="title  w-100">Chargement des données</div>
                  <div className="subtitle  w-100">veuillez patienter</div>
                </div>
              </div>
              <div className="progress  w-100">
                <div className="indicator" id="downloadbar" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
