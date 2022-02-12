import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import OfflineIndicator from './OfflineIndicator';
import Loading from './Loading';
import { getMyAccountRequest } from '../store/actions/account';
import { socketInit } from '../store/actions/socket';

Modal.setAppElement(document.body);

class Wrapper extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    token: PropTypes.string.isRequired,
    isLoading: PropTypes.bool.isRequired,
    socketInit: PropTypes.func.isRequired,
    getMyAccountRequest: PropTypes.func.isRequired,
    className: PropTypes.string,
    auth: PropTypes.bool,
    singleGraph: PropTypes.object.isRequired,
  }

  static defaultProps = {
    auth: true,
    className: undefined,
  }

  componentDidMount() {
    const { auth } = this.props;
    if (auth) {
      this.props.getMyAccountRequest();
    }
    this.props.socketInit();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.singleGraph.id !== this.props.singleGraph.id) {
      this.props.socketInit();
    }
  }

  render() {
    const {
      className, children, token, isLoading, auth,
    } = this.props;
    if (!token && auth) {
      return (<Redirect to="/sign/sign-in" />);
    }
    return (
      <main className={className}>
        {children}
        {isLoading ? (
          <Loading className="mainLoading" size={50} />
        ) : null}
        <OfflineIndicator />
      </main>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.account.token,
  isLoading: state.app.isLoading,
  singleGraph: state.graphs.singleGraph,
});

const mapDispatchToProps = {
  getMyAccountRequest,
  socketInit,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Wrapper);

export default Container;
