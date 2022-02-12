import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import { getGraphsListRequest } from '../store/actions/graphs';
import GraphCardItem from '../components/graphData/GraphCardItem';

class Public extends Component {
  static propTypes = {
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsList: PropTypes.array.isRequired,
  }

  getGraphsList = memoizeOne((page) => {
    const order = JSON.parse(localStorage.getItem('/public')) || 'newest';
    this.props.getGraphsListRequest(page, { filter: order, publicGraph: 1 });
  })

  render() {
    const {
      graphsList,
    } = this.props;
    const { page = 1 } = queryString.parse(window.location.search);
    this.getGraphsList(page);
    return (
      <>
        <div className="homPageHeader">
          <div><p>Public Graphs</p></div>
        </div>
        <div className="graphsCard graph_public_card">
          <GraphCardItem graphs={graphsList} headerTools="public" />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  graphsListStatus: state.graphs.graphsListStatus,
  graphsList: state.graphs.graphsList || [],
  graphsListInfo: state.graphs.graphsListInfo || {},
});

const mapDispatchToProps = {
  getGraphsListRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Public);

export default withRouter(Container);
