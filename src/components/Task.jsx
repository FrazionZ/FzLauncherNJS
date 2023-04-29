import ReactDOM from "react-dom/client";
import CircularProgress from "./CircularProgress";
import FzVariable from "./FzVariable";
import React from 'react'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
const EventEmitter = require("events");

let fzVariable = new FzVariable();

export default class Task {

  constructor(opts) {
    this.type = opts.type;
    this.state = { percentage: 0 };
    this.uuidDl = opts.uuidDl;
    this.installerfileURL = opts.installerfileURL;
    this.installerfilename = opts.installerfilename;
    this.fupdate = opts.update !== undefined ? opts.update : true;
    this.prefix = opts.prefix;

    this.fzevent = new EventEmitter();
    this.fileZipDepend = opts.fileZipDepend;
    this.dirServer = opts.dirServer;

    this.timer = 0;
    this.aexist = false;
    this.lastTask = opts.lastTask;
    
    this.title = "";
    this.subtitle = "";
  }

  constUpdate(opts) {
    this.type = opts.type;
    this.uuidDl = opts.uuidDl;
    this.installerfileURL = opts.installerfileURL;
    this.installerfilename = opts.installerfilename;
    this.fupdate = opts.update !== undefined ? opts.update : true;
    this.prefix = opts.prefix;
 
    this.fileZipDepend = opts.fileZipDepend;
    this.dirServer = opts.dirServer;
    this.lastTask = opts.lastTask;

    this.timer = 0;
    this.aexist = true;
  }

  start() {
    let instance = this;
    try {
      if (this.fupdate) {
        this.startTime = new Date().getTime();
        if (
          document
            .querySelector(".main.connected .content-child .Tasks.sidepage")
            .hasAttribute("rendered")
        ) {
          if (!this.aexist) {
            let domRoot = document.querySelector(
              ".main.connected .content-child .Tasks.sidepage .downloads .listDls"
            );
            domRoot.querySelector(".nothing").style.display = "none";
            let domChild = domRoot.appendChild(document.createElement("div"));
            domChild.setAttribute("id", instance.uuidDl);
            const root = ReactDOM.createRoot(domChild);
            root.render(this.render(instance));
          } else {
            let domTask = document.querySelector(
              '.downloads .listDls .dl-items[id="' + instance.uuidDl + '"]'
            );
            if (domTask !== null || domTask !== undefined) {
              console.log("DomTask Exist (Update Task group)");
            }
          }
          document.querySelector('.taskOverlay').classList.remove('hidden')
        }
      }
      return new Promise((resolve, reject) => {
        if (instance.type == 0)
          //THIS IS A DOWNLOAD
          instance
            .download(instance)
            .then(() => {
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        else if (instance.type == 1)
          //EXTRACT
          instance
            .extract(instance)
            .then(() => {
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        else resolve();
      });
    } catch (e) {
      console.log(e);
    }
  }

  async download(instance) {
    const fs = require("fs");
    const path = require("path");
    const byteSize = require("byte-size");
    console.log("Download file from URL: " + instance.installerfileURL);
    return new Promise((resolve, reject) => {
      var received_bytes = 0;
      var total_bytes = 0;

      const request = require("request");
      var req = request({
        method: "GET",
        uri: instance.installerfileURL,
      });

      var out = fs.createWriteStream(
        instance.installerfilename.split("%20").join(" ")
      );
      req.pipe(out);

      req.on("response", function (data) {
        total_bytes = parseInt(data.headers["content-length"]);
      });

      req.on("error", function (err) {
        console.log(err);
        reject(err);
      });

      req.on("data", function (chunk) {
        received_bytes += chunk.length;
        var percentage = (received_bytes * 100) / total_bytes;

        var rb = byteSize(received_bytes);
        var tb = byteSize(total_bytes);
        var title = instance.prefix + " - Téléchargement des fichiers";
        var subtitle =
          path.basename(instance.installerfilename) +
          " - " +
          rb.value +
          rb.unit +
          " / " +
          tb.value +
          tb.unit;
        let state = {
          percentage: parseInt(percentage, 10).toString(),
          total: total_bytes,
          received_bytes: received_bytes,
        };
        if (instance.fupdate)
          instance.update(instance.uuidDl, title, subtitle, state);
        else
          document.dispatchEvent(
            new CustomEvent("update", {
              detail: {
                title: instance.prefix,
                subtitle: subtitle,
                state: state,
              },
            })
          );
      });

      req.on("end", function () {
        if (instance.fupdate) instance.finish(instance.uuidDl);
        resolve(true);
      });
    });
  }

  async extract(instance) {
    return new Promise((resolve) => {
      const onezip = require("onezip");
      const pack = onezip.extract(instance.fileZipDepend, instance.dirServer);

      pack.on("start", () => {});

      pack.on("progress", (state) => {
        var title = instance.prefix + " - Extraction des fichiers";
        var subtitle = "Fichiers extraits (" + state.i + " / " + state.n + ")";
        if (instance.fupdate)
          instance.update(instance.uuidDl, title, subtitle, state);
        else
          document.dispatchEvent(
            new CustomEvent("update", {
              detail: { title: instance.prefix, subtitle, state },
            })
          );
      });

      pack.on("error", (error) => {
        console.error(error);
      });

      pack.on("end", () => {
        if (instance.fupdate) instance.finish(instance.uuidDl);
        resolve(true);
      });
    });
  }

  update(uuidDl, title, subtitle, state) {
    this.title = title;
    this.subtitle = subtitle;
    this.state = state;

    if (this.fupdate) {
      let now = new Date().getTime();
      this.timer = now - this.startTime;
      if (
        document
          .querySelector(".main.connected .content-child .Tasks.sidepage")
          .hasAttribute("rendered")
      ) {
        let domTask = document.querySelector(
          '.downloads .listDls .dl-items[id="' + uuidDl + '"]'
        );
        if (domTask !== null || domTask !== undefined) {
          const meter = domTask.querySelector(".progressBarCircle svg[dataValue] .meter");
          domTask.querySelector(".title").innerHTML = title;
          domTask.querySelector(".subtitle").innerHTML = subtitle;
          domTask.querySelector(".percentage").parentNode.style.display = "block";
          domTask.querySelector("#downloadbar").parentNode.style.display = "block";
          domTask.querySelector(".percentage").innerHTML = state.percentage+"%";
          domTask.querySelector("#downloadbar").style.width = state.percentage + "%";
          let taskOverlay = document.querySelector('.taskOverlay')
          taskOverlay.querySelector('.title').innerHTML = title;
          taskOverlay.querySelector('.subtitle').innerHTML = subtitle;
          taskOverlay.querySelector("#downloadbar").style.width = state.percentage + "%";

          const customEvent = new CustomEvent('task__updated', { detail: { title: title, subtitle: subtitle, state: { percentage: state.percentage } } });
          document.dispatchEvent(customEvent)
        }

      }
    }
  }

  finish(uuidDl) {
    let timeFinish = fzVariable.millisToMinutesAndSeconds(this.timer);
    let domTask = document.querySelector(
      '.downloads .listDls .dl-items[id="' + uuidDl + '"]'
    );
    if (domTask !== null || domTask !== undefined) {
      domTask.querySelector(".title").innerHTML = this.prefix;
      domTask.querySelector(".subtitle").innerHTML = `${(this.lastTask) ? `Terminé, (Temps: ${timeFinish})` : 'En attente'}`
      domTask.querySelector(".percentage").parentNode.style.display = "none";
      domTask.querySelector("#downloadbar").parentNode.style.display = "none";

      //RESET TASK OVERLAY
      let taskOverlay = document.querySelector('.taskOverlay');
      if(this.lastTask) taskOverlay.classList.add('hidden')
      taskOverlay.querySelector(".title").innerHTML = "Récupération des informations";
      taskOverlay.querySelector(".subtitle").innerHTML = "Traitement de la tâche en cours...";
      taskOverlay.querySelector("#downloadbar").style.width = "0%";
    }
  }

  render(task) {
    return (
      <div className="card dl-items" id={task.uuidDl}>
        <div className="card-body flex gap-15 direct-column justif-between">
          <div className="left flex gap-10 align-center">
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
              style={{ width: "0%" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }
}
