import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import Button from '../components/form/Button';
import { ReactComponent as CloseSvg } from '../assets/images/icons/close.svg';

const ModalConfirmation = React.memo(({
  yes, no, onAccept, onCancel, title, description,
}) => (
  <Modal
    className="ghModal deleteModal"
    overlayClassName="ghModalOverlay"
    isOpen
    onRequestClose={onCancel}
  >
    <div className="containerModal">
      <Button color="transparent" className="close" icon={<CloseSvg />} onClick={onCancel} />
      <div className="form">
        <h2>{title}</h2>
        <p>
          {description}
        </p>
        <div className="buttons">
          <Button className="btn-delete" onClick={onCancel}>
            {no}
          </Button>
          <Button className="btn-classic" onClick={onAccept}>
            {yes}
          </Button>
        </div>
      </div>
    </div>
  </Modal>
));

ModalConfirmation.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired,
  description: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  yes: PropTypes.string.isRequired,
  no: PropTypes.string.isRequired,
};

export default ModalConfirmation;
