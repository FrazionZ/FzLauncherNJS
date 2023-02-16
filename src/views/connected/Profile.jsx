import React from "react";
import { Badge } from "flowbite-react";
import {
  FaArrowCircleRight,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import Infos from "./profile/Infos";
import Apparence from "./profile/Apparence";
import Router from "../../components/Router";
import FzVariable from "../../components/FzVariable";
import FzToast from "../../components/FzToast";
import Auth from "../../components/Auth";

export default class Profile extends React.Component {
  state = {
    avatar: null,
  };

  constructor(props) {
    super(props);
    this.sidebar = props.sidebar;
    this.session = JSON.parse(sessionStorage.getItem("user"));
    this.auth = new Auth();
    this.subpages = [
      {
        component: (
          <Infos
            session={this.session}
            sidebar={this.sidebar}
            parentClass={this}
          />
        ),
        name: "Infos",
        url: "/infos",
        title: "Informations",
        active: true,
        root: undefined,
      },
      {
        component: (
          <Apparence
            session={this.session}
            sidebar={this.sidebar}
            parentClass={this}
          />
        ),
        name: "Apparence",
        url: "/apparence",
        title: "Apparence",
        active: false,
        root: undefined,
      },
    ];
    this.appRouter = props.appRouter;
    this.fzVariable = new FzVariable();
    this.changePage = this.changePage.bind(this);
  }

  async componentDidMount() {
    this.setState({
      avatar: `https://auth.frazionz.net/skins/face.php?${Math.random().toString(
        36
      )}&u=${this.session.id}`,
    });
    this.router = await new Router({
      domParent: document.querySelector(".profile .subpages"),
      multipleSubDom: true,
      keySubDom: "subpages",
    });
    this.router.setPages(this.subpages);
    this.router.showPage("/infos");
  }

  async changePage(instance) {
    document
      .querySelector(".profile .menu li.item.active")
      .classList.remove("active");
    instance.target.parentNode.classList.add("active");
    this.router.showPage(instance.target.getAttribute("dhref"));
  }

  render() {
    return (
      <div className="profile">
        <div className="head-infos">
          <div className="avatar">
            <img className="rounded-lg" src={this.state.avatar} alt="avatar" />
            <div className="datas">
              <span className="text-3xl">{this.session.username}</span>
              <div className="fast-infos">
                <Badge
                  color="info"
                  className={`badge w-fit`}
                  size="sm"
                  style={{ backgroundColor: this.session.role.color }}
                >
                  {this.session.role.name}
                </Badge>
                <Badge
                  color="info"
                  className={`badge w-fit`}
                  size="sm"
                  style={{ backgroundColor: "var(--color-2)" }}
                >
                  {this.session.TwoFA && <FaCheckCircle />}
                  {!this.session.TwoFA && <FaTimesCircle />}
                  <span>2FA</span>
                </Badge>
              </div>
            </div>
          </div>
          <div className="content-general">
            <div className="flex justify-between"></div>
            <div className="ui top attached tabular nav nav-pills mb-3 menu">
              {this.subpages.map((item, key) => (
                <li
                  key={key}
                  className={`item ${item.active ? "active" : ""}`}
                  data-tab={item.name}
                >
                  <a onClick={this.changePage} dhref={item.url}>
                    {item.title}
                  </a>
                </li>
              ))}
            </div>
            <div className="subpages pb-[4rem]"></div>
          </div>
        </div>
      </div>
    );
  }
}
