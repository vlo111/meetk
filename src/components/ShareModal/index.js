import React, { useState } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { useDispatch } from 'react-redux';

import Owner from './partials/Owner';
import { updateShareGraphStatusRequest, graphUsersRequest } from '../../store/actions/shareGraphs';
import Collaborators from './partials/Collaborators';
import Search from './partials/Search';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';

const ShareModal = React.memo(({ graph, closeModal }) => {
  const dispatch = useDispatch();
  const [select, setSelect] = useState([]);
  const [sharedUsers, setShardUsers] = useState([]);
  const afterOpenModal = () => { };

  const changeStatus = () => {
    dispatch(updateShareGraphStatusRequest({ graphId: graph.id }));
    // reload list user
    dispatch(graphUsersRequest({ graphId: graph.id }));
    closeModal();
  };
  return (isEmpty(graph) ? null
    : (
      <Modal
        className="ghModalShareGraph"
        isOpen
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        contentLabel="Share"
        style={{
          overlay: {
            zIndex: 10,
          },
        }}
      >
        <div className="share-modal__title">
          <h3>Collaborators</h3>
          <Button
            icon={<CloseSvg style={{ height: 30 }} />}
            onClick={() => changeStatus()}
            className="transparent"
          />
        </div>
        <Owner user={graph.user} />
        <Search select={select} setSelect={setSelect} user={graph.user} singleGraph={graph} closeModal={closeModal} />
        {select && <Collaborators graph={graph} select={select} />}
      </Modal>
    )
  );
});

ShareModal.propTypes = {
  graph: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default ShareModal;
