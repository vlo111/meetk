import React, { useEffect } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { useDispatch } from 'react-redux';
import queryString from 'query-string';

import CommentItems from './partials/CommentItems';
import AddComment from './partials/AddComment';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';
import Chart from '../../Chart';

import { getActionsCountRequest } from '../../store/actions/commentNodes';

const CommentModal = React.memo(({ closeModal, graph }) => {
  const { info: nodeId } = queryString.parse(window.location.search);
  if (!nodeId) {
    return null;
  }
  const node = Chart.getNodes().find((n) => n.id === nodeId);
  if (!node) {
    return null;
  }
  const afterOpenModal = () => {};
  const dispatch = useDispatch();

  const onClose = () => {
    closeModal();
    dispatch(getActionsCountRequest(graph.id, node.id));
  };

  return (isEmpty(graph) ? null
    : (
      <Modal
        isOpen
        onAfterOpen={afterOpenModal}
        contentLabel="Comment"
        id="comment-modal"
        className="ghModal commentModal tabComment"
        overlayClassName="ghModalOverlay"
      >
        <div className="comment-modal__title">
          <h3 className="node-name">Comments</h3>
        </div>
        <Button color="transparent" className="close" icon={<CloseSvg />} onClick={() => closeModal()} />
        <CommentItems graph={graph} node={node} closeModal={closeModal} />
        <AddComment
          graph={graph}
          node={node}
          closeModal={closeModal}
        />
      </Modal>
    )
  );
});

CommentModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  graph: PropTypes.object.isRequired,
};

export default CommentModal;
