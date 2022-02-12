import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import { getShareGraphListRequest } from '../store/actions/share';
import GraphCardItem from '../components/graphData/GraphCardItem';

class Shared extends Component {
  static propTypes = {
    shareGraphsList: PropTypes.array.isRequired,
    getShareGraphListRequest: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const order = JSON.parse(localStorage.getItem('/shared')) || 'newest';
    const { page = 1, s } = queryString.parse(window.location.search);
    this.props.getShareGraphListRequest(page, { s, filter: order });
  }

  render() {
    const {
      shareGraphsList,
    } = this.props;
    return (
      <>
        <div className="homPageHeader">
          <div><p>Shared with me</p></div>
        </div>
        <div className="graphsCard graph_shared_card">
          <GraphCardItem graphs={shareGraphsList} headerTools="shared" />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  shareGraphsList: state.share.shareGraphsList,
  shareGraphsListStatus: state.share.shareGraphsListStatus,
  shareGraphsListInfo: state.share.shareGraphsListInfo,
});

const mapDispatchToProps = {
  getShareGraphListRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Shared);

export default withRouter(Container);
