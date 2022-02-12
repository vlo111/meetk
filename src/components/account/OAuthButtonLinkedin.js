import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { oAuthRequest } from '../../store/actions/account';
import linkedinImg from '../../assets/images/icons/linkedin.png';
import Utils from '../../helpers/Utils';

const { REACT_APP_LINKEDIN_CLIENT_ID } = process.env;

class OAuthButtonLinkedin extends Component {
  static propTypes = {
    oAuthRequest: PropTypes.func.isRequired,
  }

  componentDidMount() {
    if (window.location.pathname.endsWith('/linkedin')) {
      const { code } = queryString.parse(window.location.search);
      const redirectUri = window.location.origin + window.location.pathname;
      this.props.oAuthRequest('linkedin', { code, redirectUri });
    }
  }

  handleClick = () => {
    const query = queryString.stringify({
      client_id: REACT_APP_LINKEDIN_CLIENT_ID,
      redirect_uri: `${window.location.origin}/sign/oauth/linkedin`,
      response_type: 'code',
      state: 'fooobar',
      scope: ['r_liteprofile', 'r_emailaddress'].join(' '),
    });
    const win = Utils.popupWindow(`https://www.linkedin.com/oauth/v2/authorization?${query}`, 'Linkedin', 450, 600);
    this.timeout = setInterval(() => {
      try {
        const { search, pathname, origin } = win.location;
        const { code } = queryString.parse(search);
        if (pathname.endsWith('/linkedin') && code) {
          const redirectUri = origin + pathname;
          win.close();
          clearTimeout(this.timeout);

          this.props.oAuthRequest('linkedin', { code, redirectUri });
        }
      } catch (e) {
        //
      }
    }, 1000);
  }

  render() {
    return (
      <button data-testid="linkedin" type="button" onClick={this.handleClick} className="button  linkedin">
        <img src={linkedinImg} alt="Linkedin" />
      </button>
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
)(OAuthButtonLinkedin);

export default Container;
