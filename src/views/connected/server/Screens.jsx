import React from 'react'
import FzVariable from '../../../components/FzVariable'

let fzVariable

class Screens extends React.Component {

  state = {
    screens: null
  }


  constructor(props) {
    super(props)
    this.ServerObj = props.serverObj;
    fzVariable = new FzVariable(this.ServerObj)
    this.dirServerScreens = fzVariable.path.join(this.ServerObj.dirServer, "screenshots");
    if (!fzVariable.fs.existsSync(this.dirServerScreens))
      fzVariable.fs.mkdirSync(this.dirServerScreens);
  }

  async componentDidMount() {
    await fzVariable.fs.readdir(this.dirServerScreens, (err, files) => {
      if (err) throw err;
      files.forEach((file, i) => {
        let fileRead = fzVariable.fs.readFileSync(fzVariable.path.join(this.dirServerScreens, file))
        let base64 = new Buffer(fileRead).toString('base64');
        files[i] = "data:image/png;base64," + base64
      })
      this.setState({ screens: files })
    })
  }

  render() {
    return (
      <div className="screens">
        <div className="flex flex-col gap-1">
          <h2 className="underline">{fzVariable.lang("server.screens.title")}</h2>
          <span className="text-[var(--text-inactive)]">{fzVariable.lang("server.screens.subtitle")}</span>
        </div>
        <section className="overflow-hidden text-gray-700">
          <div className="container mx-auto ">
            <div className="flex flex-wrap -m-1 md:-m-2">
              <div style={{ padding: "28px" }} className="grid-cols-3 space-y-2 lg:space-y-0 lg:grid lg:gap-3 lg:grid-rows-3">
                {this.state.screens == null && (
                  <>
                    <span>Chargement des screens..</span>
                  </>
                )}
                {this.state.screens !== null && (
                  <>
                    {this.state.screens.map((file, i) => {
                      return (
                        <div key={i} className={`item-picture w-full ${((i == 0) ? "col-span-2 row-span-2" : "")}`}>
                          <img src={file} className="rounded" alt="image" loading='lazy' />
                        </div>
                      )
                    })}
                  </>
                )}

              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

export default Screens
