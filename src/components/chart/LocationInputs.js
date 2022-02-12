import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip';
import withGoogleMap from '../../helpers/withGoogleMap';
import MapsLocationPicker from '../maps/MapsLocationPicker';
import MapImg from '../../assets/images/icons/google-maps.svg';

class LocationInputs extends Component {
  static propTypes = {
    value: PropTypes.string,
    error: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  }

  static defaultProps = {
    value: '',
    error: undefined,
  }

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  handleChange = (value) => {
    this.props.onChange(value);
    this.setState({ open: false });
  }

  toggleMap = () => {
    const { open } = this.state;
    this.setState({ open: !open });
  }

  render() {
    const { open } = this.state;
    const { value } = this.props;
    return (
      <div className="locationInputsWrapper">
        <Tooltip overlay="Select Location">
          <img
            onClick={this.toggleMap}
            className={`button ${value ? 'selected' : ''}`}
            src={MapImg}
            alt="google map"
            width="35"
          />
        </Tooltip>
        {open ? (
          <MapsLocationPicker
            onClose={this.toggleMap}
            value={value}
            onChange={this.handleChange}
          />
        ) : null}
      </div>
    );
  }
}

export default withGoogleMap(LocationInputs);
