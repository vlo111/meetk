import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const LikeTooltipContent = React.memo(({ user }) => {
  const {
    id, avatar, firstName, lastName,
  } = user;

  return (
    <div className="contributors-container">
      <article key={id} className="tooltiptext">
        <Link to={`/profile/${id}`} target="_blank">
          <img
            className="avatar"
            src={avatar}
            alt={firstName}
          />
        </Link>
        <div className="info">
          <div className="username">
            <Link to={`/profile/${id}`} target="_blank">
              {`${firstName} ${lastName}`}
            </Link>
          </div>
        </div>

      </article>

    </div>
  );
});
LikeTooltipContent.propTypes = {
  user: PropTypes.object.isRequired,
};

export default LikeTooltipContent;
