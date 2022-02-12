import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Input from '../form/Input';

class MapsSearch extends Component {
  static propTypes = {
    google: PropTypes.object.isRequired,
    onSelect: PropTypes.func,
  }

  static defaultProps = {
    onSelect: () => undefined,
  }

  componentDidMount() {
    const { google } = this.props;
    this.autocomplete = new google.maps.places.Autocomplete(this.input);
    this.placeChangeListener = google.maps.event.addListener(this.autocomplete, 'place_changed', this.handlePlaceChange);
  }

  componentWillUnmount() {
    const { google } = this.props;
    const pacContainer = document.querySelector('.pac-container');
    if (pacContainer) {
      pacContainer.remove();
    }
    google.maps.event.removeListener(this.placeChangeListener);
  }

  handlePlaceChange = () => {
    const place = this.autocomplete.getPlace();
    const {
      name, website, geometry, photos,
      formatted_address: address,
      international_phone_number: phone,
      types,
    } = place;
    if (!geometry) {
      return;
    }
    const location = { lat: geometry.location.lat(), lng: geometry.location.lng() };
    const photo = !_.isEqual(photos) ? photos[0].getUrl({ maxWidth: 1024, maxHeight: 1024 }) : null;
    const type = _.lowerCase(types[0] || '');
    const params = {
      website, name, location, photo, address, type, phone, autoCenter: true,
    };
    this.props.onSelect(params);
  }

  render() {
    return (
      <div id="mapsSearch">
        <Input
          placeholder="Search ..."
          autoComplete="off"
          onRef={(ref) => this.input = ref}
        />
      </div>
    );
  }
}

export default MapsSearch;
