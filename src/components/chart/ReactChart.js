import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import Chart from '../../Chart';
import { setActiveButton, toggleNodeModal } from '../../store/actions/app';
import ContextMenu from '../contextMenu/ContextMenu';
import CustomFields from '../../helpers/CustomFields';
import ChartUtils from '../../helpers/ChartUtils';
import { socketLabelDataChange } from '../../store/actions/socket';
import Api from '../../Api';
import { removeNodeFromCustom } from '../../store/actions/graphs';
import FolderResizeIcon from './icons/FolderResizeIcon';
import FolderCloseIcon from './icons/FolderCloseIcon';
import FolderIcon from './icons/FolderIcon';
import LabelLock from './icons/LabelLock';
import SelectedNodeFilter from './icons/SelectedNodeFilter';
import ResizeIcons from './icons/ResizeIcons';
import NotFound from './NotFound';
import { deleteNodesRequest, updateNodesRequest, updateNodesPositionRequest } from '../../store/actions/nodes';
import { deleteLinksRequest } from '../../store/actions/links';
import { deleteLabelsRequest, updateLabelsRequest } from '../../store/actions/labels';
import MouseCursor from './icons/MouseCursor';

class ReactChart extends Component {
  static propTypes = {
    activeButton: PropTypes.string.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      ctrlPress: undefined,
      shiftKey: undefined,
    };
  }

  componentDidMount() {
    Chart.loading(true);
    Chart.render({ nodes: [], links: [], labels: [] });

    Chart.event.on('node.click', this.handleNodeClick);
    Chart.event.on('node.dblclick', this.handleDbNodeClick);
    Chart.event.on('node.edit', this.editNode);

    ContextMenu.event.on('node.delete', this.deleteNode);
    ContextMenu.event.on('node.edit', this.editNode);

    ContextMenu.event.on('active-button', this.setActiveButton);
    Chart.event.on('click', this.handleChartClick);

    ContextMenu.event.on('node.create', this.addNewNode);

    Chart.event.on('link.click', this.deleteLink);
    ContextMenu.event.on('link.delete', this.deleteLink);

    ContextMenu.event.on('label.delete', this.handleLabelDelete);
    Chart.event.on('label.click', this.handleLabelClick);

    Chart.event.on('folder.open', this.handleFolderOpen);
    Chart.event.on('folder.close', this.handleFolderClose);

    // if zoom level is auto of range given in Chart zoom scaleExtent this function will prevent default zoom
    document.getElementsByClassName('graphWrapper')[0].addEventListener('wheel', this.handleWheel);
    document.getElementsByClassName('graphWrapper')[0].addEventListener('mousewheel', this.handleWheel);
  }

  componentWillUnmount() {
    Chart.unmount();
    ContextMenu.event.removeListener('node.delete', this.deleteNode);
    ContextMenu.event.removeListener('node.edit', this.editNode);
    ContextMenu.event.removeListener('active-button', this.setActiveButton);
    ContextMenu.event.removeListener('link.delete', this.deleteLink);
    ContextMenu.event.removeListener('label.delete', this.handleLabelDelete);
    ContextMenu.event.removeListener('node.create', this.addNewNode);

    document.getElementsByClassName('graphWrapper')[0].removeEventListener('wheel', this.handleWheel);
    document.getElementsByClassName('graphWrapper')[0].removeEventListener('mousewheel', this.handleWheel);
  }

  handleWheel = (ev) => {
    ev.preventDefault();
  }

  handleFolderOpen = async (ev, d) => {
    const { match: { params: { graphId } } } = this.props;
    Chart.loading(true);
    const { data } = await Api.labelData(graphId, d.id).catch((e) => e.response);
    if (data && data.label) {
      const nodes = Chart.getNodes();
      nodes.push(...data.label.nodes);

      const fakeId = `fake_${data.label.label.id}`;

      const folders = Chart.getLabels().filter((l) => l.type === 'folder' && l.id !== data.label.label.id);
      // let links = Chart.getLinks();
      let links = Chart.getLinks().filter((l) => l.source !== fakeId && l.target !== fakeId);
      data.label.links.forEach((link) => {
        folders.forEach((folder) => {
          const fId = `fake_${folder.id}`;
          if (!folder.open) {
            if (folder.nodes.includes(link.source)) {
              link.source = fId;
              link.fake = true;
            } else if (folder.nodes.includes(link.target)) {
              link.target = fId;
              link.fake = true;
            }
          }
        });
        links.push(link);
      });
      links = ChartUtils.uniqueLinks(links, true);
      Chart.render({ nodes, links }, { ignoreAutoSave: true });
    }

    Chart.loading(false);
  }

  handleFolderClose = async (ev, d) => {
    const fakeId = `fake_${d.id}`;

    const nodes = Chart.getNodes().filter((n) => {
      if (!n.fake && n.labels.includes(d.id)) {
        return false;
      }
      return true;
    });
    let links = Chart.getLinks().map((l) => {
      if (d.nodes) {
        if (d.nodes.includes(l.source)) {
          l.source = fakeId;
          l.name += 1;
          l.fake = true;
        }
        if (d.nodes.includes(l.target)) {
          l.target = fakeId;
          l.fake = true;
        }
      }
      return l;
    });
    links = ChartUtils.uniqueLinks(links, true);
    Chart.render({ nodes, links }, { ignoreAutoSave: true });
  }

  handleLabelClick = (ev, d) => {
    if (Chart.activeButton === 'delete') {
      this.handleLabelDelete(ev, d);
    }
  }

  handleLabelDelete = (ev, d) => {
    const { match: { params: { graphId } } } = this.props;
    const labels = Chart.getLabels().filter((l) => l.id !== d.id);
    const nodes = Chart.getNodes().filter((n) => !n.labels || !n.labels.includes(d.id));
    const links = ChartUtils.cleanLinks(Chart.getLinks(), nodes);

    // this.props.deleteLabelsRequest(graphId, [d.id]);

    if (d.sourceId) {
      const embedLabels = Chart.data.embedLabels.filter((l) => l.labelId !== d.id);
      Chart.render({
        labels, nodes, links, embedLabels,
      });
      Api.labelDelete(d.sourceId, d.id, graphId);

      return;
    }
    // delete labe  from share list
    Api.shareLabelDelete(d.id, graphId);
    Chart.render({ labels, nodes, links });
    Chart.event.emit('label.mouseleave', ev, d);
  }

  handleDbNodeClick = (ev, d) => {
    if (Chart.nodesPath) return;

    Chart.highlight('open', d.index);

    const queryObj = queryString.parse(window.location.search);
    queryObj.info = d.id;
    const query = queryString.stringify(queryObj);
    this.props.history.replace(`?${query}`);
  }

  editNode = (ev, d) => {
    if (d.readOnly) {
      return;
    }
    const { customFields } = this.props;
    const customField = CustomFields.get(customFields, d.type, d.id);
    this.props.toggleNodeModal({ ...d, customField });
  }

  handleChartClick = (ev) => {
    const { target } = ev;

    const activeMode = Chart.activeButton;
    if (!target.classList.contains('nodeCreate')
          || !(activeMode === 'create-node' || activeMode === 'create-folder')
          || Chart.newLink.attr('data-source')) {
      return;
    }
    const { singleGraph } = this.props;
    if (singleGraph.currentUserRole === 'edit_inside'
        && singleGraph.share.objectId !== target.getAttribute('data-id')) {
      return;
    }

    if (activeMode === 'create-node') {
      this.addNewNode(ev);
    } else if (activeMode === 'create-folder') {
      ContextMenu.event.emit('folder.new', ev, {});
    }
  }

  addNewNode = (ev) => {
    const { x, y } = ChartUtils.calcScaledPosition(ev.x, ev.y);

    this.props.toggleNodeModal({
      fx: x,
      fy: y,
    });
  }

  deleteLink = (ev, d) => {
    if (Chart.activeButton !== 'delete' && !d.contextMenu) {
      return;
    }
    if (d.readOnly) {
      return;
    }
    const { singleGraph } = this.props;
    const links = [...Chart.getLinks()];
    const link = links.find((l) => l.index === d.index);
    links.splice(d.index, 1);
    // this.props.deleteLinksRequest(singleGraph.id, [link.id]);
    Chart.render({ links });
  }

  handleNodeClick = (ev, d) => {
    if (Chart.activeButton === 'delete') {
      this.deleteNode(ev, d);
    }
  }

  deleteNode = (ev, d) => {
    const { singleGraph } = this.props;
    if (d.readOnly) {
      return;
    }
    let nodes = Chart.getNodes();
    let links = Chart.getLinks();

    nodes = nodes.filter((n) => n.index !== d.index);

    // this.props.deleteNodesRequest(singleGraph.id, [d.id]);

    links = links.filter((l) => {
      if (l.source === d.id || l.target === d.id) {
        // todo delete links
        return false;
      }
      return true;
    });

    this.props.removeNodeFromCustom(d.id);

    Chart.render({ nodes, links });
  }

  setActiveButton = (ev, params) => {
    this.props.setActiveButton(params.button);
  }

  render() {
    const { ctrlPress, shiftKey } = this.state;
    const { activeButton, singleGraphStatus, singleGraph: { currentUserRole } } = this.props;

    // this.renderChart(singleGraph, embedLabels);
    return (
      <div
        id="graph"
        data-role={currentUserRole}
        data-active={activeButton}
        data-shift={shiftKey}
        data-ctrl={ctrlPress}
        className={activeButton}
      >
        <div className="loading">
          {_.range(0, 4).map((k) => <div key={k} />)}
        </div>
        {/* <div className="borderCircle">
          {_.range(0, 6).map((k) => <div key={k} />)}
        </div> */}
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="nodeCreate">
          <g className="wrapper" transform-origin="top left">
            <g className="labels">
              <rect className="labelsBoard areaBoard" fill="transparent" width="100%" height="100%" />
            </g>
            <g className="folders" />
            <g className="directions" />
            <g className="links" />
            <g className="linkText" />
            <g className="nodes" />
            <g className="icons" />
            <g className="folderIcons" />
            <ResizeIcons />
            <defs>
              <filter id="labelShadowFilter" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1" stdDeviation="0" floodColor="#0D0905" floodOpacity="1" />
                <feDropShadow dx="1" dy="0" stdDeviation="0" floodColor="#0D0905" floodOpacity="1" />
                <feDropShadow dx="0" dy="-1" stdDeviation="0" floodColor="#0D0905" floodOpacity="1" />
                <feDropShadow dx="-1" dy="0" stdDeviation="0" floodColor="#0D0905" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#0d090554" floodOpacity="1" />
              </filter>
              <filter id="grayscaleFilter">
                <feColorMatrix type="saturate" values="0" />
                <feColorMatrix type="luminanceToAlpha" result="A" />
              </filter>
              <SelectedNodeFilter />
              <LabelLock />
              <FolderIcon />
              <FolderCloseIcon />
              <FolderResizeIcon />
              <MouseCursor />

            </defs>
          </g>
          <g className="mouseCursorPosition" transform-origin="top left" />
        </svg>
        {singleGraphStatus === 'fail' ? <NotFound /> : null}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  embedLabels: state.graphs.embedLabels,
  customFields: state.graphs.singleGraph.customFields || {},
  singleGraph: state.graphs.singleGraph,
  singleGraphStatus: state.graphs.singleGraphStatus,
});
const mapDispatchToProps = {
  toggleNodeModal,
  setActiveButton,
  socketLabelDataChange,
  deleteNodesRequest,
  deleteLinksRequest,
  updateNodesRequest,
  updateNodesPositionRequest,
  updateLabelsRequest,
  deleteLabelsRequest,
  removeNodeFromCustom,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReactChart);

export default withRouter(Container);
