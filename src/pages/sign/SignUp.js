import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { toast } from 'react-toastify';
import Input from '../../components/form/Input';
import Button from '../../components/form/Button';
import { signUpRequest } from '../../store/actions/account';
import WrapperSign from '../../components/WrapperSign';
import PasswordInput from '../../components/form/PasswordInput';
import { ReactComponent as LogoSvg } from '../../assets/images/logo.svg';

class SignUp extends Component {
  static propTypes = {
    signUpRequest: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      requestData: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        passwordConfirm: '',
      },
      errors: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        passwordConfirm: '',
      },
    };
  }

  handleChange = (e) => {
    const { errors, requestData } = this.state;
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

  signUp = async (ev) => {
    ev.preventDefault();
    const { requestData } = this.state;
    if (requestData.passwordConfirm !== requestData.password) {
      toast.error('Passwords do notjhbhjkbjkb match');
      return;
    }

    this.setState({ loading: true });
    const { payload } = await this.props.signUpRequest(requestData);
    const { data = {} } = payload;
    if (data.status === 'ok') {
      this.props.history.push('/sign/sign-in');
      toast.info('Please check your email');
      return;
    }
    if (_.isEmpty(data.errors)) {
      toast.error(data.message);
    }

    this.setState({ errors: data.errors || {}, loading: false });
  };

  validate = (name, value) => {
    const { requestData } = this.state;
    switch (name) {
      case 'firstName':
        if (!value || value.trim() === '') {
          return 'First name is required';
        }
        return '';

      case 'lastName':
        if (!value || value.trim() === '') {
          return 'Last name is required';
        }
        return '';

      case 'email':
        if (!value) {
          return 'Email is required';
        }

        if (
          !value.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
        ) {
          return 'Enter a valid email address';
        }
        return '';

      case 'password':
        if (!value) {
          return 'Password is required';
        } if (value.length < 8 || value.length > 15) {
          return 'Please fill at least 8 character';
        } if (!value.match(/[a-z]/g)) {
          return 'Please enter at least lower character.';
        } if (!value.match(/[A-Z]/g)) {
          return 'Please enter at least upper character.';
        } if (!value.match(/[0-9]/g)) {
          return 'Please enter at least one digit.';
        }
        return '';

      case 'passwordConfirm':
        if (!value) {
          return 'Confirm password is required';
        } if (value !== requestData.password) {
          return 'Password and confirm password must be same';
        }
        return '';

      default: {
        return '';
      }
    }
  };

  render() {
    const { requestData, errors, loading } = this.state;

    return (
      <WrapperSign>
        <div className="SignUpRight">
          <Link to="/">
            <LogoSvg className="logo white" />
          </Link>
          <div>
            <form
              onSubmit={this.signUp}
              id="registration"
              className="SignUpAuthform "
            >
              <div className="forgotPasswordText">
                <h4>Registraction </h4>
              </div>
              <div className="signUpFullName">
                <Input
                  data-testid="firstName"
                  name="firstName"
                  className={`${
                    errors.firstName ? 'border-error' : null
                  }`}
                  placeholder="First Name"
                  value={requestData.firstName}
                  error={errors.firstName}
                  onChange={this.handleChange}
                  autoComplete="off"
                />
                <Input
                  data-testid="lastName"
                  name="lastName"
                  className={`${
                    errors.lastName ? 'border-error' : null
                  }`}
                  placeholder="Last Name"
                  value={requestData.lastName}
                  error={errors.lastName}
                  onChange={this.handleChange}
                  autoComplete="off"
                />
              </div>
              <Input
                data-testid="email"
                name="email"
                className={`${
                  errors.email ? 'border-error' : null
                }`}
                type="email"
                placeholder="E-mail"
                value={requestData.email}
                error={errors.email}
                onChange={this.handleChange}
                autoComplete="off"
              />

              <PasswordInput
                data-testid="password"
                name="password"
                className={`${
                  errors.password ? 'border-error' : null
                }`}
                placeholder="Password"
                value={requestData.password}
                error={errors.password}
                onChange={this.handleChange}
                autoComplete="off"
                showIcon={(!!requestData.password)}
              />

              <PasswordInput
                name="passwordConfirm"
                className={`${
                  errors.passwordConfirm ? 'border-error' : null
                }`}
                placeholder="Confirm password"
                value={requestData.passwordConfirm}
                error={errors.passwordConfirm}
                onChange={this.handleChange}
                autoComplete="off"
                showIcon={(!!requestData.passwordConfirm)}
              />

              <Button
                color="orange"
                className="submit"
                type="submit"
                loading={loading}
              >
                Start
              </Button>
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
  signUpRequest,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(SignUp);

export default Container;
