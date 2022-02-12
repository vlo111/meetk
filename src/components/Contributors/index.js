import React, { useState, Suspense, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Tooltip from 'rc-tooltip/es';
import { graphUsersRequest } from '../../store/actions/shareGraphs';
import { getGraphUsers } from '../../store/selectors/shareGraphs';
import { getOnlineUsersRequest } from '../../store/actions/app';
import { getOnlineUsers } from '../../store/selectors/app';
import ShareTooltipContent from './ShareTooltipContent';
import ShareTooltip from './ShareTooltip';
import Button from '../form/Button';
import { ONLINE } from '../../data/graph';

const TooltipContent = ({
  user, role, type, isOwner, objectId,
}) => (
  <Suspense fallback={<div>Loading...</div>}>
    <ShareTooltipContent
      user={user}
      role={role}
      type={type}
      isOwner={isOwner}
      objectId={objectId}
    />
  </Suspense>
);

TooltipContent.propTypes = {
  user: PropTypes.object.isRequired,
};

const ContributorsModal = React.memo(({ graphId, graphOwner }) => {
  const dispatch = useDispatch();
  // const userId = useSelector(getId);
  const onlineUser = useSelector(getOnlineUsers);
  const graphUsers = useSelector(getGraphUsers)[graphId];
  const [limit, setLimit] = useState(2);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  useEffect(() => {
    if (graphId) {
      dispatch(graphUsersRequest({ graphId }));
    }
    dispatch(getOnlineUsersRequest());
  }, []);

  if (graphOwner === undefined) {
    return false;
  }
  // const isLabelShare = graphUsers && graphUsers.some((n) => n.type === 'label' && n.userId === userId);
  // const graphUsersList = isLabelShare ? graphUsers.filter((n) => n.type === 'label' && n.userId === userId) : graphUsers;
  const graphUsersList = graphUsers && graphUsers.map((item) => {
    if (onlineUser && onlineUser.some((n) => (n.userId === item.userId && n.activeGraphId === graphId))) {
      return { ...item, online: ONLINE.online_in_graph };
    }
    if (onlineUser && onlineUser.some((n) => (n.userId === item.userId))) {
      return { ...item, online: ONLINE.online };
    }
    return { ...item, online: ONLINE.not_online };
  }).sort((a, b) => b.online - a.online);

  const shareTooltip = (showShareTooltip) => {
    setShowShareTooltip(!showShareTooltip);
  };
  return (
    <div className="contributors-container-list">
      <ul className="list-style-none d-flex flex-wrap mb-n2">
        <li className="item">
          <Link to={`/profile/${graphOwner.id}`} target="_blank">
            <Tooltip overlay={<TooltipContent user={graphOwner} role="Owner" type="graph" objectId={null} />} trigger={['hover']} placement={['bottom']}>
              <div className="icon-container">
                <img className="avatar-user d-block" src={graphOwner.avatar} alt="" />
                { onlineUser && onlineUser.some((n) => n.userId === graphOwner.id) ? (
                  <div className="status-online ">
                    { onlineUser && onlineUser.some((n) => (n.userId === graphOwner.id && n.activeGraphId === graphId)) ? (
                      <div className="status-in-graph " />
                    ) : ''}
                  </div>
                ) : ''}
              </div>
            </Tooltip>
          </Link>
        </li>
        {graphUsersList && graphUsersList.filter((item, index) => index < limit)
          .map((item) => (
            <li className="item">
              <Link to={`/profile/${item.user.id}`} target="_blank">
                <Tooltip
                  overlay={(
                    <TooltipContent
                      user={item.user}
                      role={item.role}
                      type={item.type}
                      objectId={item.objectId}
                    />
)}
                  trigger={['hover']}
                  placement={['bottom']}
                >
                  <div className="icon-container">
                    <img className="avatar-user d-block" src={item.user.avatar} alt={item.user.id} />
                    { onlineUser && onlineUser.some((n) => n.userId === item.user.id) ? (
                      <div className="status-online ">
                        { onlineUser && onlineUser.some((n) => n.userId === item.user.id && n.activeGraphId === graphId) ? (
                          <div className="status-in-graph " />
                        ) : ''}
                      </div>
                    ) : ''}
                  </div>
                </Tooltip>
              </Link>
            </li>
          ))}

      </ul>
      <Button className="transparent" icon={value="fa-chevron-down"} onClick={() => shareTooltip(showShareTooltip)} />
      {showShareTooltip ? (
        <ShareTooltip graphId={graphId} graphOwner={graphOwner} isOwner="true" closeModal={() => setShowShareTooltip(false)} />
      )
        : ''}
    </div>
  );
});

ContributorsModal.propTypes = {
  graphId: PropTypes.string.isRequired,
  graphOwner: PropTypes.object.isRequired,

};

export default ContributorsModal;
