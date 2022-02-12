import React from 'react';
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

import { getActionsCountRequest } from '../../store/actions/graphs';

const CommentModal = React.memo(({ closeModal, graph }) => {
  const { info: nodeName } = queryString.parse(window.location.search);
  const node = Chart.getNodes().find((d) => d.name === nodeName);
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
        <div className="comment-modal__title">
          <h3>{graph.title}</h3>
          <Button
            icon={<CloseSvg style={{ height: 30 }} />}
            onClick={onClose}
            className="transparent"
          />
        </div>
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
