import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../form/Button';

class TabContext extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
  }

  render() {
    const { params } = this.props;
    return (
      <>
        <Button
          icon="fa-pencil-square-o"
          onClick={(ev) => this.props.onClick(ev, params.fieldName === '_location' ? 'node.location-edit' : 'node.fields-edit')}
        >
          Edit
        </Button>
        <Button
          icon="fa-trash"
          onClick={(ev) => this.props.onClick(ev, params.fieldName === '_location' ? 'node.location-delete' : 'node.fields-delete')}
        >
          Delete
        </Button>
      </>
    );
  }
}

export default TabContext;
