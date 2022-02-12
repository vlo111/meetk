import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import Input from '../form/Input';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';

const SaveAsTampletModal = ({
  toggleModal, saveGraph, handleChange, requestData,
}) => {
  const isTemplate = requestData.status === 'template';
  if (isTemplate) { return <></>; }

  return (
    <Modal
      className="ghModal ghModalSave"
      overlayClassName="ghModalOverlay"
      isOpen
      onRequestClose={() => toggleModal(false)}
    >
      <Button color="transparent" className="close" icon={<CloseSvg />} onClick={() => toggleModal(false)} />
      <div className="form">
        <h2>
          Save this template
        </h2>
        <Input
          label="Title"
          value={requestData.title}
          onChangeText={(v) => handleChange('title', v)}
        />
        <Input
          label="Description"
          value={requestData.description}
          textArea
          onChangeText={(v) => handleChange('description', v)}
        />
        <div className="buttons">
          <div className="saveTempleteButton">
            <Button className="btn-classic" onClick={() => saveGraph('template', true)}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
SaveAsTampletModal.propTypes = {
  toggleModal: PropTypes.func.isRequired,
  saveGraph: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  requestData: PropTypes.object.isRequired,
};

export default SaveAsTampletModal;
