import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import fbImg from '../../assets/images/icons/fb.png';
import { oAuthRequest } from '../../store/actions/account';

const { REACT_APP_FACEBOOK_APP_ID } = process.env;

class OAuthButtonFacebook extends Component {
  static propTypes = {
    oAuthRequest: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    window.fbAsyncInit = this.handleFbInit;
  }

  handleFbInit = () => {
    const { FB } = window;
    FB.init({
      appId: REACT_APP_FACEBOOK_APP_ID,
      xfbml: true,
      version: 'v8.0',
    });
  }

  handleFacebookClick = () => {
    const { FB } = window;

    // const redirectUri = `${window.location.origin}/sign/oauth/facebook`;
    FB.getLoginStatus((response) => {
      const { status, authResponse } = response;
      if (status === 'connected') {
        const { accessToken } = authResponse || {};
        if (accessToken) {
          this.props.oAuthRequest('facebook', { accessToken });
          return;
        }
      } else if (status === 'not_authorized') {
        console.warn(`Auth error: ${status}`);
      }
      FB.login((res) => {
        const { accessToken } = res.authResponse || {};
        if (accessToken) {
          this.props.oAuthRequest('facebook', { accessToken });
        }
      }, { scope: 'public_profile,email' });
    });
  }

  render() {
    return (
      <>
        <Helmet>
          <script async defer src="https://connect.facebook.net/en_US/sdk.js" crossOrigin="anonymous" />
        </Helmet>
        <button data-testid="facebook" type="button" className="button facebook" onClick={this.handleFacebookClick}>
          <img src={fbImg} alt="Facebook" />
        </button>
      </>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  oAuthRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OAuthButtonFacebook);

export default Container;
