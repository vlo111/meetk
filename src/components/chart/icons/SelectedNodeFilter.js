import React, { Component } from 'react';

class SelectedNodeFilter extends Component {
  render() {
    return (
      <filter id="selectedNodeFilter" x="-50%" y="-50%" width="300%" height="300%">
        <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#7166F8" floodOpacity="1">
          <animate
            attributeName="stdDeviation"
            values="1;4;1"
            dur="1s"
            repeatCount="indefinite"
          />
        </feDropShadow>
      </filter>
    );
  }
}

export default SelectedNodeFilter;
