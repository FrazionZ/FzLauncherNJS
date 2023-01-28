import FzVariable from '../../components/FzVariable'
const fzVariable = new FzVariable()

export default function Tasks() {
  return (
    <div className="downloads pl-60 pr-60 pb-30">
      <h2 className="pt-30 pb-10 underline">{fzVariable.lang('task.title')}</h2>
      <div className="flex gap-10 direct-column">
        <div className="column">
          <div className="listDls flex gap-10 direct-column">
            <span className="nothing text-center pt-30 pb-30 text-gray">
              {fzVariable.lang('task.noth_pending')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
