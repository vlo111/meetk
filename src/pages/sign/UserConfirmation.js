import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Api from '../../Api';

function UserConfirmation(props) {
  const { match: { params: { token } } } = props;

  const [status, setStatus] = useState('');

  useEffect(async () => {
    const { data: { status: aipStatus } } = await Api.confirmEmail(token);

    if (aipStatus === 'ok') {
      setStatus(status);
      // props.history.replace('/');
    }
    // else {
    //   props.history.replace('/');
    // }
  });
  return (
    status === 'ok' ? (
      <div>
        <h2>You are successfully confirmed</h2>
      </div>
    ) : <></>
  );
}

UserConfirmation.propTypes = {
  match: PropTypes.any.isRequired,
  // history: PropTypes.string.isRequired,
};

export default UserConfirmation;
