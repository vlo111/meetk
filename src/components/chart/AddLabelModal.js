import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../form/Button';
import Chart from '../../Chart';
import Validate from '../../helpers/Validate';
import Input from '../form/Input';
import ChartUtils from '../../helpers/ChartUtils';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import ContextMenu from '../contextMenu/ContextMenu';
import { createLabelsRequest } from '../../store/actions/labels';
import { updateNodesPositionRequest } from '../../store/actions/nodes';
import { setActiveButton } from '../../store/actions/app';

class AddLabelModal extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      labelData: {},
      show: false,
      edit: false,
      errors: {},
    };
  }

  static defaultProps = {
    setAvtiveButton: 'create',
  }

  componentDidMount() {
    Chart.event.on('label.new', this.handleLabelCrate);
    ContextMenu.event.on('folder.new', this.handleFolderCrate);
    ContextMenu.event.on('label.edit', this.handleFolderEdit);
    ContextMenu.event.on('folder.selectSquare', this.handleFolderCrateSquare);
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener('folder.new', this.handleFolderCrate);
    ContextMenu.event.removeListener('label.edit', this.handleFolderEdit);
    ContextMenu.event.removeListener('folder.selectSquare', this.handleFolderCrateSquare);
  }

  handleLabelCrate = (ev, d) => {
    if (Chart.isAutoPosition) Chart.isAutoPosition = false;
    this.setState({ show: true, labelData: { ...d } });
  }

  handleFolderCrate = (ev) => {
    if (Chart.isAutoPosition) Chart.isAutoPosition = false;

    const { x, y } = ChartUtils.calcScaledPosition(ev.x, ev.y);
    const labels = Chart.getLabels();
    const id = `f_${ChartUtils.uniqueId(labels)}`;
    const labelData = {
      id,
      color: ChartUtils.labelColors({ id }),
      d: [[x, y], [500, 500]],
      name: '',
      type: 'folder',
    };
    this.setState({ show: true, labelData });
  }

  handleFolderEdit = (ev, labelData) => {
    this.setState({ show: true, labelData, edit: true });
  }

  handleFolderCrateSquare = async (ev, d) => {
    let {
      squareData: {
        x, y, width, height,
      },
    } = d;
    // const links = Chart.getLinks();
    const labels = Chart.getLabels();
    // eslint-disable-next-line prefer-const
    // let { nodes} = await ChartUtils.getNodesWithFiles(
    //   this.props.customFields
    // );

    // nodes = nodes.filter((d) => squareData.nodes.includes(d.id));
    // links = links.filter(
    //   (l) =>
    //     squareData.nodes.includes(l.source) &&
    //     squareData.nodes.includes(l.target)
    // );
    if (width < 200) width = 200;
    if (height < 200) height = 200;
    x += width / 2;
    y += height / 2;
    const id = `f_${ChartUtils.uniqueId(labels)}`;
    const labelData = {
      id,
      color: ChartUtils.labelColors({ id }),
      d: [[x, y], [width, height]],
      name: '',
      type: 'folder',
      open: true,
    };

    this.setState({ show: true, labelData });
  }

  deleteLabel = () => {
    const { labelData, edit } = this.state;
    if (!edit) {
      let labels = Chart.getLabels();
      labels = labels.filter((l) => l.id !== labelData.id);
      Chart.render({ labels });
    }
    this.setState({ show: false, edit: false });
  }

  addLabel = async (ev) => {
    ev.preventDefault();
    const { labelData } = this.state;
    const { setAvtiveButton } = this.props;

    const labels = [...Chart.getLabels()];
    const errors = {};
    [errors.name, labelData.name] = Validate.labelName(labelData.name);
    labelData.new = true;
    if (!Validate.hasError(errors)) {
      const i = labels.findIndex((l) => l.id === labelData.id);
      if (i > -1) {
        labels[i] = labelData;
      } else {
        labelData.update = true;
        labels.push(labelData);
      }
      const nodes = Chart.getNodes();
      if (labelData.type === 'folder') {
        nodes.push({
          fake: true,
          fx: labelData.d[0][0] + 30,
          fy: labelData.d[0][1] + 30,
          id: `fake_${labelData.id}`,
          labels: [labelData.id],
        });
      }
      Chart.render({ labels, nodes });
      this.setState({ show: false });
      this.props.setActiveButton(setAvtiveButton);
    }
    this.setState({ errors });
  }

  handleChange = (path, value) => {
    const { labelData, errors } = this.state;
    _.set(labelData, path, value);
    _.remove(errors, path);
    this.setState({ labelData, errors });
  }

  render() {
    const {
      labelData, errors, show, edit,
    } = this.state;
    if (!show) {
      return null;
    }
    return (
      <Modal
        className="ghModal newFolder"
        overlayClassName="ghModalOverlay"
        isOpen
        onRequestClose={this.deleteLabel}
      >
        <div className="containerModal">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.deleteLabel} />
          <form className="form" onSubmit={this.addLabel}>
            <h2>
              {labelData.type === 'folder'
                ? (edit ? 'Edit Folder' : 'Add New Folder')
                : (edit ? 'Edit Label' : 'Add New label')}
            </h2>
            <Input
              value={labelData.name}
              error={errors.name}
              label="Name"
              onChangeText={(v) => this.handleChange('name', v)}
            />
            <div className="buttons">
              <Button className="btn-delete" onClick={this.deleteLabel}>
                Cancel
              </Button>
              <Button className="ghButton accent  btn-classic" type="submit">
                Save
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  graphId: state.graphs.singleGraph.id,
});
const mapDispatchToProps = {
  createLabelsRequest,
  updateNodesPositionRequest,
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddLabelModal);

export default Container;
