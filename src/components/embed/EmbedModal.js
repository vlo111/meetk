import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import Button from '../form/Button';

class EmbedModal extends Component {
  static propTypes = {
    graph: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    outOver: PropTypes.func.isRequired,
  }

  handleFocus = (ev) => {
    ev.target.select();
  }

  copy = () => {
    this.input.select();
    this.input.setSelectionRange(0, 99999);
    const status = document.execCommand('copy');
    if (status) {
      toast.info('Copy to clipboard');
    }
  }

  render() {
    const { graph, outOver } = this.props;

    return (
      <Modal
        className="ghModal embedModal"
        overlayClassName="ghModalOverlay"
        isOpen
        onRequestClose={() => {
          outOver();
          this.props.onClose(false);
        }}
      >
        <div className="graphEmbed">
          <h2>Copy embed code</h2>
          <div className="row">
            <input
              ref={(ref) => this.input = ref}
              readOnly
              type="text"
              onFocus={this.handleFocus}
              value={`<iframe width="1280" height="720" frameBorder="0" src="${window.location.origin}/graphs/embed/${graph.id}/${graph.token}"></iframe>`}
            />
            <Button onClick={this.copy} className="copyEmbed">Copy</Button>
          </div>

        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EmbedModal);

export default Container;
