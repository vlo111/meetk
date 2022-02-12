import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ReactComponent as LogoSvg } from '../../assets/images/logo.svg';
import { forgotPasswordRequest, signInRequest } from '../../store/actions/account';
import WrapperSign from '../../components/WrapperSign';
import Input from '../../components/form/Input';
import Button from '../../components/form/Button';
import PasswordInput from '../../components/form/PasswordInput';

const Login = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  const [errors, setErrors] = useState('');
  const [pases, setPases] = useState([]);

  const signIn = async (ev) => {
    ev.preventDefault();

    const errorMessage = 'Invalid Email or Password';

    if (!email || !password) {
      setErrors(errorMessage);
      return;
    }

    const { payload } = await dispatch(signInRequest(email, password));
    const { data = {} } = payload;
    if (data.status !== 'ok') {
      setPases({ pasRep: password });
      if (!(pases.pasRep === password)) { setFailedLoginAttempts(failedLoginAttempts + 1); }
      setErrors(errorMessage);

      if (failedLoginAttempts === 3) {
        await dispatch(forgotPasswordRequest(email, `${origin}/sign/reset-password`));
      }
    }
  };

  return (
    <WrapperSign>
      <div className="signin_page">
        <div className="singIn_img">
          <Link to="/">
            <LogoSvg />
          </Link>
        </div>
        <div className="singIn_form">
          <form onSubmit={signIn} id="login" className="SigninAuthForm ">
            <div className="socialLogin">
              <h4>Sign in </h4>
            </div>
            <Input
              name="email"
              placeholder="Email Address"
              value={email}
              onChangeText={(value) => setEmail(value)}
              autoComplete="off"
            />
            <PasswordInput
              name="password"
              placeholder="Password"
              value={password}
              onChangeText={(value) => setPassword(value)}
              showIcon={(!!password)}
            />
            <Link to="/sign/forgot-password" className="forgotPassword">
              Forgot password?
            </Link>
            {failedLoginAttempts >= 3 ? (
              <p className="errorRecovery">
                Please check your email to recover your account
              </p>
            )
              : (errors && (failedLoginAttempts <= 3) && (
                <p className="errorRecovery">
                  {errors}
                </p>
              ))}
            <Button
              type="submit"
              className="submit"
              color="orange"
            >
              Sign In
            </Button>
            <p className="switchSignInMode">
              <span> Don't have an admin yet? </span>
              <Link to="/sign/sign-up" className="getstart">
                <a href=" ">Get started</a>
              </Link>
            </p>
          </form>
        </div>
      </div>
    </WrapperSign>
  );
};

export default Login;
