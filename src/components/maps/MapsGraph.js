import React, { Component } from 'react';
import {
  Map, Polyline, Marker, InfoWindow,
} from 'google-maps-react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import Button from '../form/Button';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { previousActiveButton } from '../../store/actions/app';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';
import Api from '../../Api';
import NodeIcon from '../NodeIcon';
import withGoogleMap from '../../helpers/withGoogleMap';
import MapsStyle from './MapsStyle';

class MapsGraph extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    google: PropTypes.object.isRequired,
    previousActiveButton: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      activeNode: {},
      initLocation: {
        lat: 40.1872023,
        lng: 44.51520,
      },
    };
  }

  handleMapClick = () => {
    const { activeNode } = this.state;
    if (activeNode?.marker) {
      this.setState({ activeNode: {} });
    }
  }

  handleMarkerClick = (props, marker, ev, node) => {
    this.setState({
      activeNode: { marker, node },
    });

    const queryObj = queryString.parse(window.location.search);
    queryObj.info = node.id;
    const query = queryString.stringify(queryObj);
    this.props.history.replace(`?${query}`);
  }

  onReady = () => {
    try {
      const { google } = this.props;
      const coordinate = [];

      const nodes = Chart.getNodes();

      nodes.filter((d) => d.location).forEach((d) => coordinate.push(new google.maps.LatLng(d.location.lat, d.location.lng)));

      const bounds = new google.maps.LatLngBounds();

      for (let i = 0; i < coordinate.length; i++) {
        bounds.extend(coordinate[i]);
      }

      this.setState({ bounds });
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    const { activeNode, bounds } = this.state;
    const { initLocation } = this.state;
    const { google, location: { pathname } } = this.props;
    // let nodes = Chart.getNodes().filter((d) => d.location).map((d) => {
    //   d.locationObj = _.isObject(d?.location) && d?.location?.map((p) => ({ lat: p.location.lat, lng: p.location.lng }));
    //   if (d?.location?.length > 0) {
    //     initLocation = (d?.location?.map((p) => ({ lat: p.location.lat, lng: p.location.lng })));
    //   }
    //   return d;
    // });
    let nodes = Chart.getNodes().filter((d) => d.location);

    const links = Chart.getLinks().map((d) => {
      const source = ChartUtils.getNodeById(d.source);
      const target = ChartUtils.getNodeById(d.target);
      if (source.location && target.location) {
        const locationObj1 = source.location;
        const locationObj2 = target.location;
        d.locations = [locationObj1, locationObj2];
      }
      return d;
    }).filter((d) => d.locations);
    nodes = _.uniqBy(nodes, 'name');
    if (_.isEmpty(nodes)) {
      return null;
    }
    const updateLocation = pathname.startsWith('/graphs/update/');

    return (
      <div
        id="mapsGraph"
        style={updateLocation ? {
          left: '0px',
          width: 'calc(100% - 0px)',
        } : {
          left: '2px',
          width: 'calc(100% - 2px)',
        }}
      >
        <Map
          styles={MapsStyle.mapStyle}
          google={google}
          zoom={7}
          initialCenter={initLocation}
          streetViewControl={false}
          fullscreenControl={false}
          onClick={this.handleMapClick}
          bounds={bounds}
          onReady={this.onReady}
        >
          {links.map((d) => (
            <Polyline
              key={d.index}
              path={d.locations}
              strokeColor={ChartUtils.linkColor(d)}
              strokeWeight={d.value * 2 || 2}
            />
          ))}
          {nodes.map((d) => (
            <Marker
              key={d.name}
              name={d.name}
              position={d.location}
              title={d.name}
              onClick={(props, marker, ev) => this.handleMarkerClick(props, marker, ev, d)}
              icon={{
                url: `${Api.url}/public/markers/${ChartUtils.nodeColor(d).replace('#', '')}.svg`,
                anchor: new google.maps.Point(25, 35),
                scaledSize: new google.maps.Size(50, 50),
              }}
            />
          ))}
          <InfoWindow visible={!!activeNode.marker} marker={activeNode.marker}>
            {activeNode?.node ? (
              <div className="googleMapDescription">
                <div className="left">
                  <NodeIcon node={activeNode.node} />
                </div>
                <div className="right">
                  <h3>{activeNode.node.name}</h3>
                  <h4>{activeNode.node.type}</h4>
                </div>
              </div>
            ) : <span />}
          </InfoWindow>
        </Map>
        <Button className="closeMap" icon={<CloseSvg />} onClick={this.props.previousActiveButton} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  previousActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapsGraph);

export default withRouter(withGoogleMap(Container));
