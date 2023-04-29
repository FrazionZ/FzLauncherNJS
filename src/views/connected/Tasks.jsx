import FzVariable from '../../components/FzVariable'
const fzVariable = new FzVariable()
import React, {useEffect,useState} from 'react';


export default function Tasks(props) {

  const [tasks, setTasks] = useState([]);

  const taskCard = (task) => {
    return (
      <div className="card dl-items" id={task.uuidDl}>
        <div className="card-body flex gap-15 direct-column justif-between">
          <div className="left flex gap-30 align-center">
            <div className="icon" style={{ textAlign: "center" }}>
              <span className="text-3xl percentage">0%</span>
            </div>
            <div className="infos flex direct-column w-100">
              <div className="title  w-100">{task.title}</div>
              <div className="subtitle  w-100">{task.subtitle}</div>
            </div>
          </div>
          <div className="progress  w-100">
            <div
              className="indicator"
              id="downloadbar"
              style={{ width: task.state.percentage+"%" }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    document.addEventListener('task__created', function({ detail }) {
      setTasks(oldArray => [...oldArray, detail.task])
      console.log(tasks)
    })
    document.addEventListener('task__started', function({ detail }) {
      //console.log(detail)
    })
    document.addEventListener('task__updated', function({ detail }) {
      //console.log(detail)
    })
  }, [tasks]);

  return (
    <div className="downloads pl-60 pr-60 pb-30">
      <h2 className="pt-30 pb-10 underline">{fzVariable.lang('task.title')}</h2>
      <div className="flex gap-10 direct-column">
        <div className="column">
          <div className="listDls flex gap-10 direct-column">
            {tasks.length < 1 &&
              <span className="nothing text-center pt-30 pb-30 text-gray">
                {fzVariable.lang('task.noth_pending')}
              </span>
            }
            {tasks.length > 0 &&
              <>
                {tasks.map((task) => {
                  {taskCard(task)}
                })}
              </>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
