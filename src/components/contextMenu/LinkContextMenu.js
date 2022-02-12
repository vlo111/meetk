import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../form/Button';

class LinkContextMenu extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
  }

  render() {
    return (
      <>
        <Button icon="fa-pencil-square-o" onClick={(ev) => this.props.onClick(ev, 'link.edit')}>
          Edit
        </Button>
      </>
    );
  }
}

export default LinkContextMenu;
