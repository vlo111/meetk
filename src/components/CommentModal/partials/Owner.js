import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import Button from '../../form/Button';
import { setGraphCommentParent, deleteGraphComment } from '../../../store/actions/commentGraphs';
import { ReactComponent as ReplySvg } from '../../../assets/images/icons/reply.svg';
import { ReactComponent as RemoveSvg } from '../../../assets/images/icons/delete.svg';

const Owner = ({
  user, date, edit, remove, comment,
}) => {
  const dispatch = useDispatch();

  return (
    <div className="comment-modal__owner">
      {user && (
        <>
          <img
            className="avatar circle comment-modal__owner-logo"
            src={user && user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
          />
          <span>
            {`${user.firstName} ${user.lastName}`}
            <br />
            <span className="comment-modal__comment-date">{date}</span>
          </span>
          {edit && (
            <Button
              icon={<ReplySvg style={{ height: 17 }} />}
              onClick={() => {
                dispatch(setGraphCommentParent(comment));
                setTimeout(() => {
                  const replyInput = document.getElementById('reply-comment');
                  // if (replyInput) replyInput.focus();
                  // else document.getElementById('add-comment').focus();
                });
              }}
              className="transparent reply"
              title="reply"
            />
          )}
          {remove && (
            <Button
              icon={<RemoveSvg style={{ height: 17 }} />}
              onClick={() => {
                dispatch(deleteGraphComment(comment.id));
              }}
              className="transparent remove"
              title="Remove"
            />
          )}
        </>
      )}
    </div>
  );
};

Owner.propTypes = {
  user: PropTypes.object.isRequired,
  date: PropTypes.string,
  edit: PropTypes.bool,
  remove: PropTypes.bool,
  comment: PropTypes.object,
};

Owner.defaultProps = {
  date: '',
  edit: false,
  remove: false,
  comment: {},
};

export default Owner;
