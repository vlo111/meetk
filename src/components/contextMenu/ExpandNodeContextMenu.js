import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getSingleGraphRequest } from '../../store/actions/graphs';
import Button from '../form/Button';
import Icon from '../form/Icon';
import Chart from '../../Chart';
import Zoom from '../Zoom';
import ChartUtils from '../../helpers/ChartUtils';
import { ReactComponent as NodesSvg } from '../../assets/images/icons/nodes.svg';
import { ReactComponent as EyeBallSvg } from '../../assets/images/icons/eye-ball.svg';
import { ReactComponent as LinksSvg } from '../../assets/images/icons/link.svg';

class NodeContextMenu extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      expandsLink: [],
      expands: '',
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

  expandType = (type = '') => {
    const { params: { id }, nodesPartial, linksPartial } = this.props;
    const link = linksPartial && linksPartial.find((d) => (type ? d.type === type : true));

    if (!link) return null;
    const chartNodes = Chart.getNodes();
    const chartLinks = Chart.getLinks();
    let nodes = nodesPartial.filter((d) => linksPartial && linksPartial.some((n) => (type ? n.type === type : true)
      && (n.target === d.id || n.source === d.id)
      && (n.target === id || n.source === id))
      || chartNodes && chartNodes.some((n) => n.id === d.id));
    let newNodes = nodes.filter((newNode) => !chartNodes.find((oldNode) => oldNode.id === newNode.id));
    newNodes = newNodes.map((node) => {
      node.new = true;
      return node;
    });
    nodes = newNodes.concat(chartNodes);
    let links = linksPartial && linksPartial.filter((l) => ((type ? l.type === type : true) && (l.target === id || l.source === id)

    )
      || chartLinks && chartLinks.some((n) => n.id === l.id));
    let newLinks = links.filter((newLink) => !chartLinks.find((oldLink) => oldLink.id === newLink.id));
    newLinks = newLinks.map((newLink) => {
      newLink.new = true;
      return newLink;
    });

    links = newLinks.concat(chartLinks);
    links = ChartUtils.cleanLinks(links, nodes);
    const labels = [];
    Chart.render({ nodes, links, labels }, { ignoreAutoSave: true, isAutoPosition: true });
    ChartUtils.autoScaleTimeOut();
    ChartUtils.autoScaleTimeOut(100);
    ChartUtils.autoScaleTimeOut(200);
    Chart.event.emit('expandData', type);
    ChartUtils.startAutoPosition();
  }

  render() {
    const { params: { id }, linksPartial, nodesPartial } = this.props;
    let { expands, expandsLink, hiddenData } = this.state;
    expandsLink = ChartUtils.getLinkGroupedByNodeId(linksPartial, nodesPartial, id, true, hiddenData);
    expands = ChartUtils.getLinkGroupedByNodeId(linksPartial, nodesPartial, id, false, hiddenData);

    return (
      <>

        <div className="ghButton notClose">
          <Icon value={<NodesSvg />} />
          Expand
          <Icon className="arrow" value="fa-angle-right" />
          <div className="contextmenu">
            <Button onClick={() => this.expandType()}>{`All [${expands}]`}</Button>
            <div className="border-bottom " />
            {_.map(expandsLink, (n, type) => (
              <Button onClick={() => this.expandType(type)}>
                <span className="connections">
                  <span className="connection-item">
                    <span className="indicator" style={{ backgroundColor: ChartUtils.getLinkColorByType(linksPartial, type) }} />
                    {type}
                    {' '}
                    {`[${n.length}]`}
                  </span>
                </span>
              </Button>
            ))}
          </div>
        </div>
        <Button icon={<LinksSvg />} title="find path" onClick={(ev) => this.props.onClick(ev, 'findPath')}>
          Find Path
        </Button>
        <Button icon={<EyeBallSvg />} title="Dismiss" onClick={() => this.hideData()}>
          Dismiss 
        </Button>
        <Button icon={<EyeBallSvg />} title="Dismiss other nodes" onClick={() => this.hideData(true)}>
          Dismiss other nodes
        </Button>
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
)(NodeContextMenu);

export default Container;
