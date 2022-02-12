import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import { connect } from 'react-redux';
import FiltersModal from './FiltersModal';
import Chart from '../../Chart';
import { setFilter } from '../../store/actions/app';

class Filters extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    filters: PropTypes.object.isRequired,
    customFields: PropTypes.object,
  }

  static defaultProps = {
    customFields: undefined,
  }

  renderChart = memoizeOne((filters, customFields) => {
    if (customFields) {
      Chart.render(undefined, { filters, customFields });
    }
  })

  render() {
    const {
      filters, customFields, match: { params: { graphId } }, location: { pathname },
    } = this.props;
    const show = pathname.startsWith('/graphs/filter/') || pathname.startsWith('/graphs/embed/filter/');
    this.renderChart(filters, customFields);
    if (!graphId || !show) {
      return null;
    }
    return <FiltersModal />;
  }
}

const mapStateToProps = (state) => ({
  filters: state.app.filters,
  customFields: state.graphs.singleGraph.customFields,
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Filters);

export default withRouter(Container);
