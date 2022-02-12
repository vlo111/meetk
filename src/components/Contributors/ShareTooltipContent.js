import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ChartUtils from '../../helpers/ChartUtils';

const ShareTooltipContent = React.memo(({
  user, role, type, objectId,
}) => {
  const [name, setName] = useState('');

  const findLabelInDom = (id) => {
    ChartUtils.findLabelInDom(id);
  };
  useEffect(() => {
    if (objectId) {
      const label = ChartUtils.getLabelById(objectId);
      setName(label?.name);
    }
  }, [objectId]);
  return (
    <div className="contributors-container">
      <article key={user.id} className="tooltiptext">
        <Link to={`/profile/${user.id}`} target="_blank">
          <img
            className="avatar"
            src={user.avatar}
            alt={user.firstName}
          />
        </Link>
        <div className="info">
          <div className="username"><Link to={`/profile/${user.id}`} target="_blank">{`${user.firstName} ${user.lastName}`}</Link></div>
          <div className="role">
            Shared  -
            {objectId ? (<a className="tooltipLabel" onClick={() => findLabelInDom(objectId)}>{name}</a>) : (type)}
          </div>
          <div className="role">
            Role  -
            {role}
          </div>
        </div>

      </article>

    </div>
  );
});

export default ShareTooltipContent;
