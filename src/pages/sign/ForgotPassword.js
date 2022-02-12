import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { ReactComponent as LogoSvg } from '../../assets/images/logo.svg';
import { forgotPasswordRequest } from '../../store/actions/account';
import WrapperSign from '../../components/WrapperSign';
import Input from '../../components/form/Input';
import Button from '../../components/form/Button';

class ForgotPassword extends Component {
  static propTypes = {
    forgotPasswordRequest: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      requestData: {
        email: '',
      },
      error: null,
    };
  }

  handleChange = (e) => {
    const { requestData, errors } = this.state;
    this.setState({
      errors: {
        ...errors,
        [e.target.name]: this.validate(e.target.name, e.target.value),
      },
      requestData: {
        ...requestData,
        [e.target.name]: e.target.value,
      },
    });
  };

  resetPassword = async (ev) => {
    ev.preventDefault();

    this.setState({ loading: true });

    const { requestData } = this.state;
    const error = this.validate('email', requestData.email);
    if (error) {
      this.setState({ error });
    } else {
      const { origin } = window.location;
      const { payload: { data } } = await this.props.forgotPasswordRequest(
        requestData.email,
        `${origin}/sign/reset-password`,
      );

      if (data.status === 'error') {
        this.setState({ error: data.message });
      }
      if (data.status === 'ok') {
        toast.info('Your password sented');
        setTimeout(() => {
          this.props.history.replace(origin);
        }, 1200);
      }
    }
    this.setState({ loading: false });
  }

  validate = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) {
          return 'Email is Required';
        } if (
          !value.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
        ) {
          return 'Enter a valid email address';
        }
        return '';

      default: {
        return '';
      }
    }
  };

  render() {
    const { token } = this.props;
    const { requestData, loading, error } = this.state;
    if (token) {
      return <Redirect to="/" />;
    }

    return (
      <WrapperSign>
        <div className="forgot_password">
          <div className="forgotLogo">
            <Link to="/">
              <LogoSvg className="logo white" />
            </Link>
          </div>
          <div className="forgot_form">
            <form
              onSubmit={this.resetPassword}
              id="login"
              className="SigninAuthForm"
            >
              <div className="socialReset">
                <h4>Forgot your password? </h4>
              </div>
              <Input
                className={`${error ? 'border-error' : null
                }`}
                name="email"
                type="email"
                placeholder="E-mail"
                value={requestData.email}
                onChange={this.handleChange}
                error={error}
                autoComplete="off"
              />
              <div className="row">
                <Button
                  type="submit"
                  className="submit"
                  color="blue"
                  loading={loading}
                >
                  Send
                </Button>
              </div>
            </form>
          </div>
        </div>

      </WrapperSign>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.account.token,
});

const mapDispatchToProps = {
  forgotPasswordRequest,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);

export default Container;
