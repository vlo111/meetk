import React, { Component } from 'react';
import _ from 'lodash';
import Modal from 'react-modal';
import { connect, useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import ContextMenu from '../contextMenu/ContextMenu';
import Select from '../form/Select';
import { searchUsers } from '../../store/actions/profile';
import {
  getSharedWithUsersRequest,
  shareGraphWithUsersRequest,
} from '../../store/actions/share';
import { updateShareGraphStatusRequest, graphUsersRequest } from '../../store/actions/shareGraphs';

import ShareUserItem from './ShareUserItem';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';

class LabelShare extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    shareGraphWithUsersRequest: PropTypes.func.isRequired,
    getSharedWithUsersRequest: PropTypes.func.isRequired,
    searchUsers: PropTypes.func.isRequired,
    shareWithUsers: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      labelId: null,
    };
  }

  componentDidMount() {
    ContextMenu.event.on('label.share', this.openShareModal);
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener('label.share', this.openShareModal);
  }

  openShareModal = (ev, params) => {
    const {
      match: {
        params: { graphId = '' },
      },
    } = this.props;
    const { id: labelId } = params;
    this.props.getSharedWithUsersRequest(graphId, 'label', labelId);
    this.setState({ labelId });
  };

  closeModal = async () => {
    const { match: { params: { graphId = '' } } } = this.props;
    // change status
    await this.props.updateShareGraphStatusRequest({ graphId });
    // reload list user
    await this.props.graphUsersRequest({ graphId });
    this.setState({ labelId: null });
  };

  searchUser = async (value) => {
    const {
      payload: { data },
    } = await this.props.searchUsers(value);
    return data.users || [];
  };

  addUser = async (value) => {
    const { labelId } = this.state;
    const {
      match: {
        params: { graphId = '' },
      },
    } = this.props;
    await this.props.shareGraphWithUsersRequest({
      graphId,
      userId: value.id,
      type: 'label',
      objectId: labelId,
      confirm: false,
    });
    this.handleUserRoleChange();
  };

  handleUserRoleChange = () => {
    const { labelId } = this.state;
    const {
      match: {
        params: { graphId = '' },
      },
    } = this.props;
    this.props.getSharedWithUsersRequest(graphId, 'label', labelId);
  };

  save = async () => {
    toast.info('Successfully confirmed');
    this.closeModal();
  };

  render() {
    const { shareWithUsers } = this.props;
    const { labelId } = this.state;
    return (
      <Modal
        className="ghModal ghModalLabelShare"
        overlayClassName="ghModalOverlay ghModalLabelShareOverlay"
        isOpen={!_.isNull(labelId)}
        onRequestClose={this.closeModal}
      >
        <Button
          color="transparent"
          className="close"
          icon={<CloseSvg />}
          onClick={this.closeModal}
        />
        <Select
          label="Collaborators"
          portal
          containerClassName={`addUserField ${
            shareWithUsers.length && ' userFildSize'
          } `}
          placeholder="Search..."
          isAsync
          cacheOptions
          value={[]}
          onChange={this.addUser}
          loadOptions={this.searchUser}
          getOptionLabel={(d) => {
            const label = `${d.firstName} ${d.lastName}`;
            // if (d.email) {
            //   label += `(${d.email})`;
            // }

            return label;
          }}
          getOptionValue={(d) => d.id}
        />
        {shareWithUsers.map((user) => (
          <ShareUserItem
            id={user.id}
            user={user}
            onChange={this.handleUserRoleChange}
          />
        ))}
        {shareWithUsers.length > 0 && (
          <Button className="saveShareGraph btn-classic"  onClick={this.save}>
            OK
          </Button>
        )}
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  shareWithUsers: state.share.shareWithUsers,
});

const mapDispatchToProps = {
  searchUsers,
  getSharedWithUsersRequest,
  shareGraphWithUsersRequest,
  graphUsersRequest,
  updateShareGraphStatusRequest,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(LabelShare);

export default withRouter(Container);
