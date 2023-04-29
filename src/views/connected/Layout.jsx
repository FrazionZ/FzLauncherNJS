import React from 'react'

import Sidebar from '../../components/Sidebar'

import '../../assets/css/boxicons.min.css'
import '../../assets/css/style.css'
import Task from '../../components/Task'
import { FiMinus } from 'react-icons/fi'
import { useState } from 'react'
import { Queue } from 'async-await-queue'
import FeaturesDiscovery from '../../views/connected/FeaturesDiscovery'
import FzVariable from '../../components/FzVariable'

export default function Layout(props) {

  const appRouter = props.appRouter

  const fzVariable = new FzVariable()

  const [minified, setMinified] = useState(false)

  function toggleMinified() {
    setMinified(!minified)
  }


  let tasks = []
  const myq = new Queue(1, 1200);
  const myPriority = -1;

  const GetTask = async (uuidDl) => {
    for await (const task of tasks) {
      if(task !== null)
        if(task !== undefined)
          if (uuidDl == task.uuidDl) 
            return task
    }
  }
  
  const AddTaskInQueue = async (taskObj) => {
    let ntask = await GetTask(taskObj.uuidDl)
    if (ntask == undefined || ntask == null) {
      ntask = new Task(taskObj)
      tasks.push(ntask)
    } else ntask.constUpdate(taskObj)
    const me = Symbol()
    await myq.wait(me, myPriority);
    return new Promise((resolve, reject) => {
      ntask.start()
        .then(() => { myq.end(me) })
        .catch((e) => console.error(e))
        .finally(() => { resolve() });
    })
  }

  const GetListTaskQueue = () => {
    return myq.queueWaiting;
  }

  const fp = {AddTaskInQueue: AddTaskInQueue, GetListTaskQueue: GetListTaskQueue}
  return (
    <div className="body">
      <Sidebar appRouter={appRouter} fp={fp} tasks={tasks} />
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
      <div className={`taskOverlay hidden ${minified ? "minified" : ""}`}>
        <button className='minimize hidden' onClick={toggleMinified}><FiMinus /></button>
        <div className="dl-items">
          <div className="left flex gap-30 align-center">
            <div className="infos flex direct-column w-100">
              <div className="title">Récupération des informations</div>
              <div className="subtitle w-100">Traitement de la tâche en cours...</div>
            </div>
          </div>
          <div className="progress  w-100">
            <div
              className="indicator"
              id="downloadbar"
              style={{ width: "0%" }}
            ></div>
          </div>
        </div>
      </div>
      {!fzVariable.store.has('launcher__guide') && <FeaturesDiscovery />}
    </div>
  )
}