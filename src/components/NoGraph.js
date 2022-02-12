import React, { Component } from 'react';
import noGraphSvg from '../assets/images/NotGraph.png';

class NoGraph extends Component {
  static propTypes = {

  }

  constructor(props) {
    super(props);
    this.state = {
      graphs: [],
    };
  }

  render() {
    return (
      <div className="no-graphs">
        <img src={noGraphSvg} className="no-graph-img" alt="No Graphs" />
        <h1 className="title">You don’t have Graphs</h1>
      </div>

    );
  }
}

export default NoGraph;
