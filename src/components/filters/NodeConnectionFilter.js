import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import InputRange from 'react-input-range';
import { setFilter } from '../../store/actions/app';

class NodeConnectionFilter extends Component {
  static propTypes = {
    linkConnection: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    links: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
  }

  getNodeConnections = memoizeOne((nodes, links) => {
    let connections = {};
    links.forEach((l) => {
      connections[l.source] = l.source in connections ? connections[l.source] + 1 : 1;
      connections[l.target] = l.target in connections ? connections[l.target] + 1 : 1;
    });

    connections = _.chain(connections)
      .map((count, name) => ({
        count,
        name,
      }))
      .groupBy('count')
      .map((d, count) => ({
        count: +count,
        length: d.length,
      }))
      .orderBy('count')
      .value();
    const max = _.maxBy(connections, (v) => v.count)?.count || 0;
    const maxLength = _.maxBy(connections, (v) => v.length)?.length || 0;

    const hasNoConnected = nodes.some((n) => !links.some((l) => l.source === n.name || l.target === n.name));
    const min = hasNoConnected ? 0 : _.minBy(connections, (v) => v.count)?.count || 0;
    const minLength = _.minBy(connections, (v) => v.length)?.length || 0;

    connections = connections.map((v) => {
      v.percentage = (v.length / maxLength) * 100;
      return v;
    });
    return {
      connections,
      max,
      min,
      minLength,
      maxLength,
    };
  }, _.isEqual);

  setPadding = memoizeOne((item) => {
    if (item) {
      const { width } = item.getBoundingClientRect();
      this.setState({ padding: width / 2 });
    }
  });

  constructor(props) {
    super(props);
    this.state = {
      padding: 0,
    };
  }

  componentDidUpdate() {
    this.setPadding(this.item);
  }

  handleChange = (values) => {
    this.props.setFilter('linkConnection', values);
  }

  render() {
    const { padding } = this.state;
    const {
      links, nodes, linkConnection, graphFilterInfo: { nodeConnections = [] },
    } = this.props;

    const max = _.maxBy(nodeConnections, (v) => v.count)?.count || 0;
    const maxLength = _.maxBy(nodeConnections, (v) => v.length)?.length || 0;

    const hasNoConnected = nodes.some((n) => !links.some((l) => l.source === n.name || l.target === n.name));
    const min = hasNoConnected ? 0 : _.minBy(nodeConnections, (v) => v.count)?.count || 0;

    const connections = nodeConnections.map((v) => {
      v.percentage = (v.length / maxLength) * 100;
      return v;
    });
    if (min === max) {
      return null;
    }
    return (
      <div className="nodeConnectionFilter graphFilter graphFilterChart">
        <details open>
          <summary>
            Node Connections
          </summary>
          <div className="rangeDataChart">
            {_.range(min, max + 1).map((num, i) => {
              const connection = connections.find((v) => v.count === num);
              return (
                <div
                  key={num}
                  ref={i === 0 ? (ref) => this.item = ref : undefined}
                  style={{ height: connection ? `${connection.percentage}%` : 0 }}
                  className="item"
                  title={connection?.value}
                />
              );
            })}
          </div>
          <div className="ghRangeSelect" style={{ padding }}>
            <InputRange
              minValue={min}
              maxValue={max}
              allowSameValues
              value={{
                min: linkConnection.min < 0 ? min : linkConnection.min,
                max: linkConnection.max < 0 ? max : linkConnection.max,
              }}
              onChange={this.handleChange}
            />
          </div>
        </details>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  linkConnection: state.app.filters.linkConnection,
  graphFilterInfo: state.graphs.graphFilterInfo,
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeConnectionFilter);

export default Container;
