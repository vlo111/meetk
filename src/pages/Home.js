import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import memoizeOne from 'memoize-one';
import { withRouter } from 'react-router-dom';
import { getGraphsListRequest } from '../store/actions/graphs';
import GraphCardItem from '../components/graphData/GraphCardItem';
import { ReactComponent as PlusSvg } from '../assets/images/icons/plusGraph.svg';
import Button from '../components/form/Button';
import Filter from '../assets/images/filter_Home.png';
import { getShareGraphListRequest } from '../store/actions/share';
import GraphOrder from '../components/graphData/GraphOrder';

class Home extends Component {
  static propTypes = {
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsList: PropTypes.array.isRequired,
    mode: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
  }

  getGraphsList = memoizeOne((page, s) => {
    const order = JSON.parse(localStorage.getItem('/')) || 'newest';
    this.props.getGraphsListRequest(page, { s, filter: order });
  })

  constructor(props) {
    super(props);
    this.state = {
      showFilterModal: false,
    };
  }

  openFilter = (value) => {
    this.setState({
      showFilterModal: value,
    });
  }

  startGraph = () => {
    window.location.href = '/graphs/create';
  }

  compareGraph = () => {
    window.location.href = '/graphs/compare';
  }

  filter = (value) => {
    const { page = 1, s } = queryString.parse(window.location.search);

    const { path: currentTab } = this.props.match;

    if (currentTab === '/' || currentTab === '/templates') {
      const status = currentTab.includes('template') ? 'template' : 'active';
      this.props.getGraphsListRequest(page, { s, filter: value, status });
    } else if (currentTab === '/shared') {
      this.getShareGraphListRequest(page, { s, filter: value });
    } else if (currentTab === '/public') {
      this.props.getGraphsListRequest(page, { filter: value, publicGraph: 1 });
    }
  }

  toggleDropDown = () => {
    const { showFilterModal } = this.state;
    this.setState({ showFilterModal: !showFilterModal });
  }

  render() {
    const {
      graphsList, mode,
    } = this.props;
    const { page = 1, s } = queryString.parse(window.location.search);
    const { showFilterModal } = this.state;
    this.getGraphsList(page, s);
    const { path: currentTab } = this.props.match;
    return (
      <>
        <div className="homPageHeader">
          <div><p>My Schemas</p></div>
          <div className="homPageButtons">
            <Button className="startGraph" role="button" onClick={this.startGraph}>
              <PlusSvg />
              <h3>New</h3>
            </Button>
            <Button className="btn-classic__alt" onClick={this.compareGraph}>
              Compare graphs
            </Button>
            <div className="filterHome" onClick={() => this.openFilter(!showFilterModal)}>
              <img src={Filter} alt="" />
            </div>
          </div>
          <GraphOrder
            filter={this.filter}
            toggleDropDown={this.toggleDropDown}
            currentTab={currentTab}
            showFilterModal={showFilterModal}
          />
        </div>
        <div className={`${mode === 'tab_card' ? 'graphsCard' : 'graphsList'} ${!graphsList.length ? 'empty' : ''}`}>
          {s ? (
            <h2 className="searchResult">
              {'Search Result for: '}
              <span>{s}</span>
            </h2>
          ) : null}
          <GraphCardItem graphs={graphsList} headerTools="home" />
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
