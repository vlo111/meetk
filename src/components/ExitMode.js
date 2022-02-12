import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from './form/Button';
import { ReactComponent as CloseSvg } from '../assets/images/icons/close.svg';

class ExitMode extends Component {
  static propTypes = {
    activeButton: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      close: false,
    };
  }

  close = () => {
    this.setState({
      close: true,
    });
  }

  initial = () => {
    document.getElementById('graph')?.classList.add('create-node');
  }

  render() {
    const { activeButton } = this.props;

    const { close } = this.state;

    if (!(activeButton === 'create-node' || activeButton === 'create-folder'
        || activeButton === 'create-label' || activeButton === 'create-label-square'
        || activeButton === 'create-label-ellipse')) {
      return null;
    }

    this.initial();

    return (
      <>
        {!close && (
        <div className="exit_mode">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.close} />
          <div className="container">
            <span className="text">
              Press
            </span>
            <span className="escPress">Esc</span>
            <span className="text">
              to exit the mode
            </span>
          </div>
        </div>
        )}

      </>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
});

const mapDispatchToProps = {};

const Container = connect(mapStateToProps, mapDispatchToProps)(ExitMode);

export default withRouter(Container);
