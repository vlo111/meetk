import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import WrapperSign from '../../components/WrapperSign';
import Button from '../../components/form/Button';
import PasswordInput from '../../components/form/PasswordInput';
import Validate from '../../helpers/Validate';
import { ReactComponent as LogoSvg } from '../../assets/images/logo.svg';
import { resetPasswordRequest } from '../../store/actions/account';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [requestData, setRequestData] = useState({
    password: '',
    passwordConfirm: '',
  });
  const [errors, setErrors] = useState({
    password: '',
    passwordConfirm: '',
  });

  const handleChange = async (path, value) => {
    setRequestData((prevState) => ({
      ...prevState,
      [path]: value,
    }));
  };

  const signIn = async (ev) => {
    ev.preventDefault();
    const { token } = queryString.parse(window.location.search);
    [errors.password, errors.passwordConfirm, errors.errors] = Validate.passwordValidation(requestData);

    if (errors.password.trim().length > 0 || errors.passwordConfirm.trim().length > 0) {
      setErrors((prevState) => ({
        ...prevState,
      }));
    } else {
      try {
        const { payload: { data } } = await dispatch(resetPasswordRequest(token, requestData.password && requestData.passwordConfirm));
        if (data.status === 'ok') {
          toast.info('Password successfully updated');
          setTimeout(() => {
            history.push('/');
          }, 1200);
        }
        toast.dismiss(toast);
        toast.info(data.message);
        setErrors((prevState) => ({
          ...prevState,
        }));
      } catch (e) {
        //
      }
    }
  };
  return (
    <div>
      <WrapperSign>
        <div className="left forgotPassword">
          <Link to="/">
            <LogoSvg className="logo white logoReset" />
          </Link>
        </div>
        <div className="right">
          <div>
            <form onSubmit={signIn} id="login" className="authForm">
              <div className="forgotPasswordText">
                <h1>Reset Password </h1>
              </div>

              <PasswordInput
                name="password"
                className={`${
                  errors.password ? 'border-error' : null
                }`}
                placeholder="Password"
                value={requestData.password}
                error={errors.password}
                onChangeText={(v) => handleChange('password', v)}
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
                onChangeText={(v) => handleChange('passwordConfirm', v)}
                autoComplete="off"
                showIcon={(!!requestData.passwordConfirm)}
              />
              <Button
                color="blue"
                className="submit"
                type="submit"
              >
                Reset
              </Button>
            </form>
          </div>
        </div>
      </WrapperSign>
    </div>
  );
};

export default ResetPassword;
