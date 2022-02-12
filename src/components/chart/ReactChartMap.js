import React, { Component } from 'react';
import * as d3 from 'd3';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';
import ReactChartMapSvg from './ReactChartMapSvg';
import Button from '../form/Button';
import { setActiveButton, setGridIndexes, toggleGraphMap } from '../../store/actions/app';

class ReactChartMap extends Component {
  render() {
    const { showGraphMap } = this.props;
    if (!showGraphMap) {
      return null;
    }
    return (
      <div className="reactChartMapWrapper">
        <ReactChartMapSvg />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  showGraphMap: state.app.showGraphMap,
});
const mapDispatchToProps = {
  toggleGraphMap,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReactChartMap);

export default Container;
