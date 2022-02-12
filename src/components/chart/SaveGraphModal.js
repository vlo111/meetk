import React, { Component } from 'react';
import _ from 'lodash';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import memoizeOne from 'memoize-one';
import { toast } from 'react-toastify';
import moment from 'moment';
import Switch from 'rc-switch';
import Button from '../form/Button';
import Chart from '../../Chart';
import Input from '../form/Input';
import Utils from '../../helpers/Utils';
import {
  createGraphRequest,
  getSingleGraphRequest,
  updateGraphRequest,
  updateGraphThumbnailRequest,
  deleteGraphRequest,
} from '../../store/actions/graphs';
import { setActiveButton, setLoading } from '../../store/actions/app';
import Select from '../form/Select';
import { GRAPH_STATUS } from '../../data/graph';
import ChartUtils from '../../helpers/ChartUtils';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import 'rc-switch/assets/index.css';
import ImageUploader from '../ImageUploader';

class SaveGraphModal extends Component {
  static propTypes = {
    createGraphRequest: PropTypes.func.isRequired,
    updateGraphThumbnailRequest: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    updateGraphRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    toggleModal: PropTypes.func.isRequired,
    setLoading: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
  }

  initValues = memoizeOne((singleGraph) => {
    const {
      title, description, status, publicState,
    } = singleGraph;

    this.setState({
      requestData: {
        title,
        description,
        publicState,
        status: status === 'template' ? 'active' : status,
      },
    });
  })

  constructor(props) {
    super(props);
    this.state = {
      requestData: {
        title: '',
        description: '',
        status: 'active',
        publicState: false,
        disabled: false,
      },
      image: '',
    };
  }

  async deleteGraph(graphId) {
    try {
      if (window.confirm('Are you sure?')) {
        await this.props.deleteGraphRequest(graphId);
        this.props.history.push('/');
        toast.info('Successfully deleted');
      }
    } catch (e) {}
  }

  onChange = (value, event) => {
    const { requestData } = this.state;
    _.set(requestData, 'publicState', value);
    this.setState({ requestData });
  }

  getNodesAndFiles = async () => {
    let nodes = Chart.getNodes();
    const icons = await Promise.all(nodes.map((d) => {
      if (d.icon && d.icon.startsWith('blob:')) {
        return Utils.blobToBase64(d.icon);
      }
      return d.icon;
    }));
    let files = {};
    let fIndex = new Date().getTime();
    nodes = nodes.map((d, i) => {
      d.icon = icons[i];
      d.description = d.description.replace(/\shref="(blob:[^"]+)"/g, (m, url) => {
        fIndex += 1;
        files[fIndex] = Utils.blobToBase64(url);
        return ` href="<%= file_${fIndex} %>"`;
      });
      return d;
    });
    files = await Promise.allValues(files);
    return { nodes, files };
  }

  saveGraph = async (status, forceCreate) => {
    const { requestData, image } = this.state;
    const { match: { params: { graphId } } } = this.props;

    this.props.setLoading(true);
    const labels = Chart.getLabels();
    const svg = ChartUtils.getChartSvg();
    let resGraphId;
    if (image) {
      await this.props.updateGraphThumbnailRequest(graphId, image, 'medium', true);
    }
    if (forceCreate || !graphId) {
      const { payload: { data } } = await this.props.createGraphRequest({
        ...requestData,
        status,
        svg,
        graphId,
      });
      resGraphId = data.graphId;
    } else {
      const { payload: { data } } = await this.props.updateGraphRequest(graphId, {
        ...requestData,
        labels,
        status,
        svg,
      });
      resGraphId = data.graphId;
    }

    if (resGraphId) {
      toast.info('Successfully saved');
      // const svgBig = Chart.printMode(800, 446);
      // this.props.updateGraphThumbnailRequest(resGraphId, svg);
      this.props.onSave(resGraphId);
      this.props.history.push('/');
    } else {
      toast.error('Something went wrong. Please try again');
    }
    this.props.setLoading(false);
    this.props.toggleModal(false);
    this.props.setActiveButton('create');
  }

  handleChange = async (path, value) => {
    const { match: { params: { graphId } } } = this.props;
    const { requestData } = this.state;
    if (path == 'image') {
      if (value == '') {
        const svg = ChartUtils.getChartSvg();
        await this.props.updateGraphThumbnailRequest(graphId, svg, 'small');
      }
      this.setState({ [path]: value });
      _.set(requestData, 'defaultImage', true);
    } else {
      _.set(requestData, path, value);
      this.setState({ requestData });
    }
  }

  render() {
    const { match: { params: { graphId } }, singleGraph } = this.props;
    const { requestData, disabled, image } = this.state;
    const nodes = Chart.getNodes();
    this.initValues(singleGraph);
    const { publicState } = singleGraph;
    const canSave = nodes.length && requestData.title;
    const isUpdate = !!singleGraph.id;
    const isTemplate = singleGraph.status === 'template';
    return (
      <Modal
        className="ghModal ghModalEdit"
        overlayClassName="ghModalOverlay"
        isOpen
        onRequestClose={() => this.props.toggleModal(false)}
      >
        <Button color="$color-accent" className="close" icon={<CloseSvg />} onClick={() => this.props.toggleModal(false)} />
        <div className="form">
          <div>
            <ImageUploader
              value={image || `${singleGraph.thumbnail}?t=${moment(graph.updatedAt).unix()}`}
              onChange={(val) => this.handleChange('image', val)}
            />
          </div>
          <div className="impData">
            <Input
              className="graphinputName"
              value={requestData.title}
              onChangeText={(v) => this.handleChange('title', v)}
            />
            <label className="switchLabel">
              <span className="switchPublic">Publish graph</span>
              <div>
                <Switch
                  onChange={this.onChange}
                  onClick={this.onChange}
                  disabled={disabled}
                  defaultChecked={publicState}
                />
              </div>
            </label>
            <div className="infoGraph">
              <label>Owner</label>
              <span className="author">{`${singleGraph.user.firstName} ${singleGraph.user.lastName}`}</span>
            </div>
            <div className="infoGraph">
              <label>Created</label>
              <span>{moment(singleGraph.createdAt).format('YYYY.MM.DD')}</span>
            </div>
            <div className="infoGraph">
              <label>Last Modfied</label>
              <span>{moment(singleGraph.updatedAt).format('YYYY.MM.DD hh:mm')}</span>
            </div>
          </div>
          <div className="textareaEdit">
            <Input
              placeholder="Description"
              className="textarea"
              value={requestData.description}
              textArea
              onChangeText={(v) => this.handleChange('description', v)}
            />
          </div>
          {false ? (
            <Select
              label="Status"
              value={GRAPH_STATUS.find((o) => o.value === requestData.status)}
              options={GRAPH_STATUS}
              onChange={(v) => this.handleChange('status', v?.value || 'active')}
            />
          ) : null}
          <div className="buttonsSave">
            {isTemplate ? (
              <>
                {/* <Button className="accent alt" onClick={() => this.saveGraph('active', true)} disabled={!canSave}>
                  Save as Graph
                </Button> */}
                <Button className="btn-classic" onClick={() => this.saveGraph('template', false)} disabled={!canSave}>
                  Save
                </Button>
              </>
            ) : (
              <>
                {/* <Button className="accent alt" onClick={() => this.saveGraph('template', true)}>
                  Save as Template
                </Button>  */}

                <Button
                  onClick={() => this.deleteGraph(graphId)}
                  className="btn-delete"
                >
                  Delete
                </Button>
                <Button
                  className="btn-classic"
                  onClick={() => this.saveGraph(requestData.status, false)}
                  // disabled={!canSave}
                >
                  {isUpdate ? 'Save' : 'Create'}
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
  customFields: state.graphs.singleGraph.customFields || {},
});
const mapDispatchToProps = {
  createGraphRequest,
  updateGraphRequest,
  updateGraphThumbnailRequest,
  getSingleGraphRequest,
  setActiveButton,
  setLoading,
  deleteGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SaveGraphModal);

export default withRouter(Container);
