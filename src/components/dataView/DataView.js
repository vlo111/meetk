import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { setActiveButton, setGridIndexes, setLoading } from '../../store/actions/app';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { ReactComponent as FullScreen } from '../../assets/images/icons/full-screen.svg';
import { ReactComponent as CompressScreen } from '../../assets/images/icons/compress.svg';
import { ReactComponent as ExportSvg } from '../../assets/images/icons/export.svg';
import Chart from '../../Chart';
import Button from '../form/Button';
import DataTableNodes from './DataTableNodes';
import DataTableLinks from './DataTableLinks';
import Api from '../../Api';
import ChartUtils from '../../helpers/ChartUtils';
import Utils from '../../helpers/Utils';
import Select from '../form/Select';
import Outside from '../Outside';
import { EXPORT_TYPES } from '../../data/export';
import { getGraphInfoRequest } from '../../store/actions/graphs';

class DataView extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.func.isRequired,
    setLoading: PropTypes.func.isRequired,
    getGraphInfoRequest: PropTypes.func.isRequired,
    graphId: PropTypes.string.isRequired,
    graphInfo: PropTypes.object.isRequired,
    selectedGrid: PropTypes.objectOf(PropTypes.array).isRequired,
  }

  constructor(props) {
    super(props);
    const nodes = Chart.getNodes();
    const links = Chart.getLinks();

    this.state = {
      fullWidth: false,
      nodes,
      links,
      activeTab: {
        group: 'nodes',
        type: nodes[0]?.type || '',
      },
      exportType: 'png',
      showExport: false,
      linksGrouped: {},
    };
  }

  async componentDidMount() {
    const { graphId, selectedGrid } = this.props;

    let { links } = this.state;

    const linksGrouped = _.groupBy(links, 'type');
    delete linksGrouped.undefined;

    Chart.loading(true);
    const folders = Chart.getLabels().filter((l) => l.type === 'folder');

    let foldersData = [];
    folders.forEach((f) => {
      foldersData.push(Api.labelData(graphId, f.id));
    });

    foldersData = await Promise.all(foldersData);

    const nodes = this.mergeNodes(Chart.getNodes(), foldersData.map((d) => d.data.label.nodes).flat(1), selectedGrid);
    links = this.mergeLinks(Chart.getLinks(), foldersData.map((d) => d.data.label.links).flat(1), nodes, selectedGrid);
    this.setState({ nodes, links, linksGrouped });

    // this.checkAllGrids();
    Chart.resizeSvg();
    this.props.getGraphInfoRequest(graphId);
    Chart.loading(false);
  }

  componentWillUnmount() {
    this.unCheckAllGrids();
    setTimeout(() => {
      Chart.resizeSvg();
    }, 100);
  }

  mergeNodes = (nodes, extraNodes, selectedGrid) => {
    let n = [...nodes.filter((d) => !d.fake)];
    if (extraNodes) {
      extraNodes.forEach((d, i) => {
        n.push({
          ...d,
          index: nodes.length - 1 + i,
        });
      });
    }
    n = _.uniqBy(n, 'id').filter((d) => !d.sourceId && !d.fake);
    if (_.isEmpty(selectedGrid?.nodes)) {
      this.props.setGridIndexes('nodes', _.range(n.length));
    }

    return n;
  }

  mergeLinks = (links, extraLinks, nodes, selectedGrid) => {
    let l = [...links.filter((d) => !d.fake)];
    if (extraLinks) {
      extraLinks.forEach((d, i) => {
        l.push({
          ...d,
          index: links.length - 1 + i,
        });
      });
    }
    l = ChartUtils.cleanLinks(ChartUtils.uniqueLinks(l), nodes).filter((d) => !d.sourceId && !d.fake);
    if (_.isEmpty(selectedGrid?.links)) {
      this.props.setGridIndexes('links', _.range(l.length));
    }
    return l;
  }

  unCheckAllGrids = () => {
    this.props.setGridIndexes('nodes', []);
    this.props.setGridIndexes('links', []);
  }

  checkAllGrids = () => {
    const { selectedGrid } = this.props;
    const { nodes, links } = this.state;
    if (_.isEmpty(selectedGrid.nodes)) {
      this.props.setGridIndexes('nodes', _.range(nodes.length));
    }
    if (_.isEmpty(selectedGrid.links)) {
      this.props.setGridIndexes('links', _.range(links.length));
    }
  }

  toggleFullWidth = () => {
    const { fullWidth } = this.state;
    this.setState({ fullWidth: !fullWidth });
  }

 close = () => {
   this.props.setActiveButton('create');
 }

  setActiveTab = (group, type) => {
    this.setState({
      activeTab: {
        type, group,
      },
    });
  }

  export = async (type) => {
    const { selectedGrid, graphId } = this.props;

    const nodes = this.state.nodes.filter((d) => ChartUtils.isCheckedNode(selectedGrid, d));

    const nodesId = nodes.map((n) => n.id);

    const linksId = ChartUtils.cleanLinks(this.state.links.filter((d) => selectedGrid.links.includes(d.index)), nodes)
      .map((l) => l.id);

    const labelsId = Chart.getLabels().map((l) => l.id);

    Api.download(type, {
      graphId, nodesId, linksId, labelsId,
    });
  }

  download = async (type) => {
    this.props.setLoading(true);
    const svg = Chart.printMode(1900, 1060, true);
    await Api.download(type, { svg });
    this.props.setLoading(false);
  }

  closeExport = (ev) => {
    const isSelectType = typeof (ev.target.className) === 'string'
      ? !!ev.target.className?.includes('gh__option')
      : false;

    if (!isSelectType) {
      const { showExport } = this.state;
      this.setState({ showExport: !showExport });
    }
  }

  handleExport = () => {
    const { exportType } = this.state;

    switch (exportType) {
      case 'png': {
        this.download('png');
        break;
      }
      case 'zip': {
        this.export('zip');
        break;
      }
      case 'pdf': {
        this.download('pdf');
        break;
      }
      case 'excel': {
        this.export('xlsx');
        break;
      }
      default:
        this.download('png');
    }
  }

  loadFolderNodes = async (folder) => {
    const { graphId } = this.props;
    const { data } = await Api.labelData(graphId, folder.id).catch((e) => e);
    console.log(data);
  }

  render() {
    const {
      fullWidth, activeTab, exportType, showExport, nodes, links, linksGrouped,
    } = this.state;

    const { graphInfo } = this.props;

    const nodesGrouped = _.groupBy(nodes, 'type');
    delete nodesGrouped.undefined;
    let color = '';

    if (links.length) {
      if (activeTab.group === 'links') {
        color = links.find((p) => p.type === activeTab.type)?.color;
      } else if (activeTab.group === 'nodes') {
        color = nodes.find((p) => p.type === activeTab.type)?.color;
      } else {
        color = '';
      }
    }
    return (
      <div id="dataTable" className={fullWidth ? 'fullWidth' : undefined}>
        <div className="contentWrapper">
          <div className="header">
            <div className="exportData">
              <div className="exportContent">
                <Button onClick={this.closeExport} className="showExportButton" icon={<ExportSvg />} title="Export" />
                {showExport ? (
                  <Outside onClick={(ev) => this.closeExport(ev)} exclude=".exportData">
                    <div className="exportDropDown">
                      <Button icon={<CloseSvg />} onClick={(ev) => this.closeExport(ev)} className="exportdataclosed" />
                      <p>Save as </p>
                      <Select
                        label="Type File"
                        portal
                        options={EXPORT_TYPES}
                        value={EXPORT_TYPES.filter((t) => t.value === exportType)}
                        onChange={(v) => this.setState({ exportType: v.value })}
                      />
                      <div className="exportButton">
                        <Button onClick={this.handleExport} className=" btn-classic" type="submit">
                          Export
                        </Button>
                      </div>
                    </div>
                  </Outside>
                ) : null}
              </div>
            </div>
            <h4>
              <span style={{ backgroundColor: color }} className={activeTab.group === 'nodes' ? 'circle' : 'line'} />
              {activeTab.type}
            </h4>
            <div className="buttons">
              <Button icon={fullWidth ? <CompressScreen /> : <FullScreen />} onClick={this.toggleFullWidth} />
              <Button icon={<CloseSvg />} onClick={this.close} />
            </div>
          </div>
          <div className="ghGridTableWrapper">
            {activeTab.group === 'nodes' ? (
              <DataTableNodes
                classNamePos={showExport && 'tablePosition'}
                title={activeTab.type}
                nodes={nodesGrouped[activeTab.type]}
                allNodes={nodes}
                allLinks={links}
                loadFolderNodes={this.loadFolderNodes}
              />
            ) : (
              <DataTableLinks
                classNamePos={showExport && 'tablePosition'}
                title={activeTab.type}
                allNodes={nodes}
                allLinks={links}
                links={linksGrouped[activeTab.type]}
                setLinksGrouped={(value) => {
                  const lGrouped = _.groupBy(value, 'type');
                  delete lGrouped.undefined;

                  this.setState({
                    links: value,
                    linksGrouped: lGrouped,
                  });
                }}
              />
            )}
          </div>
          <div className="tabs">
            <div className="nodesMode">
              <span>
                {`Nodes (${graphInfo.totalNodes})`}
              </span>
            </div>
            <div>
              {_.map(nodesGrouped, (n, type) => (
                <Button
                  key={type}
                  className={activeTab.type === type && activeTab.group === 'nodes' ? 'active' : ''}
                  onClick={() => this.setActiveTab('nodes', type)}
                >
                  {type || '__empty__'}
                  <sub>{`(${n.length})`}</sub>
                </Button>
              ))}
            </div>
            <div className="linksMode">
              <span>
                {`Links (${graphInfo.totalLinks})`}
              </span>
            </div>
            <div>
              {_.map(linksGrouped, (n, type) => (
                <Button
                  key={type}
                  className={activeTab.type === type && activeTab.group === 'links' ? 'active' : ''}
                  onClick={() => this.setActiveTab('links', type)}
                >
                  {type || '__empty__'}
                  <sub>{`(${n.length})`}</sub>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  selectedGrid: state.app.selectedGrid,
  graphId: state.graphs.singleGraph.id,
  graphInfo: state.graphs.graphInfo,
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  setActiveButton,
  setLoading,
  setGridIndexes,
  getGraphInfoRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DataView);

export default Container;
