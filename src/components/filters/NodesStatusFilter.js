import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import ChartUtils from '../../helpers/ChartUtils';
import Button from '../form/Button';
import Checkbox from '../form/Checkbox';

class NodesStatusFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    nodes: PropTypes.array.isRequired,
  };

  checkAllNodes = memoizeOne((status) => {
    if (status.length) {
      this.props.setFilter('nodeStatus', status.map((d) => d.status), true);
    }
  }, _.isEqual);

  handleChange = (value) => {
    const { filters } = this.props;
    const i = filters.nodeStatus.indexOf(value);
    if (i > -1) {
      filters.nodeStatus.splice(i, 1);
    } else {
      filters.nodeStatus.push(value);
    }
    this.props.setFilter('nodeStatus', filters.nodeStatus);
  };

  toggleAll = (fullData, allChecked) => {
    if (allChecked) {
      this.props.setFilter('nodeStatus', []);
    } else {
      this.props.setFilter(
        'nodeStatus',
        fullData.map((d) => d.status),
      );
    }
  };

  render() {
    const { filters, graphFilterInfo: { nodeStatus = [] } } = this.props;
    this.checkAllNodes(nodeStatus);
    const allChecked = nodeStatus.length === filters.nodeStatus.length;
    return (
      <div className="nodesStatusFilter graphFilter">
        <details open>
          <summary>
            Node Status
          </summary>
          <ul className="list">
            <li className="item">
              <div className="filterCheckBox">
                <Checkbox
                  label="All"
                  id="allnodeStatus"
                  checked={allChecked}
                  onChange={() => this.toggleAll(nodeStatus, allChecked)}
                />
              </div>
              <span className="badge">{_.sumBy(nodeStatus, 'length')}</span>
            </li>
            {nodeStatus.map((item) => (
              <li
                key={item.status}
                className="item"
              >
                <div className="filterCheckBox">

                  <div className="checkWithLabel">
                    <Checkbox
                      id={item.status}
                      checked={filters.nodeStatus.includes(item.status)}
                      onChange={() => this.handleChange(item.status)}
                    />
                    <label className="check-label pull-left" htmlFor={item.status}>{item.status}</label>
                  </div>
                </div>
                <span className="badge">{item.length}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  filters: state.app.filters,
  customFields: state.graphs.singleGraph.customFields || {},
  graphFilterInfo: state.graphs.graphFilterInfo,
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodesStatusFilter);

export default Container;
