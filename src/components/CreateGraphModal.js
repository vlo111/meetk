import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import Input from './form/Input';
import Button from './form/Button';
import { createGraphRequest } from '../store/actions/graphs';
import { ReactComponent as CloseSvg } from '../assets/images/icons/close.svg';
import Chart from '../Chart';

class CreateGraphModal extends Component {
  static propTypes = {
    createGraphRequest: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    data: PropTypes.object,
  }

  static defaultProps = {
    data: {},
  }

  constructor(props) {
    super(props);
    this.state = {
      requestData: {
        title: '',
        description: '',
        ...props.data,
      },
    };
  }

  componentDidMount() {
    const { history: { location: { pathname } } } = this.props;
    if (pathname === '/graphs/create') {
      Chart.loading(false);
    }
  }

  handleChange = (path, value) => {
    const { requestData } = this.state;
    _.set(requestData, path, value);
    this.setState({ requestData });
  }

  addGraph = async () => {
    const { requestData } = this.state;
    const { payload: { data } } = await this.props.createGraphRequest({
      ...requestData,
      status: 'active',
    });
    if (data?.graphId) {
      if (window.location.pathname.startsWith('/graphs/create')) {
        this.props.history.replace(`/graphs/update/${data.graphId}`);
      } else {
        this.props.history.push(`/graphs/update/${data.graphId}`);
      }
      return;
    }
    toast.error('Something went wrong');
  }

  closeModal = async () => {
    if (this.props.onChange) {
      this.props.onChange();
    } else {
      this.props.history.goBack();
    }
  }

  render() {
    const { singleGraph, match: { params: { graphId = '' } }, show } = this.props;
    const { requestData } = this.state;
    if (graphId || !_.isEmpty(singleGraph)) {
      if (!show) {
        return null;
      }
    }
    return (
      <Modal
        className="ghModal ghModalSave createGraph"
        overlayClassName="ghModalOverlay"
        isOpen
      >
        <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeModal} />
        <div className="form">

          <Input
            value={requestData.title}
            onChangeText={(v) => this.handleChange('title', v)}
            autoComplete="off"
            placeholder="Type Graph Name"
            autoFocus
          />
          <Input
            placeholder="Description"
            value={requestData.description}
            textArea
            onChangeText={(v) => this.handleChange('description', v)}
          />
          <div className="buttons">
            <Button className="btn-delete" onClick={this.closeModal}>
              Cancel
            </Button>
            <Button
              className="btn-classic"
              disabled={!requestData.title}
              onClick={this.addGraph}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
});

const mapDispatchToProps = {
  createGraphRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateGraphModal);

export default withRouter(Container);
