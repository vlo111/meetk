import React, { Component } from 'react';
import ReactCrop from 'react-image-crop';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ContextMenu from '../contextMenu/ContextMenu';
import Button from '../form/Button';
import Chart from '../../Chart';
import { setActiveButton, setGridIndexes } from '../../store/actions/app';
import ChartUtils from '../../helpers/ChartUtils';
import 'react-image-crop/dist/ReactCrop.css';

class Crop extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      active: false,
      crop: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    };
  }

  componentDidMount() {
    ContextMenu.event.on('crop', this.enableCrop);
  }

  handleCropChange = (crop) => {
    this.setState({ crop });
  }

  enableCrop = async () => {
    // fix react-image-crop issue
    await this.setState({ active: true });

    this.setState({ active: true });
  }

  cancel = () => {
    this.setState({ active: false });
  }

  crop = () => {
    const { crop } = this.state;
    let nodes = Chart.getNodes();
    let links = Chart.getLinks();
    const {
      x, y, width, height,
    } = crop;
    const { x: x1, y: y1 } = ChartUtils.calcScaledPosition(x, y);
    const { x: x2, y: y2 } = ChartUtils.calcScaledPosition(x + width, y + height);

    nodes = nodes.map((d, i) => {
      d.index = i;
      return d;
    });
    nodes = nodes.filter((d) => d.fx >= x1 && d.fx < x2 && d.fy >= y1 && d.fy < y2);
    this.props.setGridIndexes('nodes', nodes.map((d) => d.index));

    const nodeIds = nodes.map((d) => d.id);
    links = links.map((d, i) => {
      d.index = i;
      return d;
    });
    links = links.filter((d) => nodeIds.includes(d.target) && nodeIds.includes(d.source));
    this.props.setGridIndexes('links', links.map((d) => d.index));

    this.props.setActiveButton('dataexport');
    this.setState({ active: false });
  }

  render() {
    const { crop, active } = this.state;
    if (!active) {
      return null;
    }
    return (
      <ReactCrop
        className="chartCrop"
        crop={crop}
        onChange={this.handleCropChange}
        renderComponent={<div />}
      >
        <div className="ReactCrop__drag-elements" />
        <div className="content">
          <div className="buttons">
            <Button icon="fa-times" onClick={this.cancel}>Cancel</Button>
            <Button icon="fa-save" onClick={this.crop}>Crop</Button>
          </div>
        </div>
      </ReactCrop>
    );
  }
}

const mapStateToProps = () => ({});
const mapDispatchToProps = {
  setGridIndexes,
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Crop);

export default Container;
