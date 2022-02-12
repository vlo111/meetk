import React, { useEffect, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Tooltip from 'rc-tooltip/es';
import LikeTooltipContent from './LikeTooltipContent';

import { getLikeGraphsListRequest } from '../../store/actions/likeGraphs';
import { getLikeGraphsList } from '../../store/selectors/likeGraphs';

const TooltipContent = ({ user }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <LikeTooltipContent user={user} />
  </Suspense>
);
TooltipContent.propTypes = {
  user: PropTypes.object.isRequired,
};

const LikeGraphsTooltip = ({ graphId }) => {
  const dispatch = useDispatch();
  const likeGraphsList = useSelector(getLikeGraphsList);

  useEffect(() => {
    if (graphId) {
      dispatch(getLikeGraphsListRequest(graphId));
    }
  }, [dispatch, graphId]);

  return (
    <div className="contributors-container">
      <ul className="list-style-none d-flex flex-wrap mb-n2 groups ">
        <div
          id="edit"
          className="group scrollY lineBorder"
        >
          {likeGraphsList && likeGraphsList.map((item, index) => (
            <Link
              to={`/profile/${item.user.id}`}
            >
              <li className="mb-2 mr-2 " key={index.toString()}>
                <Tooltip overlay={<TooltipContent user={item.user} />} trigger={['hover']} placement={['bottom']}>
                  <div className="icon-container">
                    <img className="avatar-user d-block" src={item.user.avatar} alt={item.user.id} />
                  </div>
                </Tooltip>
              </li>
            </Link>
          ))}
        </div>
      </ul>
    </div>

  );
};
LikeGraphsTooltip.propTypes = {
  graphId: PropTypes.string.isRequired,
};
export default LikeGraphsTooltip;
