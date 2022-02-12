import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import ChartUtils from '../../helpers/ChartUtils';
import Button from '../form/Button';
import Checkbox from '../form/Checkbox';

class NodeTypesFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    nodes: PropTypes.array.isRequired,
  }

  checkAllNodes = memoizeOne((types) => {
    if (types.length) {
      this.props.setFilter('nodeTypes', types.map((d) => d.type), true);
    }
  }, _.isEqual);

  getCustomFields = memoizeOne((customFields) => {
    const keys = [];
    _.forEach(customFields, (d) => {
      keys.push(...Object.keys(d));
    });
    return _.uniq(keys);
  }, _.isEqual);

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
      openList: [],
    };
  }

  handleChange = (value) => {
    const { filters } = this.props;

    const i = filters.nodeTypes.indexOf(value);
    if (i > -1) {
      filters.nodeTypes.splice(i, 1);
    } else {
      filters.nodeTypes.push(value);
    }

    this.props.setFilter('nodeTypes', filters.nodeTypes);
  }

  handleFilterChange = (value) => {
    const { filters } = this.props;
    const i = filters.nodeCustomFields.indexOf(value);
    if (i > -1) {
      filters.nodeCustomFields.splice(i, 1);
    } else {
      filters.nodeCustomFields.push(value);
    }

    this.props.setFilter('nodeCustomFields', filters.nodeCustomFields);
  }

  toggleMore = () => {
    const { showMore } = this.state;
    this.setState({ showMore: !showMore });
  }

  toggleDropdown = (key) => {
    const { openList } = this.state;
    const i = openList.indexOf(key);
    if (i > -1) {
      openList.splice(i, 1);
    } else {
      openList.push(key);
    }
    this.setState({ openList });
  }

  toggleAll = (fullData, allChecked) => {
    if (allChecked) {
      this.props.setFilter('nodeTypes', []);
    } else {
      this.props.setFilter('nodeTypes', fullData.map((d) => d.type));
    }
  }

  render() {
    const { showMore, openList } = this.state;
    const {
      nodes, filters, customFields, graphFilterInfo: { nodeTypes = [] }, singleGraph,
    } = this.props;
    this.checkAllNodes(nodeTypes);
    const types = showMore ? nodeTypes : _.chunk(nodeTypes, 5)[0] || [];
    if (nodeTypes.length < 2) {
      return null;
    }
    if (singleGraph) {
    }
    console.log(singleGraph[0]?.nodes[0]?.customFields);
    const allChecked = nodeTypes.length === filters.nodeTypes.length;
    return (
      <div className="nodesTypesFilter graphFilter">
        <details open>
          <summary>
            Node Types
          </summary>
          <ul className="list">
            <li className="item">
              <div className="filterCheckBox">
                <Checkbox
                  label="All"
                  id="allNodes"
                  checked={allChecked}
                  onChange={() => this.toggleAll(nodeTypes, allChecked)}
                />
              </div>
              <span className="badge">
                {_.sumBy(nodeTypes, 'length')}
              </span>
            </li>
            {types.map((item) => (
              <li key={item.type} className="item">
                <div className="filterCheckBox">
                  <div className="checkWithLabel">
                    <Checkbox
                      id={item.type}
                      checked={filters.nodeTypes.includes(item.type)}
                      onChange={() => this.handleChange(item.type)}
                    />
                    <label className="check-label pull-left" htmlFor={item.type}>{item.type}</label>
                  </div>
                  <div>
                    {!_.isEmpty(customFields[item.type]) ? (
                      <Button
                        className="dropdownArrow"
                        icon="fa-chevron-down"
                        onClick={() => this.toggleDropdown(item.type)}
                      />
                    ) : null}
                    {openList.includes(item.type) && customFields[item.type] ? (
                      <ul className="list subList">
                        {_.map(customFields[item.type], (val, key) => (
                          <li key={key} className="item">
                            <div className="filterCheckBox nestedCheckBox">
                              <div className="checkWithLabel">
                                <Checkbox
                                  id={`nodes_${key}`}
                                  onChange={() => this.handleFilterChange(key)}
                                  checked={filters.nodeCustomFields.includes(key)}
                                />
                                <label className="check-label pull-left" htmlFor={key}>{key}</label>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
                <div className="dashed-border" />
                <span className="badge">
                  {item.length}
                </span>
              </li>
            ))}
            {nodeTypes.length > types.length || showMore ? (
              <li className="item">

                <button className="more" onClick={this.toggleMore}>
                  {showMore ? 'Less' : 'More'}
                </button>
              </li>
            ) : null}
          </ul>
        </details>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  filters: state.app.filters,
  customFields: state.graphs.singleGraph.customFields || {},
  singleGraph: state.graphs.singleGraph || {},
  graphFilterInfo: state.graphs.graphFilterInfo,
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeTypesFilter);

export default Container;
