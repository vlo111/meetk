import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { setActiveButton, setGridIndexes, setLoading } from '../../store/actions/app';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Chart from '../../Chart';
import Button from '../form/Button';
import Api from '../../Api';
import ChartUtils from '../../helpers/ChartUtils';
import Select from '../form/Select';
import { EXPORT_TYPES } from '../../data/export';
import { getGraphInfoRequest } from '../../store/actions/graphs';
import Outside from '../Outside';

class DataView extends Component {
  static propTypes = {
    setGridIndexes: PropTypes.func.isRequired,
    setLoading: PropTypes.func.isRequired,
    getGraphInfoRequest: PropTypes.func.isRequired,
    graphId: PropTypes.string.isRequired,
    selectedGrid: PropTypes.objectOf(PropTypes.array).isRequired,
    setActiveButton: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    const nodes = Chart.getNodes();
    const links = Chart.getLinks();

    this.state = {
      nodes,
      links,
      exportType: 'png',
      showExport: false,
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
    this.setState({ nodes, links });

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

  unCheckAllGrids = () => {
    this.props.setGridIndexes('nodes', []);
    this.props.setGridIndexes('links', []);
  }

  close = () => {
    this.props.setActiveButton('create');
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

    Chart.node.attr('class', ChartUtils.setClass((d) => ({ unChecked: false })));
    Chart.link.attr('class', ChartUtils.setClass((d) => ({ unChecked: false })));
    this.props.setActiveButton('create');
  }

  closeExport = (ev) => {
    const isSelectType = typeof (ev.target.className) === 'string'
      ? !!ev.target.className?.includes('gh__option')
      : true;

    if (!isSelectType) {
      const { showExport } = this.state;
      this.setState({ showExport: !showExport });
    }
  }

  render() {
    const {
      exportType, nodes, links, showExport,
    } = this.state;

    const linksGrouped = _.groupBy(links, 'type');
    delete linksGrouped.undefined;
    const nodesGrouped = _.groupBy(nodes, 'type');
    delete nodesGrouped.undefined;

    return (
      <>
        {!showExport ? (
          <Outside onClick={(ev) => this.closeExport(ev)}>
            <div className="exportData">
              <div className="exportContent ">
                <div className="exportDropDown  exportNodeData " exclude=".exportData">
                  <Button icon={<CloseSvg />} onClick={this.close} className="exportdataclosed" />
                  <p>Export data </p>
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
              </div>
            </div>
          </Outside>
        ) : null}
      </>
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
