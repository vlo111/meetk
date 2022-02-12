import React, { Component } from 'react';
import PropTypes from 'prop-types';
import stripHtml from 'string-strip-html';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import Chart from '../Chart';
import Icon from './form/Icon';
import Outside from './Outside';
import ChartUtils from '../helpers/ChartUtils';
import NodeIcon from './NodeIcon';
import Button from './form/Button';

const MODAL_WIDTH = 300;

class NodeDescription extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.showInfoTimout = null;
    this.state = {
      node: null,
    };
  }

  componentDidMount() {
    Chart.event.on('node.mouseenter', this.showNodeInfo);
    Chart.event.on('node.mouseleave', this.handleMouseLeave);
    Chart.event.on('node.dragstart', this.hideInfo);
  }

  componentWillUnmount() {
    clearTimeout(this.showInfoTimout);
  }

  getNode = (id) => {
    const node = ChartUtils.getNodeById(id);
    if (node) {
      const nodes = Chart.getNodes();
      node.index = nodes.findIndex((n) => n.id === id);
    }
    return node;
  }

  handleMouseLeave = () => {
    clearTimeout(this.showInfoTimout);
  }

  showNodeInfo = async (ev, d) => {
    clearTimeout(this.showInfoTimout);
    if (d.nodeType === 'infography') {
      return;
    }
    this.showInfoTimout = setTimeout(() => {
      this.setState({
        node: this.getNode(d.id),
      });
    }, 900);
  }

  hideInfo = () => {
    clearTimeout(this.showInfoTimout);
    this.setState({ node: null });
  }

  showFullInfo = () => {
    const { node } = this.state;
    this.hideInfo();
    const queryObj = queryString.parse(window.location.search);
    queryObj.info = node.id;
    const query = queryString.stringify(queryObj);
    this.props.history.replace(`?${query}`);
  }

  render() {
    const { node } = this.state;
    if (!node) {
      return null;
    }
    const { x, y } = ChartUtils.getNodeDocumentPosition(node.index);
    const { show } = this.state;
    const contexHeight = show === 'selectSquare' ? 420 : 300;
    const top = window.innerHeight - y < contexHeight ? window.innerHeight - contexHeight : y + 25;
    const left = window.innerWidth - x < y ? window.innerWidth - 320 : x + 55;

    const nodeLinks = Chart.getNodeLinks(node.id, 'all');
    return (
      <Outside onClick={this.hideInfo}>
        <div onMouseLeave={this.hideInfo} data-node-info={node.index} id="nodeDescription" style={{ left, top }}>
          <Icon className="close" value="fa-close" onClick={this.hideInfo} />
          <div className="left">
            <NodeIcon node={node} />
          </div>
          <div className="right">
            {node.link ? (
              <a className="title" href={node.link} target="_blank" rel="noopener noreferrer">
                {node.name}
              </a>
            ) : (
              <h3 className="title">{node.name}</h3>
            )}
            <h4 className="type">
              {node.type}
            </h4>
            <p className="connections">
              <strong>{'Connections: '}</strong>
              {nodeLinks.length}
            </p>
            <Button onClick={this.showFullInfo} className="btn-classic">More</Button>
            {' '}

          </div>
        </div>
      </Outside>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeDescription);

export default withRouter(Container);
