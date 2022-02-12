import React, { useEffect } from 'react';
import Modal from 'react-modal';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import Button from '../form/Button';
import AddQuery from './partials/AddQuery';
import Queries from './Queries';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';

const Query = React.memo(({ closeModal, graph }) => {
  const afterOpenModal = () => { };
  return (isEmpty(graph) ? null
    : (
      <Modal
        isOpen
        onAfterOpen={afterOpenModal}
        contentLabel="Query"
        id="query-modal"
        className="ghModal queryModal"
        overlayClassName="ghModalOverlay  graphQueryOverlay"
      >
        <div className="query-modal__title">
          <h3>Fragment</h3>
          <Button
            icon={<CloseSvg style={{ height: 30 }} />}
            onClick={() => closeModal()}
            className="transparent"
          />
        </div>
        <div className="query-modal__form">
          <Queries closeModal={closeModal} graph={graph} />
          <AddQuery closeModal={closeModal} graph={graph} />
        </div>
      </Modal>
    )
  );
});

Query.propTypes = {
  closeModal: PropTypes.func.isRequired,
  graph: PropTypes.object.isRequired,
};

export default Query;
