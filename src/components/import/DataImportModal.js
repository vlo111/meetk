import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { setActiveButton } from '../../store/actions/app';
import { convertGraphRequest } from '../../store/actions/graphs';
import ImportXlsx from './ImportXlsx';
import Button from '../form/Button';
import ImportGoogle from './ImportGoogle';
import ImportLinkedin from './ImportLinkedin';
import ImportZip from './ImportZip';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Select from '../form/Select';
import { IMPORT_TYPES } from '../../data/import';
import withGoogleMap from '../../helpers/withGoogleMap';
import Utils from '../../helpers/Utils';

class DataImportModal extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
    google: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'xlsx',
      nextStep: true,
      initCurrentStep: true,
    };
  }

  closeModal = () => {
    this.props.setActiveButton('create');
    this.setState({
      initCurrentStep: true,
    });
  }

  setActiveTab = (activeTab) => {
    this.setState({ activeTab });
  }

  showSelectHandler = (param) => {
    this.setState({
      nextStep: param,
      initCurrentStep: param,
    });
  }

  /**
   * @param {{maps:object, LatLng:function, Geocoder:function,}} google
   * @param {{PlacesService:function,}} maps.places
   * @param {{PlacesService:object,}} nodes
   */
  getNodesLocation = async (nodes) => {
    const { google } = this.props;

    const geocoderService = new google.maps.Geocoder();

    const getLocations = nodes.map(async (node) => {
      if (!_.isEmpty(node.location)) {
        const { location } = node;

        const map = new google.maps.Map(
          document.createElement('div'),
          {
            center: new google.maps.LatLng(parseFloat(location.lat),
              parseFloat(location.lng)),
            zoom: 5,
          },
        );

        const placesService = new google.maps.places.PlacesService(map);

        const { address, location: { lat, lng } } = await Utils.getPlaceInformation(location, geocoderService, placesService);

        if (address) {
          node.location = {
            address,
            lat,
            lng,
          };
        } else {
          node.location = undefined;
        }
      }

      return node;
    });

    await Promise.resolve(getLocations);
  }

  render() {
    const { activeTab, nextStep, initCurrentStep } = this.state;
    const { activeButton } = this.props;

    if (!nextStep && initCurrentStep) {
      this.setState({
        nextStep: true,
      });
    }

    return (
      <Modal
        isOpen={activeButton === 'import'}
        className="ghModal ghImportModal"
        overlayClassName="ghModalOverlay"
        onRequestClose={this.closeModal}
      >
        <div className="containerModal">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeModal} />
          <div className="form">

            <h2>Import Data</h2>

            {nextStep && (
              <Select
                containerClassName="importSelectLbl"
                portal
                options={IMPORT_TYPES}
                value={IMPORT_TYPES.filter((t) => t.value === activeTab)}
                onChange={(v) => this.setActiveTab(v.value)}
              />
            )}
            {activeTab === 'zip' ? <ImportZip getNodesLocation={this.getNodesLocation} showSelectHandler={this.showSelectHandler} /> : null}
            {activeTab === 'xlsx' ? <ImportXlsx getNodesLocation={this.getNodesLocation} showSelectHandler={this.showSelectHandler} /> : null}
            {activeTab === 'google' ? <ImportGoogle getNodesLocation={this.getNodesLocation} showSelectHandler={this.showSelectHandler} /> : null}
            {activeTab === 'linkedin' ? <ImportLinkedin /> : null}
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
});
const mapDispatchToProps = {
  setActiveButton,
  convertGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withGoogleMap(DataImportModal));

export default Container;
