import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Modal from 'react-modal';
import { setActiveButton } from '../../store/actions/app';
import Button from '../form/Button';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';

class AnalyseModal extends Component {
    closeModal = () => {
      this.props.setActiveButton('create');
    }

    render() {
      const {
        activeButton,
      } = this.props;

      return ((activeButton === 'analyse') ? (
        <Modal
          isOpen
          className="ghModal ghModalAnalyse"
          overlayClassName="ghModalOverlay"
          onRequestClose={this.closeModal}
        >
          <h3>Insufficient data to analyze</h3>
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeModal} />
          <div className="buttons">
            <Button className="cancel transparent alt" onClick={this.closeModal}>
              Cancel
            </Button>
          </div>
        </Modal>
      )
        : <> </>);
    }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
});

const mapDispatchToProps = {
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AnalyseModal);

export default withRouter(Container);
