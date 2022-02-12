import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { setActiveButton } from '../store/actions/app';
import Input from './form/Input';
import NodeIcon from './NodeIcon';
import ChartUtils from '../helpers/ChartUtils';
import Utils from '../helpers/Utils';
import AnalysisUtils from '../helpers/AnalysisUtils';
import Chart from '../Chart';

class FindPath extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    singleGraph: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      inComponent: [],
    };
  }

  closeModal = () => {
    this.props.setActiveButton('view');
  }

  handleChange = (search = '') => {
    if (!search.trim().toLowerCase()) {
      this.setState({ nodes: [], search });
      return;
    }
    // node in component
    const { start, singleGraph } = this.props;
    const { nodesPartial, linksPartial } = singleGraph;
    let fNodes = [];
    const foundNodes = ChartUtils.nodeSearch(search, 15, nodesPartial).filter((p) => p.id !== start);
    if (nodesPartial?.length && linksPartial?.length) {
      const { components } = AnalysisUtils.getComponent(nodesPartial, linksPartial);
      const component = components.filter((c) => c.some((e) => e.id === start));
      fNodes = foundNodes.filter((d) => component[0]?.filter((n) => n.id === d.id).length > 0);
    }

    this.setState({
      nodes: fNodes,
      search,
    });
  }

  formatHtml = (text) => {
    const { search } = this.state;
    return text.replace(new RegExp(Utils.escRegExp(search), 'ig'), '<b>$&</b>');
  }

  showPath = (node) => {
    const { start } = this.props;
    const { nodes, links, shortestNodes } = this.shortPath(start, node.id);
    Chart.render({ nodes, links }, { ignoreAutoSave: true });
    this.closeModal();
    ChartUtils.autoScale(shortestNodes);
  }

  shortPath = (start, end) => {
    const chartNodes = Chart.getNodes();
    const chartLinks = Chart.getLinks();
    const { singleGraph } = this.props;
    const { nodesPartial, linksPartial } = singleGraph;
    if (start) {
      if (nodesPartial?.length && linksPartial?.length) {
        const { listNodes, listLinks } = AnalysisUtils.getShortestPath(start, end, nodesPartial, linksPartial);
        if (listNodes.length > 0) {
          const newNodes = nodesPartial.filter((d) => {
            if (listNodes.includes(d.id)) {
              d.new = true;
              return true;
            }
            d.new = false;
            return false;
          });

          const newLinks = linksPartial.filter((l) => {
            if (listLinks.some((link) => (link.source === l.source || link.target === l.source)
              && (link.source === l.target || link.target === l.target))) {
              l.new = true;
              return true;
            }
            l.new = false;
            return false;
          });

          let nodes = nodesPartial.filter((d) => (chartNodes && chartNodes.some((n) => n.id === d.id)));
          let links = linksPartial.filter((l) => (chartLinks && chartLinks.some((n) => n.id === l.id)));
          nodes = nodes.concat(newNodes);
          links = links.concat(newLinks);

          nodes = nodes.filter((node, position) => nodes.findIndex((n) => n.id === node.id) === position);
          links = links.filter((link, position) => links.findIndex((n) => n.id === link.id) === position);
          return { nodes, links, shortestNodes: newNodes };
        }
      }
    }
  }

  render() {
    const { nodes, search, inComponent } = this.state;
    return (
      <Modal
        isOpen
        className="ghModal ghModalSearch findPath"
        overlayClassName="ghModalOverlay"
        onRequestClose={this.closeModal}
      >
        <Input
          label="Search"
          autoComplete="off"
          value={search}
          containerClassName="graphSearch"
          onChangeText={this.handleChange}
          autoFocus
        />
        <ul className="list">
          {nodes.map((d) => (
            <li className="item" key={d.index}>
              <div
                tabIndex="0"
                role="button"
                className={`ghButton ${inComponent.includes(d.id) && 'content'}`}
                onClick={() => this.showPath(d)}
              >
                <div className="left">
                  <NodeIcon node={d} />
                </div>
                <div className="right">
                  <span className="row">
                    <span
                      className="name"
                      dangerouslySetInnerHTML={{ __html: this.formatHtml(d.name) }}
                    />
                    <span
                      className="type"
                      dangerouslySetInnerHTML={{ __html: this.formatHtml(d.type) }}
                    />
                  </span>

                  {!d.name.toLowerCase().includes(search) && !d.type.toLowerCase().includes(search) ? (
                    <span
                      className="keywords"
                      dangerouslySetInnerHTML={{ __html: d.keywords.map((k) => this.formatHtml(k)).join(', ') }}
                    />
                  ) : null}
                  {inComponent.includes(d.id)
                    && (
                      <span className="error">
                        <span className="name">
                          <b>This node is not included in the component</b>
                        </span>
                      </span>
                    )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FindPath);

export default Container;
