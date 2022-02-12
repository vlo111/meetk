import React, { Component } from 'react';
import ChartUtils from '../helpers/ChartUtils';

class SvgLine extends Component {
  render() {
    const { type } = this.props;
    return (
      type !== 'a1'
        ? (
          <svg
            style={{ width: '83%' }}
            className="link-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 310 18"
            height="18"
            width="310"
          >
            <line
              strokeLinecap={ChartUtils.dashLinecap(type)}
              strokeDasharray={ChartUtils.dashType(type, 2)}
              stroke="#7166F8"
              strokeWidth="2"
              x1="0"
              y1="10"
              x2="310"
              y2="10"
            />
          </svg>
        )
        : (
          <svg
            style={{ width: '83%' }}
            className="link-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 310 50"
            height="50"
            width="310"
          >
            <path d="M0,30 C155,60 155,0 310,30" stroke="#7166F8" fill="transparent" strokeWidth="2" />
          </svg>
        )
    );
  }
}

export default SvgLine;
