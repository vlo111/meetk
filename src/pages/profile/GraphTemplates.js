import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import memoizeOne from 'memoize-one';
import { withRouter } from 'react-router-dom';
import { getGraphsListRequest } from '../../store/actions/graphs';
import GraphCardItem from '../../components/graphData/GraphCardItem';

class Home extends Component {
  static propTypes = {
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsList: PropTypes.array.isRequired,
  }

  getGraphsList = memoizeOne((page = 1, s) => {
    const status = 'template';
    const order = JSON.parse(localStorage.getItem(`/${status}s`));
    this.props.getGraphsListRequest(page, {
      s, filter: order, status,
    });
  })

  render() {
    const { graphsList } = this.props;
    const { page = 1, s } = queryString.parse(window.location.search);
    this.getGraphsList(page, s);

    return (
      <>
        <div className="homPageHeader">
          <div><p>Templates</p></div>
        </div>
        <div className="graphsCard graph_template_card">
          <GraphCardItem graphs={graphsList} headerTools="template" />
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
)(Home);

export default withRouter(Container);
