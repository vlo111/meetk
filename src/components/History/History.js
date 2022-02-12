import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import { connect } from 'react-redux';
import GraphHistory from './GraphHistory';

class Histroy extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    filters: PropTypes.object.isRequired,
    customFields: PropTypes.object,
  }

  static defaultProps = {
    customFields: undefined,
  }

  render() {
    const {
      singleGraph, match: { params: { graphId } }, location: { pathname },
    } = this.props;
    const show = pathname.startsWith('/graphs/history/');
    if (!graphId || !show) {
      return null;
    }
    return <GraphHistory graphId={graphId} />;
  }
}

const mapStateToProps = (state) => ({

});

const mapDispatchToProps = {
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Histroy);

export default withRouter(Container);
