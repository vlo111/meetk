import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import Button from '../../components/form/Button';
import { updateMyAccountRequest } from '../../store/actions/account';
import Input from '../../components/form/Input';
import ImageUploader from '../../components/ImageUploader';
import UpdatePasswordModal from '../../components/account/UpdatePasswordModal';

class Profile extends Component {
  static propTypes = {
    updateMyAccountRequest: PropTypes.func.isRequired,
    myAccount: PropTypes.object.isRequired,
  }

  initValues = memoizeOne((requestData) => {
    this.setState({ requestData });
  })

  constructor(props) {
    super(props);
    this.state = {
      requestData: {
        lastName: '',
        firstName: '',
        oldPassword: '',
        password: '',
        repeatPassword: '',
      },
      changePassword: false,
      errors: {},
    };
  }

  handleChange = (value, path) => {
    const { requestData, errors } = this.state;
    _.set(requestData, path, value);
    _.unset(errors, path, value);
    this.setState({ requestData, errors });
  }

  saveAccount = async (ev) => {
    ev.preventDefault();
    const { requestData } = this.state;
    const { myAccount } = this.props;
    const { payload: { data } } = await this.props.updateMyAccountRequest(requestData);
    if (data.status === 'ok') {
      toast.info('Successfully saved');
    } else if (data?.errors) {
      this.setState({ errors: data.errors });
    } else {
      toast.error('Something went wrong');
    }
    if (requestData.firstName && requestData.lastName) {
      window.location.href = `/profile/${myAccount.id}`;
    }
  }

  toggleChangePassword = (changePassword) => {
    this.setState({ changePassword });
  }

  render() {
    const { errors, requestData, changePassword } = this.state;
    const { myAccount } = this.props;
    this.initValues(myAccount);
    return (
      <div className="profileSettings">
        <form onSubmit={this.saveAccount}>
          <div className="left">
            <ImageUploader
              value={myAccount.avatar}
              email={myAccount.email}
              onChange={(val) => this.handleChange(val || '', 'avatar')}
            />
          </div>
          <div className="right">
            <div className="row">
              <strong className="email">Email : </strong>
              {requestData.email}
            </div>
            <div className="row">
              <Input
                name="firstName"
                label="First Name"
                value={requestData.firstName}
                error={errors.firstName}
                onChangeText={this.handleChange}
                containerClassName="firstName"
              />
              <Input
                name="lastName"
                label="Last Name"
                value={requestData.lastName}
                error={errors.lastName}
                onChangeText={this.handleChange}
              />
            </div>
            <div className="row">
              <Input
                name="bio"
                label="Short description/ bio"
                containerClassName="bio"
                textArea
                value={requestData.bio}
                error={errors.bio}
                onChangeText={this.handleChange}
              />
            </div>
            <div />
            <div className="row">
              <Input
                name="website"
                label="Website"
                type="url"
                value={requestData.website}
                error={errors.website}
                onChangeText={this.handleChange}
                // pattern="^(?:https?:\/\/)?(?:www\.|m\.|touch\.)?(?:google\.com|go(?:\.me|\.com))\/
                // (?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*?(\/)?([^/?\s]*)(?:/|&|\?)?.*$"
              />
            </div>
            <div className="socialright">
              <i className="fa fa-globe" />
              <span> SOCIAL</span>
            </div>
            <div className="rigt-input">
              <div className="row">
                <div className="social_icon">
                  <i className="fa fa-facebook-square" />
                </div>
                <Input
                  name="facebook"
                  label="Facebook"
                  type="url"
                  value={requestData.facebook}
                  error={errors.facebook}
                  onChangeText={this.handleChange}
                  // eslint-disable-next-line max-len
                  pattern="^(?:https?:\/\/)?(?:www\.|m\.|touch\.)?(?:facebook\.com|fb(?:\.me|\.com))\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*?(\/)?([^/?\s]*)(?:/|&|\?)?.*$"
                />
              </div>
              <div className="row">
                <div className="social_icon">
                  <i className="fa fa-twitter" />
                </div>
                <Input
                  name="twitter"
                  label="Twitter"
                  type="url "
                  value={requestData.twitter}
                  error={errors.twitter}
                  onChangeText={this.handleChange}
                  // eslint-disable-next-line max-len
                  pattern="^(?:https?:\/\/)?(?:www\.|m\.|touch\.)?(?:twitter\.com|tw(?:\.me|\.com))\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*?(\/)?([^/?\s]*)(?:/|&|\?)?.*$"

                />
              </div>
              <div className="row">
                <div className="social_icon">
                  <i className="fa fa-linkedin"> </i>
                </div>
                <Input
                  name="linkedin"
                  label="Linkedin"
                  type="url"
                  value={requestData.linkedin}
                  error={errors.linkedin}
                  onChangeText={this.handleChange}
                  // eslint-disable-next-line max-len
                  pattern="^(?:https?:\/\/)?(?:www\.|m\.|touch\.)?(?:linkedin\.com|in(?:\.me|\.com))\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*?(\/)?([^/?\s]*)(?:/|&|\?)?.*$"
                />
              </div>
              <div className="row">
                <div className="social_icon">
                  <i className="fa fa-skype" />
                </div>
                <Input
                  name="skype"
                  label="Skype"
                  type="url"
                  value={requestData.skype}
                  error={errors.skype}
                  onChangeText={this.handleChange}
                  // eslint-disable-next-line max-len
                  pattern="^(?:https?:\/\/)?(?:www\.|m\.|touch\.)?(?:skype\.com|sk(?:\.me|\.com))\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*?(\/)?([^/?\s]*)(?:/|&|\?)?.*$"
                />
              </div>

            </div>
            <Button className="changePassword" onClick={() => this.toggleChangePassword(!changePassword)}>
              Change Password
            </Button>

            <Button className="save" color="accent" type="submit">Save Changes</Button>
          </div>
        </form>
        {changePassword ? (
          <UpdatePasswordModal
            onClose={() => this.toggleChangePassword(false)}
          />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  myAccount: state.account.myAccount,
});

const mapDispatchToProps = {
  updateMyAccountRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Profile);

export default Container;
