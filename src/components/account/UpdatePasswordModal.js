import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from '../form/Button';
import PasswordInput from '../form/PasswordInput';
import Validate from '../../helpers/Validate';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { updateMyAccountPasswordRequest } from '../../store/actions/account';

const UpdatePasswordModal = ({ className, onClose }) => {
  const dispatch = useDispatch();
  const [requestData, setRequestData] = useState({
    oldPassword: '',
    password: '',
    passwordConfirm: '',
  });
  const [errors, setErrors] = useState({
    oldPassword: '',
    password: '',
    passwordConfirm: '',
  });

  const handleChange = async (path, value) => {
    setRequestData((prevState) => ({
      ...prevState,
      [path]: value,
    }));
  };

  const handlePasswordChange = async (ev) => {
    ev.preventDefault();
    [errors.password, errors.passwordConfirm, errors.oldPassword] = Validate.passwordValidation(requestData);
    if ((errors.password.trim().length > 0
     || errors.passwordConfirm.trim().length > 0
     || errors.oldPassword.trim().length > 0)
    ) {
      setErrors((prevState) => ({
        ...prevState,
      }));
    } else {
      try {
        const { payload } = await dispatch(updateMyAccountPasswordRequest(requestData));
        const { data = {} } = payload;
        if (data.status === 'ok') {
          toast.info('Password successfully updated');
          onClose();
        } else {
          const { oldPassword } = data.errors;
          errors.oldPassword = oldPassword;
          setErrors((prevState) => ({
            ...prevState,
          }));
        }
      } catch (e) {
      //
      }
    }
  };

  return (
    <div>
      <Modal
        className="ghModal changePasswordModal"
        overlayClassName={classNames('ghModalOverlay changePasswordModalOverlay', className)}
        isOpen
        onRequestClose={onClose}
      >
        <form onSubmit={handlePasswordChange}>
          <h3>Change Password</h3>
          <PasswordInput
            name="oldPassword"
            label="Old Password"
            type="password"
            value={requestData.oldPassword}
            error={errors.oldPassword}
            onChangeText={(v) => handleChange('oldPassword', v)}
            showIcon={(!!requestData.oldPassword)}
          />
          <PasswordInput
            name="password"
            label="New Password"
            type="password"
            containerClassName="newPassword"
            value={requestData.password}
            error={errors.password}
            onChangeText={(v) => handleChange('password', v)}
            showIcon={(!!requestData.password)}
          />
          <PasswordInput
            name="passwordConfirm"
            label="Confirm Password"
            type="password"
            value={requestData.passwordConfirm}
            error={errors.passwordConfirm}
            onChangeText={(v) => handleChange('passwordConfirm', v)}
            showIcon={(!!requestData.passwordConfirm)}
          />
          <div className="buttonsWrapper">
            <Button
              color="transparent"
              className="cancel"
              onClick={onClose}
              icon={<CloseSvg />}
            />
            <Button color="accent" type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
UpdatePasswordModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
};

export default UpdatePasswordModal;
