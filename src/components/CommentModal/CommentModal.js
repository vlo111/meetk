import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { useDispatch } from 'react-redux';
import CommentItems from './partials/CommentItems';
import AddComment from './partials/AddComment';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';

import { getActionsCountRequest } from '../../store/actions/graphs';

const CommentModal = React.memo(({ closeModal, graph }) => {
  const afterOpenModal = () => {};
  const dispatch = useDispatch();
  const onClose = () => {
    closeModal();
    dispatch(getActionsCountRequest(graph.id));
  };
  return (isEmpty(graph) ? null
    : (
      <Modal
        isOpen
        onAfterOpen={afterOpenModal}
        onRequestClose={onClose}
        contentLabel="Comment"
        id="comment-modal"
        className="ghModal commentModal"
        overlayClassName="ghModalOverlay"
      >
        <AddComment
          graph={graph}
          closeModal={closeModal}
        />
        <div className="comment-modal__title">
          <Button
            color="transparent"
            className="close"
            icon={<CloseSvg />}
            onClick={onClose}
          />
        </div>
        <CommentItems graph={graph} closeModal={closeModal} />
      </Modal>
    )
  );
});

CommentModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  graph: PropTypes.object.isRequired,
};

export default CommentModal;
