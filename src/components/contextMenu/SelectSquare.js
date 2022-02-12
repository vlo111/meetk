import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../form/Button';
import Chart from '../../Chart';
import { setActiveButton, setGridIndexes } from '../../store/actions/app';
import ChartUtils from '../../helpers/ChartUtils';
import { createGraphRequest } from '../../store/actions/graphs';
import Api from '../../Api';

class SelectSquare extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.func.isRequired,
    createGraphRequest: PropTypes.func.isRequired,
    singleGraph: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
  }

  crop = () => {
    const { params: { squareData } } = this.props;
    let nodes = Chart.getNodes();
    let links = Chart.getLinks();
    nodes = nodes.filter((d) => squareData.nodes.includes(d.id));
    this.props.setGridIndexes('nodes', nodes.map((d) => d.index));

    links = links.filter((d) => squareData.nodes.includes(d.target) && squareData.nodes.includes(d.source));
    this.props.setGridIndexes('links', links.map((d) => d.index));
    this.props.setActiveButton('dataexport');
  }

  createNewGraph = async () => {
    const { singleGraph, params: { squareData }, location: { pathname } } = this.props;
    const viewLocation = pathname.startsWith('/graphs/view/');
    const {
      width, height, x, y,
    } = squareData;

    let squareLinks = Chart.getLinks();
    let squareLabels = Chart.getLabels();
    // eslint-disable-next-line prefer-const
    let { nodes: squareNodes, files, customFields } = await ChartUtils.getNodesWithFiles(this.props.customFields);

    squareNodes = squareNodes.filter((d) => squareData.nodes.includes(d.id));
    squareLabels = squareLabels.filter((l) => squareData.labels.includes(l.id));
    squareLinks = squareLinks.filter((l) => squareData.nodes.includes(l.source) && squareData.nodes.includes(l.target));

    const { data: copyData } = await Api.dataCopy(singleGraph.id, {
      width, height, x, y,
    });
    const { nodes, links, labels } = copyData.data || {};

    const { payload: { data } } = await this.props.createGraphRequest({
      nodes: !viewLocation ? nodes : squareNodes,
      links: !viewLocation ? links : squareLinks,
      labels: !viewLocation ? labels : squareLabels,
    });
    if (data.graphId) {
      window.location.href = `/graphs/update/${data.graphId}?new=1`;
    } else {
      toast.error('Something went wrong');
    }
  }

  handleCopyClick = async () => {
    const { singleGraph, params: { squareData }, location: { pathname } } = this.props;
    const {
      width, height, x, y,
    } = squareData;
    Chart.loading(true);
    const { data } = await Api.dataCopy(singleGraph.id, {
      width, height, x, y,
    });
    const viewLocation = pathname.startsWith('/graphs/view/');
    let { nodes, files, customFields } = await ChartUtils.getNodesWithFiles(this.props.customFields);
    let links = Chart.getLinks();
    let labels = Chart.getLabels();
    nodes = nodes.filter((d) => squareData.nodes.includes(d.id));
    labels = labels.filter((l) => squareData.labels.includes(l.id));
    links = links.filter((l) => squareData.nodes.includes(l.source) && squareData.nodes.includes(l.target));

    const copyData = {
      sourceId: data.data?.sourceId,
      type: data.data?.type,
      nodes: !viewLocation ? data.data?.nodes : nodes,
      links: !viewLocation ? data.data?.links : links,
      labels: !viewLocation ? data.data?.labels : labels,
      title: data.data?.title,
    };

    localStorage.setItem('label.copy', JSON.stringify(copyData));
    Chart.loading(false);
  }

  render() {
    return (
      <>
        <Button icon="fa-copy" onClick={this.handleCopyClick}>
          Copy
        </Button>
        <Button icon="fa-plus-circle" onClick={this.createNewGraph}>
          New Graph
        </Button>
        <Button icon="fa-crop" onClick={this.crop}>
          Crop
        </Button>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
  customFields: state.graphs.singleGraph.customFields || {},
});
const mapDispatchToProps = {
  createGraphRequest,
  setGridIndexes,
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectSquare);

export default withRouter(Container);
