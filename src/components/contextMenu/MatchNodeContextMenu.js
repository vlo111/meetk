import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { tree } from 'd3-hierarchy';
import { getSingleGraphRequest } from '../../store/actions/graphs';
import Button from '../form/Button';
import Icon from '../form/Icon';
import Chart from '../../Chart';
import Zoom from '../Zoom';
import ChartUtils from '../../helpers/ChartUtils';
import { ReactComponent as MachSvg } from '../../assets/images/icons/match.svg';
import { ReactComponent as EyeBallSvg } from '../../assets/images/icons/eye-ball.svg';
import { ReactComponent as LinksSvg } from '../../assets/images/icons/link.svg';
import Utils from '../../helpers/Utils';

class MatchNodeContextMenu extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      mathNodes: [],
      math: '',
      hiddenData: 1,
    };
  }

  hideData = (all = false) => {
    const { params: { id } } = this.props;
    const node = all ? Chart.getNodes().find((d) => d.id === id) : true;
    if (!node) return null;
    const nodes = all ? Chart.getNodes().filter((d) => d.id === id) : [];
    const links = [];
    const labels = [];
    // Hide data
    // let nodes = Chart.getNodes();
    // let links = Chart.getLinks();
    // let label = Chart.getLabels();
    // nodes = nodes.map((d) => {
    //   d.hidden = d.id !== id ? 1 : 0;
    //   links = links.map((l) => {
    //     l.hidden = l.hidden || (nodes.some((n) => n.hidden !== 0 && (l.target === d.id || l.source === d.id)) ? 1 : 0);
    //     return l;
    //   });
    //   return d;
    // });
    // label = label.map((d) => { d.hidden = -1;  return d;})
    Chart.render({ nodes, links, labels }, { ignoreAutoSave: true });
  }

  mathType = (type = '') => {
    const { params: { id }, nodesPartial, linksPartial } = this.props;
    const chartNodes = Chart.getNodes();
    const chartLinks = Chart.getLinks();
    const labels = [];
    const matchNodes = [];
    const node = nodesPartial && nodesPartial.find((d) => (type ? d.type === type : true));
    const checkNode = Chart.getNodes().find((d) => d.id === id);
    if (!node || !checkNode) return null;

    const nodes = nodesPartial.filter((d) => {
      if (((type ? d.type === type : true)
        && d.keywords.length > 0 && checkNode.keywords.length > 0 && (
          Utils.findSimilarity(d.keywords, checkNode.keywords) >= 50

        ))) {
        d.match = d.id !== id ? Utils.findSimilarity(d.keywords, checkNode.keywords) : null;
        d.new = d.id !== id;
        return true;
      }
      if (chartNodes && chartNodes.some((n) => n.id === d.id)) {
        if (d.id !== id) {
          d.match = Utils.findSimilarity(d.keywords, checkNode.keywords);
          d.new = true;
        }
        return true;
      }

      d.match = null;
      d.new = false;
      return false;
    });
    const links = ChartUtils.cleanLinks(linksPartial, nodes);
    Chart.render({ nodes, links, labels }, { ignoreAutoSave: true, isAutoPosition: true });
    ChartUtils.autoScaleTimeOut();
    ChartUtils.autoScaleTimeOut(100);
    ChartUtils.autoScaleTimeOut(200);
    Chart.event.emit('expandData', type);
    ChartUtils.startAutoPosition();
  }

  render() {
    const { params: { id }, nodesPartial } = this.props;
    let { match, mathNodes, hiddenData } = this.state;
    mathNodes = ChartUtils.getMathNodeGroupedByNodeId(nodesPartial, id, true, hiddenData);
    match = ChartUtils.getMathNodeGroupedByNodeId(nodesPartial, id, false, hiddenData);
    return (
      <>
        <div className="ghButton notClose">
          <Icon value={<MachSvg />} />
          Match
          <Icon className="arrow" value="fa-angle-right" />
          <div className="contextmenu">
            <Button onClick={() => this.mathType()}>{`All [${match}]`}</Button>
            <div className="border-bottom " />
            {_.map(mathNodes, (n, type) => (
              <Button onClick={() => this.mathType(type)} key={n}>
                <span className="connections">
                  <span className="node-item">
                    <span className="indicator" style={{ backgroundColor: ChartUtils.getLinkColorByType(nodesPartial, type) }} />
                    {type}
                    {`[${n.length}]`}
                  </span>
                </span>
              </Button>
            ))}
          </div>
        </div>
      </>
    );
  }
}
const mapStateToProps = (state) => ({
  nodesPartial: state.graphs.singleGraph?.nodesPartial || [],
  linksPartial: state.graphs.singleGraph?.linksPartial || [],
});

const mapDispatchToProps = {
  getSingleGraphRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MatchNodeContextMenu);

export default Container;
