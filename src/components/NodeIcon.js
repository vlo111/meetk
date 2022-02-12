import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ChartUtils from '../helpers/ChartUtils';
import NodeImage from './tabs/content/NodeImage';

class NodeIcon extends Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
    searchIcon: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      error: false,
    };
  }

  handleError = () => {
    this.setState({ error: true });
  }

  render() {
    const { error } = this.state;
    const { node, searchIcon } = this.props;
    const showIcon = node?.icon && !error;
    return (
      <span
        className={`nodeIcon ${node.nodeType} ${showIcon ? 'hasImage' : ''} ${searchIcon ? 'searchIcon' : ''}`}
        style={{ background: !showIcon ? ChartUtils.nodeColor(node) : undefined }}
      >
        {showIcon ? (
          <NodeImage node={node} width={50} height={50} onError={this.handleError} />
        ) : (
          <span className="text">{_.get(node, 'type[0]')}</span>
        )}
      </span>
    );
  }
}

export default NodeIcon;
