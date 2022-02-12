import React, { Component } from 'react';
import Modal from 'react-modal';
import { Marker, Map } from 'google-maps-react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import ReactDOMServer from 'react-dom/server';
import MapsSearch from './MapsSearch';
import markerImg from '../../assets/images/icons/marker.svg';
import ChartUtils from '../../helpers/ChartUtils';
import { setActiveButton, toggleNodeModal } from '../../store/actions/app';
import Utils from '../../helpers/Utils';
import Loading from '../Loading';
import withGoogleMap from '../../helpers/withGoogleMap';
import MapsContactCustomField from './MapsContactCustomField';
import MapsStyle from './MapsStyle';
import Button from '../form/Button';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';

class MapsModal extends Component {
  static propTypes = {
    google: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      // map: null,
      markerDrag: false,
      selected: null,
      initialCenter: null,
      virtualMarkerPos: [],
    };
    this.events = {};
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleMouseMove);
    this.setCurrentLocation();
  }

  componentWillUnmount() {
    // const { google } = this.props;
    // _.forEach(this.events, (ev) => {
    //   google.maps.event.removeListener(ev);
    // });
    // document.removeEventListener('mouseup', this.handleMouseUp);
    // document.removeEventListener('mousemove', this.handleMouseMove);
  }

  setCurrentLocation = async () => {
    try {
      const { coords } = await Utils.getCurrentPosition();
      const initialCenter = { lat: coords.latitude, lng: coords.longitude };

      this.setState({ initialCenter });
    } catch (e) {
      this.setState({ initialCenter: undefined });
    }
  }

  handleMouseUp = async (ev) => {
    const { markerDrag } = this.state;
    let { selected } = this.state;
    if (!markerDrag) return;
    const { clientX, clientY } = ev;
    const { x, y } = ChartUtils.calcScaledPosition(clientX, clientY);

    this.setState({ markerDrag: false });
    this.close();

    if (!selected.name) {
      selected = await Utils.getPlaceInformation(selected.location, this.geocoderService, this.placesService);
    }
    const url = Utils.wikiContentUrlByName(selected.name);
    const wikiData = await Utils.getWikiContent(url);

    const contact = ReactDOMServer.renderToString(<MapsContactCustomField data={selected} wikiData={wikiData} />);

    this.props.toggleNodeModal({
      fx: x,
      fy: y,
      name: selected.name,
      icon: selected.photo,
      type: selected.type,
      location: selected,
      customFields: [{
        name: 'About',
        subtitle: '',
        value: contact,
      }],
    });
  }

  handleMarkerMouseDown = async (ev) => {
    const { clientX, clientY } = ev;
    this.setState({ markerDrag: true, virtualMarkerPos: [clientX, clientY] });
  }

  handleMapReady = (props, map) => {
    const { google } = props;
    this.placesService = new google.maps.places.PlacesService(map);
    this.geocoderService = new google.maps.Geocoder();
    // this.setState({ map });
  }

  handleSearchSelect = (selected) => {
    this.setState({ selected });
  }

  handleMouseMove = (ev) => {
    const { markerDrag } = this.state;
    if (!markerDrag) return;
    const { clientX, clientY } = ev;
    this.setState({ virtualMarkerPos: [clientX, clientY] });
  }

  handleClick = (props, map, ev) => {
    const location = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };
    const selected = {
      location,
    };
    this.setState({ selected });
  }

  close = () => {
    this.props.setActiveButton('create');
  }

  render() {
    const {
      selected, markerDrag, virtualMarkerPos, initialCenter,
    } = this.state;
    const { google } = this.props;
    return (
      <>
        <Modal
          isOpen
          className="ghModal ghMapsModal"
          overlayClassName={`ghModalOverlay ghMapsModalOverlay ${markerDrag ? 'hidden' : ''}`}
          onRequestClose={this.close}
        >
          {!_.isNull(initialCenter) ? (
            <Map
              styles={MapsStyle.mapStyle}
              google={google}
              zoom={5}
              streetViewControl={false}
              fullscreenControl={false}
              onClick={this.handleClick}
              center={selected?.autoCenter ? selected.location : undefined}
              initialCenter={initialCenter}
              onReady={this.handleMapReady}
            >
              {selected ? (
                <Marker
                  title={selected.name}
                  name={selected.name}
                  onMousedown={this.handleMarkerMouseDown}
                  position={selected.location}
                  draggable
                  icon={{
                    url: markerImg,
                    anchor: new google.maps.Point(25, 35),
                    scaledSize: new google.maps.Size(50, 50),
                  }}
                />
              ) : null}
              <MapsSearch google={google} onSelect={this.handleSearchSelect} />
            </Map>
          ) : <Loading />}
          <Button
            color="transparent"
            className="close selectLocationClose"
            icon={<CloseSvg />}
            onClick={this.close}
          />
        </Modal>
        {markerDrag ? (
          <img
            src={markerImg}
            style={{ left: virtualMarkerPos[0], top: virtualMarkerPos[1] }}
            className="ghMapsModalVirtualMarker"
            alt="marker"
          />
        ) : null}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  toggleNodeModal,
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapsModal);

export default withGoogleMap(Container);
