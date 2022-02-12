import React from 'react';
import PropTypes from 'prop-types';

const Owner = ({ user }) => (
  <div className="share-modal__owner">
    {user && (
      <>
        <img
          className="avatar circle share-modal__owner-logo"
          src={user && user.avatar}
          alt={`${user.firstName} ${user.lastName}`}
        />
        <span>{`${user.firstName} ${user.lastName}`}</span>
      </>
    )}
  </div>
);

Owner.propTypes = {
  user: PropTypes.object.isRequired,
};

export default Owner;
