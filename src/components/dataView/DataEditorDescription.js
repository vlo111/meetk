import React, { useState } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import stripHtml from 'string-strip-html';
import Button from '../form/Button';
import Editor from '../form/Editor';
import ModalConfirmation from '../../helpers/ModalConfirmation';

const DataEditorDescription = ({
  onChangeText, buttons, value, onClose,
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { result: description } = stripHtml(value || '');

  const opendescModal = async () => {
    setShowSaveModal(true);
  };

  const closeModal = async () => {
    onClose(value);
    setShowSaveModal(false);
    opendescModal(!showSaveModal);
  };

  return (
    <div>
      <Modal
        isOpen
        overlayClassName="ghModalOverlay"
        className="ghModal descriptionModal"
      >
        <h3>Description</h3>
        <Editor buttons={buttons} onChange={onChangeText} value={value} />
        <div className="description_buttons">
          <Button onMouseDown={opendescModal} className="btn-delete">Cancel</Button>
          <Button onMouseDown={closeModal} className="btn-classic">Add</Button>
        </div>
      </Modal>
      <span className="value-viewer">
        {description}
      </span>
      {showSaveModal && (
      <ModalConfirmation
        title="Are you sure ?"
        yes="Add"
        no="Cancel"
        onCancel={() => setShowSaveModal(false)}
        onAccept={() => {
          closeModal(() => opendescModal(true));
        }}
      />
      )}
    </div>
  );
};

DataEditorDescription.propTypes = {
  onClose: PropTypes.func.isRequired,
  onChangeText: PropTypes.func.isRequired,
  buttons: PropTypes.array,
  value: PropTypes.string,

};

DataEditorDescription.defaultProps = {
  value: '',
  buttons: [
    'bold',
    'italic',
    'underline',
    'fontsize',
    'font',
    'align',
    'brush',
    'undo',
    'redo',
  ],
};
export default DataEditorDescription;
