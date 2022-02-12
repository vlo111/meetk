import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import { getNodeCommentParent, getNodeComments } from '../../../store/selectors/commentNodes';
import { getId } from '../../../store/selectors/account';
import { getNodeCommentsRequest, getActionsCountRequest } from '../../../store/actions/commentNodes';

import Owner from './Owner';
import AddComment from './AddComment';

const CommentItem = ({ comment, isReply }) => {
  const userId = useSelector(getId);

  return (
    <div className={`comment-content-wrapper-item ${isReply ? '--reply' : ''}`} key={`comment-${comment.id}`}>
      <div className="owner">
        <Owner
          user={comment.user}
          date={moment.utc(comment.createdAt).format('DD.MM.YYYY')}
          comment={comment}
          edit={!isReply}
          remove={userId === comment.user.id}
        />
        <div className="comment-text" dangerouslySetInnerHTML={{ __html: comment.text }} />
      </div>
    </div>
  );
};

const CommentItems = ({
  graph, node, closeModal, graphComments, tabsExpand,
}) => {
  const parent = useSelector(getNodeCommentParent);

  /* @todo get document elements size
  * 56 graph header height
  * 58 - tab header node info
  * 40 - switch tabs header
  * 20 - self padding
  *  */

  const addCommentHeight = document.querySelector('.commentWrite')?.offsetHeight;

  let height = window.innerHeight - addCommentHeight - 56 - 58 - 40 - 20;

  if (tabsExpand) height -= 40;

  const heightStyle = {
    height,
  };

  return heightStyle ? (
    <div className="comment-content-wrapper" style={heightStyle}>
      {graphComments.map((comment) => (
        <>
          <CommentItem comment={comment} />
          {comment.children?.map((reply) => (
            <CommentItem comment={reply} isReply />
          ))}
          {parent && parent.id === comment.id && (
            <AddComment
              graph={graph}
              node={node}
              closeModal={closeModal}
              isReply
            />
          )}
        </>
      ))}
    </div>
  ) : <></>;
};

CommentItems.propTypes = {
  graph: PropTypes.object.isRequired,
  tabsExpand: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
};

CommentItem.propTypes = {
  comment: PropTypes.object.isRequired,
  isReply: PropTypes.bool,
};

CommentItem.defaultProps = {
  isReply: false,
};

export default CommentItems;
