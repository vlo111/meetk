import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class VerticalTabs extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    tabs: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    myAccount: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  }

  static defaultProps = {
    onChange: undefined,
  }

  setActiveTab = (tab) => {
    this.props.history.push(tab.to);
    if (this.props.onChange) {
      this.props.onChange(tab);
    }
  }

  render() {
    const {
      children, tabs, location, history, match, myAccount, ...props
    } = this.props;
    const tab = tabs.find((t) => t.to === location.pathname);

    const checkHomeTabs = !!((
      tab.name === 'Home'
        || tab.name === 'Friends'
        || tab.name === 'Shared Graphs'
        || tab.name === 'Templates'));

    if (tab.name) {
      return (
        <div className={checkHomeTabs ? 'homePageTabs' : 'verticalTabs'} {...props}>
          <ul className="tabsList" />
          <div className="content">
            {tab?.component}
          </div>
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  myAccount: state.account.myAccount,
});

const mapDispatchToProps = {
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(VerticalTabs);

export default withRouter(Container);
