import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import Wrapper from '../components/Wrapper';
import { setActiveButton } from '../store/actions/app';
import { clearSingleGraph, getSingleGraphRequest } from '../store/actions/graphs';
import { userGraphRequest } from '../store/actions/shareGraphs';
import Api from '../Api';
import Header from '../components/Header';
import Select from '../components/form/Select';
import GraphCompareList from '../components/graphCompare/GraphCompareList';
import ChartUtils from '../helpers/ChartUtils';
import CreateGraphModal from '../components/CreateGraphModal';
import Button from '../components/form/Button';

class GraphCompare extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    clearSingleGraph: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
  }

  getGraph1Request = memoizeOne(async (graphId) => {
    if (graphId) {
      const { payload: { data = {} } } = await this.props.getSingleGraphRequest(graphId, { full: true });
      this.setState({ selectedNodes1: _.cloneDeep(ChartUtils.objectAndProto(data.graph?.nodes || [])) });
    }
    this.loadGraphsAfter();
  })

  getGraph2Request = memoizeOne(async (graph2Id) => {
    if (graph2Id) {
      const { data = {} } = await Api.getSingleGraph(graph2Id, { full: true }).catch((e) => e);
      this.setState({ singleGraph2: data.graph || {}, selectedNodes2: _.cloneDeep(data.graph?.nodes || []) });
    }
    this.loadGraphsAfter();
  })

  constructor(props) {
    super(props);
    this.state = {
      singleGraph2: {},
      selectedNodes1: [],
      selectedNodes2: [],
      defaultOptions: [],
      defaultOptions2: [],
    };
  }

  async componentDidMount() {
    this.props.setActiveButton('view');
    this.props.clearSingleGraph();
    this.loadGraphs();
    setTimeout(() => {
      this.loadGraphsAfter();
    }, 200);
  }

  loadGraphs = async (s) => {
    try {
      const { match: { params: { graphId, graph2Id } } } = this.props;
      const { data } = await Api.getGraphsList(1, {
        s,
        onlyTitle: 1,
        limit: 10,
        filter: 'newest',
        graphCompare: 'true',
      });
      const graphs = data.graphs
        .filter((g) => g.id !== graphId && g.id !== graph2Id)
        .map((g) => ({
          value: g.id,
          label: `${g.title} (${g.nodesCount})`,
        }));
      return graphs;
    } catch (e) {
      return 'Error accrued while searching';
    }
  }

  loadGraphsAfter = async (s) => {
    try {
      const { match: { params: { graphId, graph2Id } } } = this.props;
      const { data } = await Api.getGraphsList(1, {
        s,
        onlyTitle: 1,
        limit: 10,
        filter: 'newest',
        graphCompare: 'true',
      });
      const graphs = data.graphs
        .filter((g) => g.id !== graphId && g.id !== graph2Id)
        .map((g) => ({
          value: g.id,
          label: `${g.title} (${g.nodesCount})`,
        }));
      this.setState({ defaultOptions: graphs });
      this.setState({ defaultOptions2: graphs });
      return graphs;
    } catch (e) {
      return 'Error accrued while searching';
    }
  }

  handleGraphSelect = (val, graph) => {
    const {
      match: { params: { graphId, graph2Id } },
    } = this.props;
    const { value = 0 } = val;
    if (graph === 1) {
      this.props.history.replace(`/graphs/compare/${value}/${graph2Id || 0}`);
    } else {
      this.props.history.replace(`/graphs/compare/${graphId || 0}/${value}`);
    }
  }

  handleChange = (d, checked, pos) => {
    const key = pos === 1 ? 'selectedNodes1' : 'selectedNodes2';
    const data = this.state[key];
    const i = data.findIndex((n) => n.id === d.id);
    let graph = {};
    if (pos === 1) {
      graph = this.props.singleGraph;
    } else {
      graph = this.state.singleGraph2;
    }
    if (checked) {
      if (i === -1) {
        const node = graph?.nodesPartial?.find((nd) => nd.id === d.id);
        data.push(node);
      }
    } else if (i > -1) {
      data.splice(i, 1);
    }
    this.setState({ [key]: data });
  }

  createGraph = () => {
    const { singleGraph } = this.props;
    const { singleGraph2 } = this.state;
    const { selectedNodes1, selectedNodes2 } = this.state;
    const keepLabels = false;
    const createGraphData = ChartUtils.margeGraphs(
      singleGraph,
      singleGraph2,
      selectedNodes1,
      selectedNodes2,
      keepLabels,
    );
    this.setState({ createGraphData });
  }

  closeCreateModal = () => {
    this.setState({ createGraphData: false });
  }

  render() {
    const {
      match: { params: { graphId, graph2Id } }, singleGraph,
    } = this.props;
    this.getGraph1Request(graphId);
    this.getGraph2Request(graph2Id);
    let {
      selectedNodes1, selectedNodes2,
    } = this.state;
    const {
      singleGraph2, createGraphData, defaultOptions2, defaultOptions,
    } = this.state;
    const graph1Nodes = _.differenceBy(singleGraph.nodes, singleGraph2.nodes, 'name');
    const graph2Nodes = _.differenceBy(singleGraph2.nodes, singleGraph.nodes, 'name');
    const compareGraph1 = graphId && singleGraph.id ? [{ value: singleGraph.id, label: `${singleGraph.title} (${singleGraph.nodes?.length})` }] : undefined;
    const compareGraph2 = graph2Id && singleGraph2.id
      ? [{
        value: singleGraph2.id,
        label: `${singleGraph2.title} (${singleGraph2.nodes?.length})`,
      }] : undefined;
    const fullValue = ((compareGraph1 && compareGraph2));
    const graph1CompareNodes = _.intersectionBy(singleGraph.nodes, singleGraph2.nodes, 'name');

    selectedNodes1 = selectedNodes1.filter((node) => node?.id);
    selectedNodes2 = selectedNodes2.filter((node) => node?.id);
    const selected = [...selectedNodes1, ...selectedNodes2];
    return (
      <Wrapper className="graph-compare" showFooter={false}>
        <Header />
        <h3 className="compareHeaderText">Compare Graphs</h3>
        <div className="graph-compare-container">
          <div className="compareListWrapper compareContent">
            <ul className="compareList">
              <li className="item itemSearch">
                <div className="bottom">
                  <div style={{ marginRight: '20%', width: '40%' }}>
                    <Select
                      label="Graph 1"
                      isAsync
                      placeholder="Select"
                      value={compareGraph1}
                      onChange={(val) => this.handleGraphSelect(val, 1)}
                      loadOptions={this.loadGraphs}
                      defaultOptions={defaultOptions}
                    />
                  </div>
                  <div style={{ width: '40%' }}>
                    <Select
                      label="Graph 2"
                      isAsync
                      value={compareGraph2}
                      onChange={(val) => this.handleGraphSelect(val, 2)}
                      loadOptions={this.loadGraphs}
                      defaultOptions={defaultOptions2}
                    />
                  </div>
                </div>
              </li>
            </ul>
            <GraphCompareList
              title={(
                <span className="graph-name-title">
                  Similar Nodes
                  <p>{` (${graph1CompareNodes.length})`}</p>
                </span>
              )}
              count={graph1CompareNodes.length}
              singleGraph1={{ ...singleGraph, nodes: graph1CompareNodes }}
              singleGraph2={singleGraph2}
              selectedNodes1={selectedNodes1}
              selectedNodes2={selectedNodes2}
              onChange={this.handleChange}
              selected={selected}
            />
            <GraphCompareList
              title={(
                <span className="graph-name-title">
                  {'Nodes in '}
                  <strong>{singleGraph.title}</strong>
                  {` (${graph1Nodes?.length})`}
                </span>
                )}
              count={graph1Nodes.length}
              singleGraph1={{ ...singleGraph, nodes: graph1Nodes }}
              selectedNodes1={selectedNodes1}
              onChange={this.handleChange}
              selected={selected}
            />
            <GraphCompareList
              title={(
                <span className="graph-name-title">
                  {'Nodes in '}
                  <strong>{singleGraph2.title}</strong>
                  {` (${graph2Nodes?.length})`}
                </span>
                )}
              count={graph2Nodes.length}
              singleGraph2={{ ...singleGraph2, nodes: graph2Nodes }}
              selectedNodes2={selectedNodes2}
              onChange={this.handleChange}
              selected={selected}
            />
            <div className="compareList compare-footer">
              <Button
                onClick={this.createGraph}
                className="btn-classic createNewGraphBtn"
                color="main"
                icon="fa-plus"
                type="button"
                disabled={!fullValue}
              >
                Create New Graph
              </Button>

            </div>
          </div>
          {!_.isEmpty(createGraphData) ? (
            <CreateGraphModal show data={createGraphData} onChange={this.closeCreateModal} />
          ) : null}
        </div>
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  singleGraph: state.graphs.singleGraph,
  userGraphs: state.shareGraphs.userGraphs,
});
const mapDispatchToProps = {
  setActiveButton,
  getSingleGraphRequest,
  userGraphRequest,
  clearSingleGraph,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphCompare);

export default Container;
