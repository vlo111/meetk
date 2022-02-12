import React, { useEffect, Suspense, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Tooltip from 'rc-tooltip/es';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { getGraphUsers } from '../../store/selectors/shareGraphs';
import { graphUsersRequest, updateGraphRequest, updateShareGraphStatusRequest } from '../../store/actions/shareGraphs';
import { getOnlineUsersRequest } from '../../store/actions/app';
import { socketSetActiveGraph } from '../../store/actions/socket';
import { getOnlineUsers } from '../../store/selectors/app';
import { getId } from '../../store/selectors/account';
import ShareTooltipContent from './ShareTooltipContent';
import { ONLINE } from '../../data/graph';

const TooltipContent = ({
  user, role, type, isOwner, objectId,
}) => (
  <Suspense fallback={<div>Loading...</div>}>
    <ShareTooltipContent user={user} role={role} type={type} isOwner={isOwner} objectId={objectId} />
  </Suspense>
);
TooltipContent.propTypes = {
  user: PropTypes.object.isRequired,
  isOwner: PropTypes.any.isRequired,
};
const ShareTooltip = React.memo(({
  graphId, graphOwner, isOwner, closeModal,
}) => {
  const userId = useSelector(getId);
  const graphUsers = useSelector(getGraphUsers)[graphId];
  const onlineUser = useSelector(getOnlineUsers);
  const dispatch = useDispatch();
  const [owner, setOwner] = useState(false);
  const [dragRole, setDragRole] = useState();
  const [dropId, setDropId] = useState();
  const [showMoreEdit, setShowMoreEdit] = useState(false);
  const [showMoreView, setShowMoreView] = useState(false);
  const [limit, setLimit] = useState(4);

  useEffect(() => {
    dispatch(socketSetActiveGraph(graphId || null));
  }, [dispatch, graphId]);
  useEffect(() => {
    if (graphId) {
      dispatch(graphUsersRequest({ graphId }));
    }
    dispatch(getOnlineUsersRequest());
  }, [dispatch, graphId]);

  if (graphOwner === undefined) {
    return false;
  }

  const count = graphUsers && Object.keys(graphUsers) && Object.keys(graphUsers).length;
  const countOwner = isOwner ? 1 : 0;
  const isLabelShare = graphUsers && graphUsers.some((n) => n.type === 'label' && n.userId === userId);
  // const graphUsersList = isLabelShare ? graphUsers.filter((n) => n.type === 'label' && n.userId === userId) : graphUsers;
  const graphUsersList = graphUsers && graphUsers.map((item, index) => {
    if (onlineUser && onlineUser.some((n) => (n.userId === item.userId && n.activeGraphId === graphId))) {
      return { ...item, online: ONLINE.online_in_graph };
    }
    if (onlineUser && onlineUser.some((n) => (n.userId === item.userId))) {
      return { ...item, online: ONLINE.online };
    }
    return { ...item, online: ONLINE.not_online };
  }).sort((a, b) => b.online - a.online);

  /**
     *
     * @param {*} e
     * @param {*} id
     * @param {*} role
     */
  const handleDragStart = (e, id, role) => {
    if (graphOwner.id === userId) {
      setOwner(true);
    }
    setDropId(id);
    setDragRole(role);
  };
  /**
     *
     * @param {*} e
     */
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  /**
     *
     * @param {*} e
     * @param {*} role
     */
  const handleDrop = (e, role) => {
    const newRole = e.currentTarget.id;
    if (owner && role === dragRole) {
      dispatch(updateGraphRequest(dropId, { role: newRole }));
      toast.success(`You have changed permission from ${dragRole} to ${newRole} `);
      dispatch(updateShareGraphStatusRequest({ graphId }));
    }
  };
  /**
     * show more data
     */
  const handlerShowMoreEdit = () => {
    setShowMoreEdit(!showMoreEdit);
  };
  /**
     * show more data
     */
  const handlerShowMoreView = () => {
    setShowMoreView(!showMoreView);
  };
  /**
     *
     * @param {*} role
     * return custom role
     */
  const roleTypeForShareTools = (role) => (['edit', 'edit_inside', 'admin'].includes(role)
    ? 'edit' : 'view');
  /**
   * Add new array role data
   */
  const roles = {
    edit: [],
    view: [],
  };
  graphUsersList && graphUsersList.forEach((item, index) => {
    const shareRole = roleTypeForShareTools(item.role);

    roles[shareRole].push(
      <Link
        to={`/profile/${item.user.id}`}
        target="_blank"
        key={index.toString()}
        draggable
        onDragStart={(e) => handleDragStart(e, item.id, shareRole)}
      >
        <li className="mb-2 mr-2 " key={index.toString()}>
          <Tooltip overlay={<TooltipContent user={item.user} role={item.role} type={item.type} objectId={item.objectId} />} trigger={['click']} placement={['bottom']}>
            <div className="icon-container">
              <img className="avatar-user d-block" src={item.user.avatar} alt={item.user.id} />
              {onlineUser && onlineUser.some((n) => n.userId === item.user.id) ? (
                <div className="status-online ">
                  {onlineUser && onlineUser.some((n) => n.userId === item.user.id && n.activeGraphId === graphId) ? (
                    <div className="status-in-graph " />
                  ) : ''}
                </div>
              ) : ''}
            </div>
          </Tooltip>
        </li>
      </Link>,
    );
  });

  const numberOfEditItems = showMoreEdit ? roles.edit.length : limit;
  const numberOfViewItems = showMoreView ? roles.view.length : limit;
  const subEditLimitCount = roles.edit.length - numberOfEditItems;
  const subViewLimitCount = roles.view.length - numberOfViewItems;

  return (

    <>
      <div className="modal-arrow-top" />
      <div className="contributors-container">
        <ul className={`list-style-none d-flex flex-wrap mb-n2 groups ${showMoreEdit ? ' scrollY' : ' '}`}>
          <span className="group-header">
            Can Edit
            {`(${roles?.edit?.length}) `}
          </span>
          <div
            id="edit"
            className="group scrollY lineBorder"
            onDragOver={(e) => handleDragOver(e)}
            onDrop={(e) => { handleDrop(e, 'view'); }}
          >
            {roles.edit.slice(0, numberOfEditItems)}
            {!isLabelShare && subEditLimitCount >= 0 ? (
              <a className="more" onClick={handlerShowMoreEdit}>
                {' '}
                {showMoreEdit ? '- Less' : (subEditLimitCount > 0 ? `+ ${subEditLimitCount}` : '')}
              </a>
            ) : null}
          </div>
          <span className="group-header">
            Can View
            {`(${roles?.view?.length}) `}
          </span>
          <div
            id="view"
            className="group scrollY "
            onDragOver={(e) => handleDragOver(e)}
            onDrop={(e) => { handleDrop(e, 'edit'); }}
          >
            {roles.view.slice(0, numberOfViewItems)}
            {!isLabelShare && subViewLimitCount >= 0 ? (
              <a className="more" onClick={handlerShowMoreView}>
                {showMoreView ? '- Less' : (subViewLimitCount > 0 ? `+ ${subViewLimitCount}` : '')}
              </a>
            ) : null}
          </div>
        </ul>
      </div>
    </>
  );
});
ShareTooltip.propTypes = {
  graphId: PropTypes.string.isRequired,
  graphOwner: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
  isOwner: PropTypes.any.isRequired,
};

export default ShareTooltip;
