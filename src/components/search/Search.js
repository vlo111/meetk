import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import SearchModal from './SearchModal';
import Chart from '../../Chart';

const { REACT_APP_MAX_NODE_AND_LINK } = process.env;

/**
 * This Component currently is not used !!!
 */

class Search extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    graphInfo: PropTypes.object.isRequired,
    showSearch: PropTypes.bool.isRequired,
    exploreMode: PropTypes.bool.isRequired,
  };

  render() {
    const {
      showSearch,
      exploreMode,
      graphInfo,
      match: {
        params: { graphId },
      },
      history: { location: { pathname } },
    } = this.props;
    const nodes = Chart.getNodes();

    if (!pathname.startsWith('/graphs/view/')) {
      return <></>;
    }

    if (graphId && Object.keys(graphInfo)?.length && (
      showSearch
      || (graphInfo?.totalNodes + graphInfo?.totalLinks > REACT_APP_MAX_NODE_AND_LINK
        && !nodes?.length && !exploreMode)
    )) {
      if (!exploreMode) {
        Chart.render({ nodes: [], links: [], labels: [] }, { ignoreAutoSave: true });
      }
      return <SearchModal history={this.props.history} />;
    }
    return <></>;
  }
}

const mapStateToProps = (state) => ({
  filters: state.app.filters,
  customFields: state.graphs.singleGraph.customFields,
  graphInfo: state.graphs.graphInfo,
  showSearch: state.app.showSearch,
  exploreMode: state.app.exploreMode,
});

const mapDispatchToProps = {
};

const Container = connect(mapStateToProps, mapDispatchToProps)(Search);

export default withRouter(Container);
