import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { getGraphsListRequest } from '../store/actions/graphs';
import { getShareGraphListRequest } from '../store/actions/share';
import GraphOrder from './graphData/GraphOrder';

class PageTabs extends Component {
  static propTypes = {
    tabs: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    className: PropTypes.string.isRequired,
    handleRouteChange: PropTypes.func,
    direction: PropTypes.oneOf(['vertical', 'horizontal']),
    getGraphsListRequest: PropTypes.func.isRequired,
    getShareGraphListRequest: PropTypes.func.isRequired,
  }

  static defaultProps = {
    handleRouteChange: undefined,
    direction: 'vertical',
  }

  constructor(props) {
    super(props);
    this.state = {
      selected: 'tab_card',
      showFilterModal: false,
    };
  }

  setActiveTab = (tab) => {
    if (this.props.handleRouteChange) {
      this.props.handleRouteChange(tab);
    } else {
      this.props.history.push(tab.to);
    }
  }

  onChange = (mode) => {
    this.setState({
      selected: mode,
    });

    this.props.onChange(mode);
  }

  openFilter = (value) => {
    this.setState({
      showFilterModal: value,
    });
  }

  filter = (value) => {
    const { page = 1, s } = queryString.parse(window.location.search);

    const { path: currentTab } = this.props.match;

    if (currentTab === '/' || currentTab === '/templates') {
      const status = currentTab.includes('template') ? 'template' : 'active';
      this.props.getGraphsListRequest(page, { s, filter: value, status });
    } else if (currentTab === '/shared') {
      this.props.getShareGraphListRequest(page, { s, filter: value });
    } else if (currentTab === '/public') {
      this.props.getGraphsListRequest(page, { filter: value, publicGraph: 1 });
    }
  }

  toggleDropDown = () => {
    const { showFilterModal } = this.state;
    this.setState({ showFilterModal: !showFilterModal });
    if (!showFilterModal) {
      this.graphSearch();
    }
  }

  render() {
    const {
      tabs, location, history, match, className, direction, ...props
    } = this.props;
    const tab = tabs.find((t) => t.to === location.pathname);
    const list = direction === 'vertical' ? _.reverse([...tabs]) : tabs;
    const isHome = direction === 'vertical' && className === 'homePageTabs';
    const { selected, showFilterModal } = this.state;

    const { path: currentTab } = this.props.match;
    return (
      <div id="verticalTabs" className={`${direction} ${!isHome ? className : 'homeWithUser'}`} {...props}>
        <ul className={`tabsList ${selected}`}>
          {list.filter((t) => !t.hidden).map((t) => (
            <li key={t.name} className={`item ${t.to === location.pathname ? 'active' : ''}`} onClick={() => this.setActiveTab(t)}>
              { t.name === 'Public'
                ? <i className="fa fa-globe" />
                : null}
              {t.name}
            </li>
          ))}
        </ul>

        <GraphOrder
          filter={this.filter}
          toggleDropDown={this.toggleDropDown}
          currentTab={currentTab}
          showFilterModal={showFilterModal}
        />

        <div className="content">
          {tab?.component}
        </div>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  getGraphsListRequest,
  getShareGraphListRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PageTabs);

export default withRouter(Container);
