import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Filters from '../filters/Filters';

class GraphHeader extends Component {
  render() {
    const { left, right } = this.props;
    return (
      <header id="graphHeader">
        <div className="left">
          {left}
          <div id="headerPortalLeft" />
        </div>
        <div className="right">
          {right}
          <div id="headerPortalRight" />
          <Link className="ghButton" to="/">graphs list</Link>
        </div>
      </header>
    );
  }
}

export default GraphHeader;
