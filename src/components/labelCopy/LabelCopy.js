import React, { Component } from 'react';
import _ from 'lodash';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import ContextMenu from '../contextMenu/ContextMenu';
import LabelUtils from '../../helpers/LabelUtils';
import Button from '../form/Button';
import Chart from '../../Chart';
import LabelCompare from './LabelCompare';
import CustomFields from '../../helpers/CustomFields';
import { removeNodeCustomFieldKey, getSingleGraphRequest } from '../../store/actions/graphs';
import ChartUtils from '../../helpers/ChartUtils';
import { copyDocumentForGraphRequest } from '../../store/actions/document';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { ReactComponent as CompareNodesSvg } from '../../assets/images/icons/Compare_nodes.svg';
import { ReactComponent as KeepBothSvg } from '../../assets/images/icons/Keep_both.svg';
import { ReactComponent as MergeNodesSvg } from '../../assets/images/icons/Merge_nodes.svg';
import { ReactComponent as ReplaceSvg } from '../../assets/images/icons/Replace.svg';
import { ReactComponent as SkipNodesSvg } from '../../assets/images/icons/Skip_these_nodes.svg';
import { createNodesRequest, deleteNodesRequest, updateNodesRequest } from '../../store/actions/nodes';
import { createLinksRequest } from '../../store/actions/links';
import { createLabelsRequest } from '../../store/actions/labels';
import Api from '../../Api';

class LabelCopy extends Component {
  static propTypes = {
    copyDocumentForGraphRequest: PropTypes.func.isRequired,
    singleGraph: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      compare: {},
      position: [],
      data: {},
      showQuestionModal: false,
      showCompareModal: false,
    };
  }

  componentDidMount() {
    ContextMenu.event.on('label.append', this.handleLabelAppend);
    ContextMenu.event.on('node.append', this.handleNodeAppend);
    ContextMenu.event.on('label.embed', this.handleLabelEmbed);
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener('label.append', this.handleLabelAppend);
    ContextMenu.event.removeListener('node.append', this.handleNodeAppend);
    ContextMenu.event.removeListener('label.embed', this.handleLabelEmbed);
  }

  copyDocuments = (fromGraphId, toGraphId, nodes) => {
    this.props.copyDocumentForGraphRequest(
      {
        graphId: fromGraphId,
        toGraphId,
        nodes,
      },
    );
  }

  handleLabelAppend = async (ev, params) => {
    if (Chart.isAutoPosition) Chart.isAutoPosition = false;

    const { x, y } = params;

    const position = [x, y];

    this.setState({ position });

    const { singleGraph } = this.props;
    const data = LabelUtils.getData();

    // todo global loading
    const { data: compare } = await Api.dataPastCompare(singleGraph.id, data.nodes).catch((e) => e.response);

    if (_.isEmpty(compare.duplicatedNodes)) {
      this.copyDocument('keep');
      return;
    }

    this.setState({
      compare, data, showQuestionModal: true,
    });
  }

  handleNodeAppend = (ev, params) => {
    const data = LabelUtils.getData();
    this.setState({
      compare: params.compare, data, position: [params.x, params.y], showQuestionModal: true,
    });
  }

  skipDuplications = async () => {
    const { compare: { duplicatedNodes, sourceNodes }, position } = this.state;
    const { singleGraph } = this.props;
    const data = LabelUtils.getData();
    const nodes = Chart.getNodes();
    data.links = data.links.map((l) => {
      const duplicateNode = data.nodes.find((n) => n.id === l.source);
      if (duplicateNode) {
        const sourceNode = sourceNodes.find((n) => n.name === duplicateNode.name);
        if (sourceNode) {
          l.source = sourceNode.id;
        }
      }

      const duplicateNodeTarget = data.nodes.find((n) => n.id === l.target);
      if (duplicateNodeTarget) {
        const sourceNode = sourceNodes.find((n) => n.name === duplicateNodeTarget.name);
        if (sourceNode) {
          l.target = sourceNode.id;
        }
      }
      return l;
    });
    data.nodes = data.nodes.filter((n) => !duplicatedNodes.some((d) => n.name === d.name));

    data.links = ChartUtils.cleanLinks(data.links, [...data.nodes, ...nodes]);
    this.copyDocuments(data.sourceId, singleGraph.id, data.nodes);
    this.closeModal();

    // const {
    //   updateNodes, createNodes, createLinks, createLabel,
    // } = await LabelUtils.past(data, position);
    // this.props.updateNodesRequest(singleGraph.id, updateNodes);
    // this.props.createNodesRequest(singleGraph.id, createNodes);
    // this.props.createLinksRequest(singleGraph.id, createLinks);
    // this.props.createLabelsRequest(singleGraph.id, [createLabel]);
  }

  closeModal = () => {
    this.setState({
      compare: {}, data: {}, position: [], showQuestionModal: false, showCompareModal: false,
    });
  }

  replaceDuplications = async () => {
    const { customFields, singleGraph } = this.props;
    const { position } = this.state;
    const data = LabelUtils.getData();
    const nodes = Chart.getNodes();
    data.nodes = data.nodes.map((n) => {
      const duplicate = nodes.find((d) => n.name === d.name);
      if (duplicate) {
        const originalId = n.id;
        n.id = duplicate.id;
        n.replace = true;
        const customField = CustomFields.get(customFields, duplicate.type, duplicate.id);
        _.forEach(customField, (v, name) => {
          this.props.removeNodeCustomFieldKey(duplicate.type, name, duplicate.id);
        });
        data.links = data.links.map((l) => {
          if (l.source === originalId) {
            l.source = n.id;
          }
          if (l.target === originalId) {
            l.target = n.id;
          }
          return l;
        });
      }
      return n;
    });
    this.copyDocuments(data.sourceId, singleGraph.id, data.nodes);

    this.closeModal();
  }

  toggleCompareNodes = (showCompareModal) => {
    this.setState({ showCompareModal });
  }

  compareAndMerge = async (sources, duplications) => {
    Chart.loading(true);
    const merge = {
      sources: sources.map((d) => d.id),
      duplications: duplications.map((d) => d.id),
    };
    const { position } = this.state;
    const { x, y } = ChartUtils.calcScaledPosition(position[0], position[1]);
    const { id } = this.props.singleGraph;
    const data = LabelUtils.getData();
    this.closeModal();
    const { data: res } = await Api.dataPast(id, undefined, [x, y], 'merge-compare', {
      labels: data.labels,
      nodes: data.nodes,
      links: data.links,
      merge,
    }).catch((e) => e.response || {});
    if (res.status === 'error') {
      toast.error(res.message);
    }
    Chart.loading(false);
  }

  copyDocument = async (action, sourceId = undefined) => {
    Chart.loading(true);
    const { position } = this.state;

    const { x, y } = ChartUtils.calcScaledPosition(position[0], position[1]);
    const { id } = this.props.singleGraph;
    const data = LabelUtils.getData();
    this.closeModal();

    const { data: res } = await Api.dataPast(id, sourceId, [x, y], action, {
      labels: data.labels,
      nodes: data.nodes,
      links: data.links,
    }).catch((e) => e.response);
    if (res.status === 'error') {
      toast.error(res.message);
      Chart.loading(false);
      return;
    }
    await this.props.getSingleGraphRequest(id);
    Chart.loading(false);
  }

  handleLabelEmbed = async (params) => {
    const { x, y } = params;
    const { sourceId } = LabelUtils.getData();
    const position = [x, y];
    await this.setState({ position });
    this.copyDocument('embed', sourceId);
  }

  render() {
    const {
      compare, data, showQuestionModal, showCompareModal, position,
    } = this.state;
    const {
      singleGraph,
    } = this.props;
    if (!showQuestionModal && !showCompareModal) {
      return null;
    }
    return (
      <>
        <Modal
          isOpen={showQuestionModal}
          className="ghModal graphCopy"
          overlayClassName="ghModalOverlay graphCopyOverlay"
          onRequestClose={this.closeModal}
        >
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeModal} />
          <h2 className="title">
            {`The destinations has ${compare.duplicatedNodes?.length || 0} nodes with the same type and name`}
          </h2>
          <p className="subtitle">
            {'Moving '}
            <span className="headerContents">
              {data.nodes?.length}
            </span>
            {' nodes from '}
            <span className="headerContents">
              {data.title}
            </span>
            {' to '}
            <span className="headerContents">
              {singleGraph.title}
            </span>
            {'. '}
          </p>
          <div className="buttonsWrapper">
            <div className="part">
              <div className="component">
                <Button
                  onClick={() => this.toggleCompareNodes(true)}
                  className="actionButton"
                  icon={<CompareNodesSvg />}
                />
                <p className="textContent">Compare nodes</p>

              </div>
              <div className="component">
                <Button
                  onClick={() => this.copyDocument('merge')}
                  className="actionButton"
                  icon={<MergeNodesSvg />}
                />
                <p className="textContent">Merge nodes</p>
              </div>
              <div className="component">
                <Button onClick={() => this.copyDocument('skip')} className="actionButton" icon={<SkipNodesSvg />} />
                <p className="textContent">Skip these nodes</p>
              </div>
            </div>
            <div className="part">
              <div className="component">
                <Button onClick={() => this.copyDocument('replace')} className="actionButton" icon={<ReplaceSvg />} />
                <p className="textContent">Replace the nodes in the destination</p>
              </div>
              <div className="component">
                <Button onClick={() => this.copyDocument('keep')} className="actionButton" icon={<KeepBothSvg />} />
                <p className="textContent">Keep both</p>
              </div>
            </div>
          </div>
        </Modal>
        {showCompareModal
          ? (
            <LabelCompare
              compare={compare}
              position={position}
              onRequestClose={() => this.toggleCompareNodes(false)}
              onSubmit={this.compareAndMerge}
              from={singleGraph.title}
              to={data.title}
            />
          )
          : null}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
});
const mapDispatchToProps = {
  copyDocumentForGraphRequest,
  removeNodeCustomFieldKey,
  createNodesRequest,
  updateNodesRequest,
  deleteNodesRequest,
  createLinksRequest,
  createLabelsRequest,
  getSingleGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LabelCopy);

export default Container;
