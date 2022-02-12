import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link, Prompt, Redirect } from 'react-router-dom';
import Tooltip from 'rc-tooltip';
import { toast } from 'react-toastify';
import memoizeOne from 'memoize-one';
import { deleteGraphRequest, getGraphInfoRequest, getSingleGraphRequest } from '../store/actions/graphs';
import { userGraphRequest } from '../store/actions/shareGraphs';
import Chart from '../Chart';
import AnalysisUtils from '../helpers/AnalysisUtils';
import Wrapper from '../components/Wrapper';
import ReactChart from '../components/chart/ReactChart';
import { setActiveButton } from '../store/actions/app';
import Button from '../components/form/Button';
import Filters from '../components/filters/Filters';
import SearchModal from '../components/search/ExploreModal';
import ContextMenu from '../components/contextMenu/ContextMenu';
import Zoom from '../components/Zoom';
import NodeDescription from '../components/NodeDescription';
import Tabs from '../components/tabs';
import LabelTooltip from '../components/LabelTooltip';
import ToolBarHeader from '../components/ToolBarHeader';
import ToolBarFooter from '../components/ToolBarFooter';
import AnalyticalTab from '../components/Analysis/AnalyticalTab';
import AnalyticalPage from '../components/Analysis/AnalyticalPage';
import FindPath from '../components/FindPath';
import AutoPlay from '../components/AutoPlay';
import MapsGraph from '../components/maps/MapsGraph';
import Crop from '../components/chart/Crop';
import DataView from '../components/dataView/DataView';
import { ReactComponent as UndoSvg } from '../assets/images/icons/undo.svg';
import { ReactComponent as EditSvg } from '../assets/images/icons/edit.svg';
import Dashboard from '../components/graphDashboard';
import ChartUtils from '../helpers/ChartUtils';
import Cytoscape from '../components/cytoscape';

class GraphView extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    deleteGraphRequest: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    userGraphRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    graphInfo: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    getGraphInfoRequest: PropTypes.func.isRequired,
    singleGraphStatus: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
    currentUserId: PropTypes.string.isRequired,
  }

  preventReload = true;

  constructor() {
    super();
    this.state = {
      scaleStatus: false,
      graphMode: 'd3',
    };
  }

  getSingleRequest = memoizeOne(() => {
    const { match: { params: { graphId } } } = this.props;
    this.props.setActiveButton('view');
    this.props.userGraphRequest();
    if (graphId) {
      this.props.getSingleGraphRequest(graphId, { viewMode: true });
      this.props.getGraphInfoRequest(graphId, { viewMode: true });
    }
  })

  deleteGraph = async () => {
    const { match: { params: { graphId = '' } } } = this.props;
    if (window.confirm('Are you sure?')) {
      await this.props.deleteGraphRequest(graphId);
      this.props.history.push('/');
      toast.info('Successfully deleted');
    }
  }

  handleRouteChange = () => {
    Chart.nodesPath = false;
    Chart.clearLinkShortestPath();
  }

  getPermission = () => {
    const { singleGraphStatus } = this.props;

    return (singleGraphStatus === 'fail');
  }

  render() {
    const {
      singleGraph, singleGraphStatus, graphInfo, activeButton, currentUserId,
      location: { pathname, search }, match: { params: { graphId = '' } },
    } = this.props;
    const { graphMode } = this.state;
    const viewPermisson = ((singleGraph?.share?.role === 'view') || (currentUserId !== singleGraph?.userId));
    const preview = pathname.startsWith('/graphs/preview/');
    let shortestNodes = [];
    // let shortestLinks = [];

    // view the shortest path to the analysis field
    if (search.includes('nodeStart=')) {
      const { nodes, links } = singleGraph;

      if (nodes?.length && links?.length) {
        const start = search.substring(search.indexOf('nodeStart=') + 10, search.indexOf('nodeEnd='));
        const end = search.substring(search.indexOf('nodeEnd=') + 8, search.length);

        const { listNodes, listLinks } = AnalysisUtils.getShortestPath(start, end, nodes, links);

        const originalListPath = links.filter((p) => {
          let listCheck = false;
          listLinks.forEach((l) => {
            if ((l.source === p.source || l.target === p.source)
              && (l.source === p.target || l.target === p.target)) {
              listCheck = true;
            }
          });
          return listCheck;
        });

        // shortestLinks = originalListPath;
        listNodes.map((p) => shortestNodes.push(nodes.filter((n) => n.id === p)[0]));

        shortestNodes = shortestNodes.reverse();

        Chart.showPath(originalListPath, listNodes);

        // ChartUtils.findNodeInDom(shortestNodes[0]);
      }
    }
    this.getSingleRequest(pathname);
    const isPermission = this.getPermission();
    if (isPermission) {
      return (<Redirect to="/403" />);
    }
    if (!this.state.scaleStatus) {
      if (document.querySelector('.nodes')?.childElementCount) {
        ChartUtils.autoScale();
        this.setState({
          scaleStatus: true,
        });
      }
    }
    return (
      <Wrapper className="graphView graphViewHeader" showFooter={false}>
        <div className="graphWrapper">
          <ReactChart />
        </div>
        {graphMode === 'cytoscape' && (
          <Cytoscape
            nodes={singleGraph.nodesPartial}
            links={singleGraph.linksPartial}
          />
        )}
        <Prompt
          when={this.preventReload}
          message={this.handleRouteChange}
        />
        {activeButton === 'data' && <DataView />}
        {search.includes('analytics')
          ? (
            <AnalyticalPage
              graphId={graphId}
              nodes={singleGraph.nodesPartial}
              links={singleGraph.linksPartial}
            />
          )
          : (search.includes('nodeStart=')
            ? <AnalyticalTab nodes={shortestNodes} />
            : (
              <div>
                {preview && singleGraphStatus === 'success' ? (
                  <div className="graphPreview">
                    <h1 className="title">{singleGraph.title}</h1>
                    <p className="description">
                      {singleGraph.description}
                    </p>
                    <div>
                      <strong>{'Nodes: '}</strong>
                      {graphInfo.totalNodes}
                    </div>
                    <div>
                      <strong>{'Links: '}</strong>
                      {graphInfo.totalLinks}
                    </div>
                    <div>
                      <strong>{'Views: '}</strong>
                      {singleGraph.views}
                    </div>
                    <Link className="ghButton view" to={`/graphs/view/${graphId}`} replace>
                      View Graph
                    </Link>
                  </div>
                ) : (
                  <>

                    {['admin', 'edit', 'edit_inside'].includes(singleGraph.currentUserRole) && (
                      <Link to={`/graphs/update/${graphId}`}>
                        <Tooltip overlay="Edit">
                          <Button icon={<EditSvg style={{ height: 30 }} />} className="transparent edit" />
                        </Tooltip>
                      </Link>
                    )}
                    <NodeDescription />
                    {!(pathname === `/graphs/filter/${graphId}`)
                    && (
                    <Link to={pathname?.includes('filter') ? `/graphs/update/${graphId}` : '/'}>
                      <Tooltip overlay="Back">
                        <Button icon={<UndoSvg style={{ height: 30 }} />} className="transparent back" />
                      </Tooltip>
                    </Link>
                    )}
                  </>
                )}
                <ToolBarHeader graph={singleGraph} />
                <SearchModal graphId={graphId} />
                <Tabs editable={false} viewPermisson={viewPermisson} />
                <LabelTooltip />
                <Filters />
                <AutoPlay />
                <ContextMenu expand />
                <Dashboard graph={singleGraph} />
                {activeButton === 'maps-view' && <MapsGraph />}
                {activeButton.includes('findPath')
                  && (
                    <FindPath
                      history={this.props.history}
                      start={activeButton.substring(activeButton.length, activeButton.indexOf('.') + 1)}
                    />
                  )}
                <Zoom />
                <Crop />

                <ToolBarFooter
                  partOf
                  graphMode={graphMode}
                  setGraphMode={(mode) => {
                    this.setState({
                      graphMode: mode,
                    });
                  }}
                />
              </div>
            ))}
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  singleGraph: state.graphs.singleGraph,
  userGraphs: state.shareGraphs.userGraphs,
  graphInfo: state.graphs.graphInfo,
  singleGraphStatus: state.graphs.singleGraphStatus,
  currentUserId: state.account.myAccount.id,
});
const mapDispatchToProps = {
  setActiveButton,
  getSingleGraphRequest,
  deleteGraphRequest,
  userGraphRequest,
  getGraphInfoRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphView);

export default Container;
