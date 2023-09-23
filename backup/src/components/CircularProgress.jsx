import "../assets/css/progressBar.scss";
import React from "react";

class CircularProgress extends React.Component {
  constructor(props) {
    super(props);
    this.progress = props.progress !== undefined ? props.progress : 0;
  }

  render() {
    return (
      <>
        <div className="progressBarCircle">
          <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            datavalue={this.progress}
          >
            <circle r="45" cx="50" cy="50" />
            <path
              className="meter"
              d="M5,50a45,45 0 1,0 90,0a45,45 0 1,0 -90,0"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDashoffset="282.78302001953125"
              strokeDasharray="282.78302001953125"
            />
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="20"
            >
              {this.progress}
            </text>
          </svg>
        </div>
      </>
    );
  }
}

export default CircularProgress;
