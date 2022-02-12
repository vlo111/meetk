import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../../form/Button';
import { getGraphCommentParent } from '../../../store/selectors/commentGraphs';
import { createGraphCommentRequest, setGraphCommentParent } from '../../../store/actions/commentGraphs';
import Editor from '../../form/Editor/CustomEditor';

const AddComment = ({ graph, closeModal, isReply }) => {
  const dispatch = useDispatch();
  const parent = useSelector(getGraphCommentParent);
  const [text, setText] = useState('');
  // const editor = useRef(null)
  const handleChange = (path, value) => {
    setText(value);
  };
  return (
    <div className={isReply ? 'comment-modal__add-comment-section--reply comment--reply' : 'comment'}>
      <hr />

      <Editor
        id={isReply ? 'reply-comment' : 'add-comment'}
        class="comment-modal__add-comment-input"
        // error={errors.content}
        limit={250}
        value={text}
        onChange={(v) => handleChange('text', v)}
      />
      <div className="comment-modal__add-comment-buttons">
        <Button
          className="ghButton2 comment-modal__add-comment-cancel btn-delete "
          onClick={() => {
            if (parent.id) {
              dispatch(setGraphCommentParent({}));
            } else {
              closeModal();
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            text.trim() === ''
              ? alert('Text cannot be blank.')
              : dispatch(createGraphCommentRequest(
                {
                  graphId: graph.id,
                  text,
                  parentId: parent.id,
                },
              ));
            setText('');
            dispatch(setGraphCommentParent({}));
          }}
          className=" ghButton2 comment-modal__add-comment-button  btn-classic"
        >
          Comment
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
