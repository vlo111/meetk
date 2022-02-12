import React, { Component } from 'react';
import Modal from 'react-modal';
import { Marker, Map } from 'google-maps-react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { toast } from 'react-toastify';
import MapsSearch from './MapsSearch';
import markerImg from '../../assets/images/icons/marker.svg';
import withGoogleMap from '../../helpers/withGoogleMap';
import Button from '../form/Button';
import Utils from '../../helpers/Utils';
import MapsStyle from './MapsStyle';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';

class MapsLocationPicker extends Component {
  static propTypes = {
    google: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
  }

  static defaultProps = {
    value: '',
  }

  initPosition = memoizeOne((value) => {
    if (_.isObject(value)) {
      this.setState({ selected: value });
    }
  })

  constructor(props) {
    super(props);
    this.state = {
      selected: {},
      initialCenter: null,
    };
  }

  componentDidMount() {
    this.setCurrentLocation();
  }

  setCurrentLocation = async () => {
    const { value } = this.props;
    if (_.isObject(value)) {
      const { lat, lng } = value;
      this.setState({ initialCenter: { lat, lng } });
      return;
    }
    try {
      const { coords } = await Utils.getCurrentPosition();
      const initialCenter = { lat: coords.latitude, lng: coords.longitude };

      this.setState({ initialCenter });
    } catch (e) {
      this.setState({ initialCenter: undefined });
    }
  }

  handleSearchSelect = (selected) => {
    this.setState({ selected });
  }

  handleSelect = async () => {
    let { selected } = this.state;

    if (!selected.location) {
      toast.error('Don`t selected location ');
      return;
    }

    if (!selected.name) {
      selected = await Utils.getPlaceInformation(selected.location, this.geocoderService, this.placesService);
    }

    this.props.onChange(selected);

    this.props.onClose();
  }

  handleLocationChange = (props, map, ev) => {
    const location = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };
    this.setState({ selected: { location } });
  }

  handleMapReady = (props, map) => {
    const { google } = props;
    this.placesService = new google.maps.places.PlacesService(map);
    this.geocoderService = new google.maps.Geocoder();
  }

  render() {
    const { selected, initialCenter } = this.state;
    const {
      google, value,
    } = this.props;

    this.initPosition(value);

    return (
      <Modal
        isOpen
        className="ghModal ghMapsModal ghMapsLocationPicker"
        overlayClassName="ghModalOverlay ghMapsModalOverlay"
        onRequestClose={this.props.onClose}
      >
        {!_.isNull(initialCenter) ? (
          <>
            <Map
              styles={MapsStyle.mapStyle}
              google={google}
              zoom={17}
              streetViewControl={false}
              fullscreenControl={false}
              onClick={this.handleLocationChange}
              center={selected.autoCenter ? selected.location : undefined}
              initialCenter={initialCenter}
              onReady={this.handleMapReady}
            >
              {!_.isEmpty(selected) ? (
                <Marker
                  title={selected.name}
                  name={selected.name}
                  position={selected.location}
                  draggable
                  onDragend={this.handleLocationChange}
                  icon={{
                    url: markerImg,
                    anchor: new google.maps.Point(25, 35),
                    scaledSize: new google.maps.Size(50, 50),
                  }}
                />
              ) : null}
              <MapsSearch google={google} onSelect={this.handleSearchSelect} />
            </Map>
            <Button className="selectLocation" onClick={this.handleSelect}>Select</Button>
            <Button
              color="transparent"
              className="close selectLocationClose"
              icon={<CloseSvg />}
              onClick={this.props.onClose}
            />
          </>
        ) : null}
      </Modal>
    );
  }
}

export default withGoogleMap(MapsLocationPicker);
