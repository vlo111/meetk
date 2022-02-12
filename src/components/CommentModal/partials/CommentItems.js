import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import { getGraphCommentParent, getGraphComments } from '../../../store/selectors/commentGraphs';
import { getId } from '../../../store/selectors/account';
import { getGraphCommentsRequest } from '../../../store/actions/commentGraphs';
import { getActionsCountRequest } from '../../../store/actions/graphs';
import Owner from './Owner';
import AddComment from './AddComment';

const CommentItem = ({ comment, isReply }) => {
  const userId = useSelector(getId);

  return (
    <div className={`comment-modal__comment-item${isReply ? '--reply' : ''}`} key={`comment-${comment.id}`}>
      <Owner
        user={comment.user}
        date={moment.utc(comment.createdAt).format('DD.MM.YYYY')}
        comment={comment}
        edit={!isReply}
        remove={userId === comment.user.id}
      />
      <div dangerouslySetInnerHTML={{ __html: comment.text }} />
    </div>
  );
};

const CommentItems = ({ graph, closeModal }) => {
  const dispatch = useDispatch();
  const graphComments = useSelector(getGraphComments);
  const parent = useSelector(getGraphCommentParent);

  useEffect(() => {
    dispatch(getGraphCommentsRequest({ graphId: graph.id }));
  }, []);

  useEffect(() => {
    dispatch(getActionsCountRequest(graph.id));
  }, graphComments);

  return (
    <div className="comment-modal__comments-wrapper">
      {graphComments.map((comment) => (
        <>
          <CommentItem comment={comment} />
          {comment.children?.map((reply) => (
            <CommentItem comment={reply} isReply />
          ))}
          {parent && parent.id === comment.id && (
            <AddComment
              graph={graph}
              closeModal={closeModal}
              isReply
            />
          )}
        </>
      ))}
    </div>
  );
};

CommentItems.propTypes = {
  graph: PropTypes.object.isRequired,
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
