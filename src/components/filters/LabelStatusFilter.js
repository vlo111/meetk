import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import ChartUtils from '../../helpers/ChartUtils';
import LabelUtils from '../../helpers/LabelUtils';
import { setFilter } from '../../store/actions/app';
import Button from '../form/Button';
import Checkbox from '../form/Checkbox';

class LabelStatusFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    labels: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
  }

  checkALlLabels = memoizeOne((labelsFormatted) => {
    if (labelsFormatted.length) {
      this.props.setFilter('labelStatus', labelsFormatted.map((d) => d.status), true);
    }
  }, _.isEqual);

  handleChange = (value) => {
    const { filters } = this.props;
    const i = filters.labelStatus.indexOf(value);

    if (i > -1) {
      filters.labelStatus.splice(i, 1);
    } else {
      filters.labelStatus.push(value);
    }
    this.props.setFilter('labelStatus', _.uniq(filters.labelStatus));
  }

  toggleAll = (fullData, allChecked) => {
    if (allChecked) {
      this.props.setFilter('labelStatus', []);
    } else {
      this.props.setFilter('labelStatus', fullData.map((d) => d.status));
    }
  }

  statusName = (label) => LabelUtils.lableStatusNane(label)

  render() {
    const { labels, filters, graphFilterInfo: { labelsStatus = [] } } = this.props;
    this.checkALlLabels(labels);
    const allChecked = labelsStatus.length === filters.labelStatus.length;
    if (labelsStatus.length < 1) {
      return null;
    }

    return (
      <div className="nodesStatusFilter graphFilter">
        <details open>
          <summary>
            Label Status
          </summary>
          <ul className="list">
            <li className="item">
              <div className="filterCheckBox">
                <Checkbox
                  id="allLabelStatus"
                  label="All"
                  checked={allChecked}
                  onChange={() => this.toggleAll(labelsStatus, allChecked)}
                />
              </div>
              <span className="badge">
                {_.sumBy(labelsStatus, 'length')}
              </span>
            </li>
            {labelsStatus.map((item) => (
              <li key={item.status} className="item">
                <div className="filterCheckBox">
                  <Checkbox
                    id={this.statusName(item.status)}
                    label={this.statusName(item.status)}
                    checked={filters.labelStatus.includes(item.status)}
                    onChange={() => this.handleChange(item.status)}
                  />
                </div>
                <span className="badge">
                  {item.length}
                </span>
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
  graphFilterInfo: state.graphs.graphFilterInfo,
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LabelStatusFilter);

export default Container;
