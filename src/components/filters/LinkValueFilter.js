import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import InputRange from 'react-input-range';
import { setFilter } from '../../store/actions/app';

class LinkValueFilter extends Component {
  static propTypes = {
    linkValue: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    links: PropTypes.array.isRequired,
  }

  getLinkValue = memoizeOne((links) => {
    let values = _.chain(links)
      .groupBy('value')
      .map((d, key) => ({
        length: d.length,
        value: +key,
      }))
      .orderBy('value', 'desc')
      .value();
    const max = _.maxBy(values, (v) => v.value)?.value || 1;
    const maxLength = _.maxBy(values, (v) => v.length)?.length || 1;

    const min = _.minBy(values, (v) => v.value)?.value || 1;
    const minLength = _.minBy(values, (v) => v.length)?.length || 1;

    values = values.map((v) => {
      v.percentage = (v.length / maxLength) * 100;
      return v;
    });
    return {
      values,
      max,
      min,
      minLength,
      maxLength,
    };
  }, (a, b) => _.isEqual(a[0].map((d) => d.value), b[0].map((d) => d.value)));

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
    this.props.setFilter('linkValue', values);
  }

  render() {
    const { padding } = this.state;
    const { linkValue, graphFilterInfo: { linksValue = [] } } = this.props;
    const maxLength = _.maxBy(linksValue, (v) => v.length)?.length || 1;
    const values = linksValue.map((v) => {
      v.percentage = (v.length / maxLength) * 100;
      return v;
    });
    const max = _.maxBy(values, (v) => v.value)?.value || 1;
    const min = _.minBy(values, (v) => v.value)?.value || 1;
    if (min === max) {
      return null;
    }
    return (
      <div className="linkValueFilter graphFilter graphFilterChart">
        <h4 className="title">Link Values</h4>
        <div className="rangeDataChart">
          {_.range(min, max + 1).map((num, i) => {
            const value = values.find((v) => v.value === num);
            return (
              <div
                key={num}
                ref={i === 0 ? (ref) => this.item = ref : undefined}
                style={{ height: value ? `${value.percentage}%` : 0 }}
                className="item"
                title={value?.value}
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
              min: linkValue.min < 0 ? min : linkValue.min,
              max: linkValue.max < 0 ? max : linkValue.max,
            }}
            onChange={this.handleChange}
          />
        </div>

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  linkValue: state.app.filters.linkValue,
  graphFilterInfo: state.graphs.graphFilterInfo,
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LinkValueFilter);

export default Container;
