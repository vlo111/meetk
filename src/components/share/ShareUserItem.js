import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Select from '../form/Select';
import { LABEL_SHARE_TYPES } from '../../data/graph';
import {
  deleteShareGraphWithUsersRequest,
  getSharedWithUsersRequest,
  updateShareGraphWithUsersRequest,
} from '../../store/actions/share';
import { ReactComponent as TrashSvg } from '../../assets/images/icons/trash.svg';
import Button from '../form/Button';

class ShareUserItem extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    updateShareGraphWithUsersRequest: PropTypes.func.isRequired,
    deleteShareGraphWithUsersRequest: PropTypes.func.isRequired,
  }

  handleUserRoleChange = async (value) => {
    const { user } = this.props;

    await this.props.updateShareGraphWithUsersRequest(user.share.id, { role: value.value, confirm: false });

    this.props.onChange(user, value.value);
  }

  handleDeleteShareGraph = async () => {
    const { user } = this.props;

    await this.props.deleteShareGraphWithUsersRequest(user.share.id);

    this.props.onChange(user, 'none');
  }

  render() {
    const { user } = this.props;
    return (
      <div className="shareContent">
        <div className="shareUserItem">
          <span>
            <img className="avatar" src={`${user.avatar}`} alt={`${user.firstName}`} />
          </span>
          <span className="userName">
            {`${user.firstName} ${user.lastName} `}
          </span>
          <Select
            portal
            onChange={this.handleUserRoleChange}
            value={LABEL_SHARE_TYPES.filter((t) => t.value === user.share.role)}
            containerClassName="shareType"
            options={LABEL_SHARE_TYPES}
          />
          <div className="separator" />
          <Button
            icon={<TrashSvg style={{ height: 30 }} />}
            onClick={this.handleDeleteShareGraph}
            className="transparent delete"
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  updateShareGraphWithUsersRequest,
  deleteShareGraphWithUsersRequest,
  getSharedWithUsersRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ShareUserItem);

export default Container;
