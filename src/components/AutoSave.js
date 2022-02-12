import { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import Chart from '../Chart';
import {
  getSingleGraphRequest,
  updateGraphPositionsRequest,
  updateGraphThumbnailRequest,
  getGraphsListRequest,
} from '../store/actions/graphs';
import ChartUtils from '../helpers/ChartUtils';
import {
  createNodesRequest,
  deleteNodesRequest, updateNodesCustomFieldsRequest,
  updateNodesPositionRequest,
  updateNodesRequest,
} from '../store/actions/nodes';
import { createLinksRequest, deleteLinksRequest, updateLinksRequest } from '../store/actions/links';
import { toggleDeleteState } from '../store/actions/app';
import {
  createLabelsRequest,
  deleteLabelsRequest, toggleFolderRequest,
  updateLabelPositionsRequest,
  updateLabelsRequest,
} from '../store/actions/labels';
import Utils from '../helpers/Utils';

class AutoSave extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    deleteState: PropTypes.bool.isRequired,

    createNodesRequest: PropTypes.func.isRequired,
    deleteNodesRequest: PropTypes.func.isRequired,
    updateNodesPositionRequest: PropTypes.func.isRequired,
    updateNodesRequest: PropTypes.func.isRequired,

    createLinksRequest: PropTypes.func.isRequired,
    deleteLinksRequest: PropTypes.func.isRequired,
    updateLinksRequest: PropTypes.func.isRequired,

    updateGraphPositionsRequest: PropTypes.func.isRequired,

    createLabelsRequest: PropTypes.func.isRequired,
    deleteLabelsRequest: PropTypes.func.isRequired,
    updateLabelsRequest: PropTypes.func.isRequired,
    toggleFolderRequest: PropTypes.func.isRequired,
    toggleDeleteState: PropTypes.func.isRequired,

    updateNodesCustomFieldsRequest: PropTypes.func.isRequired,

    getSingleGraphRequest: PropTypes.func.isRequired,
    getGraphsListRequest: PropTypes.func.isRequired,

    updateGraphThumbnailRequest: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      graphChanged: false,
    };
  }

  async componentDidMount() {
    await Utils.sleep(500);
    Chart.event.on('render', this.handleChartRender);
    Chart.event.on('node.dragend', this.handleChartRender);
    Chart.event.on('label.dragend', this.handleChartRender);
    Chart.event.on('setNodeData', this.handleChartRender);
    Chart.event.on('square.dragend', this.handleChartRender);
    Chart.event.on('link.save', this.handleChartRender);
    Chart.event.on('selected.dragend', this.handleChartRender);
    Chart.event.on('folder.open', this.handleFolderToggle);
    Chart.event.on('folder.close', this.handleFolderToggle);
    Chart.event.on('node.resize-end', this.handleNodeResizeEnd);

    Chart.event.on('auto-position.change', this.handleAutoPositionChange);

    this.thumbnailListener = this.props.history.listen(this.handleRouteChange);
    window.addEventListener('beforeunload', this.handleUnload);
  }

  componentWillUnmount() {
    clearTimeout(this.thumbnailTimeout);
    if (typeof (this.thumbnailListener) === 'function') {
      this.thumbnailListener();
    }
    window.removeEventListener('beforeunload', this.handleUnload);
  }

  handleFolderToggle = async (ev, d) => {
    if (ev === Chart && Chart.ignoreAutoSave) {
      return;
    }
    if (!Chart.autoSave) {
      return;
    }
    const { match: { params: { graphId } } } = this.props;
    await this.props.toggleFolderRequest(graphId, {
      id: d.id,
      open: d.open,
    });
  }

  handleChartRender = (ev) => {
    clearTimeout(this.timeout);
    if (ev === Chart && Chart.ignoreAutoSave) {
      return;
    }
    if (!Chart.autoSave) {
      return;
    }
    if (Chart.isLoading() === true) {
      return;
    }
    this.timeout = setTimeout(this.saveGraph, 0);
  }

  formatNode = (node) => ({
    id: node.id || '',
    d: node.d || '',
    description: node.description || '',
    icon: node.icon || '',
    infographyId: node.infographyId || '',
    keywords: node.keywords || [],
    // labels: ChartUtils.getNodeLabels(node),
    labels: node.labels || [],
    location: node.location || '',
    name: node.name || '',
    nodeType: node.nodeType || '',
    sourceId: node.sourceId || '',
    status: node.status || 'approved',
    type: node.type || '',
    manually_size: node.manually_size || 1,
    color: node.color || '',
  })

  formatLink = (d) => ({
    id: d.id || '',
    sx: d.linkType === 'a1' ? d.sx : '',
    sy: d.linkType === 'a1' ? d.sy : '',
    tx: d.linkType === 'a1' ? d.tx : '',
    ty: d.linkType === 'a1' ? d.ty : '',
    source: d.source,
    target: d.target,
    value: +d.value || 1,
    linkType: d.linkType || '',
    type: d.type || '',
    direction: d.direction || '',
    hidden: d.hidden,
    color: d.color || '',
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    createdUser: d.createdUser,
    updatedUser: d.updatedUser,
    readOnly: d.readOnly,
    status: d.status || 'approved',
    fake: d.fake,
    update: d.update,
  })

  formatLabel = (d) => ({
    d: d.d || '',
    status: d.status || 'unlock',
    name: d.name || '',
  })

  handleSquareDragEnd = (ev, d) => {
    const nodes = Chart.getNodes().filter((n) => d.nodes.includes(n.id) || d.selectedNodes.includes(n.id));
  }

  handleAutoPositionChange = async (isAutoPosition) => {
    if (isAutoPosition) {
      return;
    }
    const { match: { params: { graphId } } } = this.props;
    const updateNodePositions = Chart.getNodes().filter((d) => !d.fake).map((node) => ({
      id: node.id,
      fx: node.fx,
      fy: node.fy,
      labels: node.labels,
    }));
    document.body.classList.add('autoSave');
    await this.props.updateNodesPositionRequest(graphId, updateNodePositions);
    document.body.classList.remove('autoSave');
  }

  handleNodeResizeEnd = async (ev, d) => {
    const { match: { params: { graphId } } } = this.props;
    document.body.classList.add('autoSave');
    await this.props.updateNodesRequest(graphId, [d]);
    document.body.classList.remove('autoSave');
  }

  saveGraph = async () => {
    const { match: { params: { graphId } }, deleteState } = this.props;
    if (!graphId || Chart.isAutoPosition) {
      return;
    }
    let position = true;
    document.body.classList.add('autoSave');
    const links = Chart.getLinks(true).filter((d) => !d.fake && !d.sourceId);
    const labels = Chart.getLabels();
    const nodes = Chart.getNodes(true).filter((d) => !d.fake && !d.sourceId);

    const oldNodes = Chart.oldData.nodes.filter((d) => !d.fake && !d.sourceId);
    const oldLinks = Chart.oldData.links.filter((d) => !d.fake && !d.sourceId);
    const oldLabels = Chart.oldData.labels.filter((d) => !d.fake);
    let deleteLabels = _.differenceBy(oldLabels, labels, 'id');
    let createLabels = _.differenceBy(labels, oldLabels, 'id');
    let updateLabels = [];
    const updateLabelPositions = [];
    let newLabel = false;
    labels.forEach((label) => {
      const oldLabel = oldLabels.find((l) => l.id === label.id);
      if (oldLabel) {
        if (!_.isEqual(label.d, oldLabel.d)) {
          updateLabelPositions.push({
            id: label.id,
            d: label.d,
            type: label.type,
            open: label.open,
          });
        } else if (!oldLabel.name && label.name) {
          createLabels.push(label);
        } else if (!_.isEqual(this.formatLabel(label), this.formatLabel(oldLabel))) {
          updateLabels.push(label);
        } else if (oldLabel.new || oldLabel.import) {
          newLabel = true;
          createLabels.push(label);
        } else if (!_.isEqual(label.size, oldLabel.size)) {
          updateLabelPositions.push({
            id: label.id,
            d: label.d,
            size: label.size,
            type: label.type,
            open: label.open,
          });
        }
      }
    });

    createLabels = createLabels.filter((d) => !d.sourceId);
    updateLabels = updateLabels.filter((d) => !d.sourceId);
    deleteLabels = deleteLabels.filter((d) => !d.sourceId);

    if (newLabel) {
      Chart.oldData.labels = Chart.oldData.labels.map((d) => {
        delete d.new;
        delete d.import;
        return d;
      });
    }

    const deleteNodes = _.differenceBy(oldNodes, nodes, 'id');
    const createNodes = _.differenceBy(nodes, oldNodes, 'id');
    const updateNodes = [];
    const updateNodePositions = [];
    const updateNodeCustomFields = [];
    nodes.forEach((node) => {
      const oldNode = oldNodes.find((n) => n.id === node.id);
      if (oldNode) {
        if (oldNode.fx !== node.fx || oldNode.fy !== node.fy) {
          updateNodePositions.push({
            id: node.id,
            fx: node.fx,
            fy: node.fy,
            labels: node.labels,
          });
        } else if (node.import || oldNode.create || !('index' in oldNode)) {
          // if (oldNode.create) {
          createNodes.push(node);
        } else if (!_.isEqual(this.formatNode(node), this.formatNode(oldNode))) {
          updateNodes.push(node);
        } else if (createLabels.length && createLabels.some((l) => node.labels.includes(l.id))) {
          updateNodePositions.push({
            id: node.id,
            fx: node.fx,
            fy: node.fy,
            labels: node.labels,
          });
        }
        // if ((oldNode.customFields && !_.isEqual(node.customFields, oldNode.customFields))) {
        //   updateNodeCustomFields.push(node);
        // }
      }
    });
    const deleteLinks = _.differenceBy(oldLinks, links, 'id');
    let createLinks = _.differenceBy(links, oldLinks, 'id');
    let updateLinks = [];
    createLinks.push(...oldLinks.filter((l) => l.create));
    oldLinks.forEach((l) => {
      delete l.create;
    });
    links.forEach((link) => {
      const oldLink = oldLinks.find((l) => l.id === link.id);
      if (oldLink) {
        if (_.isUndefined(oldLink.index) || _.isUndefined(link.index)) {
          createLinks.push(link);
        } else if (!_.isEqual(this.formatLink(oldLink), this.formatLink(link)) && !link.create) {
          updateLinks.push(link);
        }
      }
    });
    createLinks = ChartUtils.uniqueLinks(createLinks);
    updateLinks = updateLinks.filter((l) => !createLinks.some((link) => link.id === l.id));
    if (deleteNodes.length && deleteNodes.length === nodes.length) {
      // document.body.classList.remove('autoSave');
      // return;
    }

    const promise = [];
    if (updateNodes.length) {
      position = false;
      promise.push(this.props.updateNodesRequest(graphId, updateNodes));
    }
    if (deleteNodes.length && deleteState) {
      promise.push(this.props.deleteNodesRequest(graphId, deleteNodes));
    }
    // if (updateNodePositions.length) {
    //   promise.push(this.props.updateNodesPositionRequest(graphId, updateNodePositions));
    // }
    if (updateNodePositions.length || updateLabelPositions.length) {
      position = false;
      promise.push(this.props.updateGraphPositionsRequest(graphId, updateNodePositions, updateLabelPositions));
    } else if (createNodes.length) {
      promise.push(this.props.createNodesRequest(graphId, createNodes));
    }

    if (updateNodeCustomFields.length) {
      promise.push(this.props.updateNodesCustomFieldsRequest(graphId, updateNodeCustomFields));
    }

    if (createLinks.length) {
      promise.push(this.props.createLinksRequest(graphId, createLinks));
    }
    if (updateLinks.length) {
      promise.push(this.props.updateLinksRequest(graphId, updateLinks));
    }
    if (deleteLinks.length && deleteState) {
      promise.push(this.props.deleteLinksRequest(graphId, deleteLinks));
    }

    if (createLabels.length) {
      promise.push(this.props.createLabelsRequest(graphId, createLabels));
    }
    if (updateLabels.length) {
      promise.push(this.props.updateLabelsRequest(graphId, updateLabels));
    }

    // if (updateLabelPositions.length) {
    //   promise.push(this.props.updateLabelPositionsRequest(graphId, updateLabelPositions));
    // }
    if (deleteLabels.length && deleteState) {
      promise.push(this.props.deleteLabelsRequest(graphId, deleteLabels));
    }
    Chart.event.emit('auto-save');

    const res = await Promise.all(promise);
    res.forEach(async (d) => {
      if (d?.payload?.data?.status !== 'ok') {
        toast.error('Graph save error');
      }
      if (!_.isEmpty(d?.payload?.data?.error)) {
        toast.error('Something went wrong');
      }
    });
    if (res.length && position) {
      this.setState({ graphChanged: true });
      await this.props.getSingleGraphRequest(graphId);
    }
    document.body.classList.remove('autoSave');
    this.props.toggleDeleteState(false);
  }

  handleUnload = (ev) => {
    ev.preventDefault();
    const { nodesCount, defaultImage } = this.props;
    if (nodesCount < 500 || !defaultImage) {
      this.updateThumbnail();
    }
    ev.returnValue = 'Changes you made may not be saved.';
  }

  handleRouteChange = (newLocation) => {
    const { nodesCount, location, defaultImage } = this.props;
    if (Chart.isLoading()) {
      return;
    }
    if (location.pathname !== newLocation.pathname && nodesCount < 500 && !defaultImage) {
      Chart.loading(true);
      this.updateThumbnail();
    }
  }

  updateThumbnail = async () => {
    const { graphChanged } = this.state;
    const { match: { params: { graphId } }, defaultImage, nodesCount } = this.props;
    const page = 1;
    const order = 'newest';
    document.body.classList.add('autoSave');
    const svg = ChartUtils.getChartSvg();
    if (graphChanged && !defaultImage && graphId && nodesCount < 500) {
      await this.props.updateGraphThumbnailRequest(graphId, svg, 'small');
      this.props.getGraphsListRequest(page, { filter: order });
      this.setState({ graphChanged: false });
    }
    document.body.classList.remove('autoSave');
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state) => ({
  defaultImage: state.graphs.singleGraph.defaultImage,
  deleteState: state.app.deleteState,
  nodesCount: state.graphs.graphInfo.totalNodes,
});

const mapDispatchToProps = {
  updateGraphThumbnailRequest,

  updateNodesRequest,
  createNodesRequest,
  deleteNodesRequest,
  updateNodesPositionRequest,
  updateNodesCustomFieldsRequest,

  createLinksRequest,
  updateLinksRequest,
  updateLabelPositionsRequest,
  deleteLinksRequest,

  updateGraphPositionsRequest,

  createLabelsRequest,
  updateLabelsRequest,
  deleteLabelsRequest,
  toggleFolderRequest,
  getSingleGraphRequest,
  getGraphsListRequest,
  toggleDeleteState,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AutoSave);

export default withRouter(Container);
