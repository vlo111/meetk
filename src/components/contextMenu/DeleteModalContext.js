import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../form/Button';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { setActiveButton, toggleDeleteState } from '../../store/actions/app';
import ContextMenu from './ContextMenu';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';
import Api from '../../Api';

class AddLabelModal extends Component {
  static propTypes = {
    toggleDeleteState: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
    graphId: PropTypes.number.isRequired,
  }

  closeDelete = () => {
    this.props.setActiveButton('create');
  }

  remove = () => {
    const {
      data, params, params: { squareData }, graphId,
    } = this.props;

    if (data.type === 'selectSquare.delete') {
      let nodes = Chart.getNodes();
      let links = Chart.getLinks();
      let labels = Chart.getLabels();

      let x;
      let y;
      let width;
      let height;

      labels = labels.filter((l) => {
        if (squareData.labels.includes(l.id)) {
          const { size } = l;

          if (l.sourceId) {
            Chart.data.embedLabels = Chart.data.embedLabels.filter((d) => d.labelId !== l.id);
            Api.labelDelete(l.sourceId, l.id, graphId);
            return;
          }

          if (l.type === 'square' || l.type === 'ellipse') {
            x = size.x;
            y = size.y;
            width = size.width;
            height = size.height;
          } else if (l.type === 'folder') {
            if (l.open) {
              width = l.d[1][0];
              height = l.d[1][1];

              x = l.d[0][0] - (width / 2);
              y = l.d[0][1] - (height / 2);
            } else {
              x = l.d[0][0];
              y = l.d[0][1];

              height = 60;
              width = 60;
            }
          } else {
            const labelSize = Chart.getDimensionsLabelDatum(l.d);

            x = labelSize.minX;
            y = labelSize.minY;
            width = labelSize.width;
            height = labelSize.height;
          }

          return this.checkSize(x, y, width, height, squareData);
        }
        return true;
      });

      nodes = nodes.filter((d) => d.sourceId || !squareData.nodes.includes(d.id));
      links = ChartUtils.cleanLinks(links, nodes);

      Chart.render({ labels, links, nodes });
    } else if (data.type === 'selectNode.delete') {
      let nodes = Chart.getNodes();
      let links = Chart.getLinks();
      nodes = nodes.filter((d) => d.sourceId || !squareData.selectedNodes.includes(d.id));
      links = ChartUtils.cleanLinks(links, nodes);
      Chart.render({ links, nodes });
    } else {
      params.contextMenu = true;
      ContextMenu.event.emit(data.type, data.ev, { ...params });
    }

    this.props.toggleDeleteState(true);
    this.props.setActiveButton('create');
  }

  module = (x, y) => {
    if (x < 0) {
      y += (x * (-1));
      x *= (-1);
    }

    if (y < 0) {
      x += (y * (-1));
      y *= (-1);
    }
    return { x, y };
  }

  checkSize = (x, y, width, height, square) => {
    // const modeleLabel = this.module(x, y);
    //
    // x = modeleLabel.x;
    // y = modeleLabel.y;
    //
    // const moduleSquare = this.module(square.x, square.y);
    //
    // square.x = moduleSquare.x;
    // square.y = moduleSquare.y;

    if (x > square.x
      && y > square.y
      && (x + width) < (square.x + square.width)
      && (y + height) < (square.y + square.height)) {
      return false;
    }
    return true;
  }

  render() {
    const {
      activeButton, data, params, params: { squareData },
    } = this.props;

    if (activeButton !== 'deleteModal') {
      return null;
    }
    return (
      <Modal
        className="ghModal deleteModal"
        overlayClassName="ghModalOverlay"
        isOpen
        onRequestClose={this.closeDelete}
      >
        <div className="containerModal">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeDelete} />
          <div className="form">
            <h2>Are you sure ?</h2>
            <p>
              Do you want to remove this
              {' '}
              {['selectSquare.delete', 'selectNode.delete'].includes(data.type) ? 'part' : (params.type == 'folder' ? 'folder' : data.type.replace('.delete', ''))}
            </p>
            <div className="buttons">
              <Button className="btn-delete" onClick={this.closeDelete}>
                Cancel
              </Button>
              <Button className="btn-classic" type="submit" onClick={this.remove}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  graphId: state.graphs.singleGraph.id,
});
const mapDispatchToProps = {
  setActiveButton,
  toggleDeleteState,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddLabelModal);

export default Container;
