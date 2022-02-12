import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../form/Button';

class NodeContextMenu extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
  }

  render() {
    const { params } = this.props;
    return (
      <>
        {!params.readOnly && params.nodeType === 'infography' ? (
          <Button icon="fa-arrows" onClick={(ev) => this.props.onClick(ev, 'node.resize')}>
            Resize
          </Button>
        ) : null}
        {!params.readOnly ? (
          <Button icon="fa-pencil-square-o" onClick={(ev) => this.props.onClick(ev, 'node.edit')}>
            Edit
          </Button>
        ) : null}
        {params.link ? (
          <Button icon="fa-link" title={params.link}>
            <a href={params.link} target="_blank" rel="noopener noreferrer">
              Open Link
            </a>
          </Button>
        ) : null}
      </>
    );
  }
}

export default NodeContextMenu;
