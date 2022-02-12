import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Owner from './Owner';
import Button from '../../form/Button';
import Editor from '../../form/Editor/CustomEditor';

import { getAccount } from '../../../store/selectors/account';
import { getNodeCommentParent } from '../../../store/selectors/commentNodes';
import { createNodeCommentRequest, setNodeCommentParent } from '../../../store/actions/commentNodes';

const AddComment = ({
  graph, node, closeModal, isReply,
}) => {
  const dispatch = useDispatch();
  const myAccount = useSelector(getAccount);
  const parent = useSelector(getNodeCommentParent);
  const [text, setText] = useState('');
  const handleChange = (path, value) => {
    setText(value);
  };

  return (
    <div className={isReply ? 'comment-modal__add-comment-section--reply comment--reply' : 'commentWrite'}>
      <Editor
        id={isReply ? 'reply-comment' : 'add-comment'}
        class="comment-modal__add-comment-input"
        // error={errors.content}
        limit={250}
        value={text}
        onChange={(v) => handleChange('text', v)}
      />
      <div className="comment-modal__add-comment-buttons">
        {isReply && (
        <Button
          className=" ghButton2 btn-delete"
          onClick={() => {
            if (parent.id) {
              dispatch(setNodeCommentParent({}));
            } else {
              closeModal();
            }
          }}
        >
          Cancel
        </Button>
        )}
        <Button
          onClick={() => {
            if (text.trim() === '') {
              alert('Text cannot be blank.');
            } else {
              if (!isReply) {
                const comment = document.querySelector('.comment-content-wrapper');

                if (comment) {
                  setTimeout(() => {
                    comment.scrollTo(0, document.querySelector('.comment-content-wrapper')
                      .scrollHeight);
                  }, 100);
                }
              }

              dispatch(createNodeCommentRequest(
                {
                  graphId: graph.id,
                  nodeId: node.id,
                  text,
                  parentId: parent.id,
                },
              ));
            }
            setText('');
            dispatch(setNodeCommentParent({}));
          }}
          className=" ghButton2 btn-classic"
        >
          Add
        </Button>
      </div>
    </div>
  );
};

AddComment.propTypes = {
  graph: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
  isReply: PropTypes.bool,
};

AddComment.defaultProps = {
  isReply: false,
};

export default AddComment;
