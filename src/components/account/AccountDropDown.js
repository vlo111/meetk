import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import Outside from '../Outside';
import Icon from '../form/Icon';
import Dropdown from '../../assets/images/whiteDownArrow.png';
import Utils from '../../helpers/Utils';

class AccountDropDown extends Component {
  static propTypes = {
    myAccount: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    mini: PropTypes.bool,
  }

  static defaultProps = {
    mini: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      showDropDown: false,
    };
  }

  componentDidUpdate() {
    const { showDropDown } = this.state;

    const arrow = document.querySelector('.accountArrow');

    if (arrow) {
      if (showDropDown) {
        const settingModalElement = document.querySelector('#accountDropDown .dropdown');

        if (settingModalElement) {
          arrow.style.left = `${(settingModalElement.getBoundingClientRect().x
              + (settingModalElement.offsetWidth / 2)) + 20}px`;
        }
      } else {
        arrow.style.display = 'none';
      }
    }
  }

  toggleDropDown = () => {
    const { showDropDown } = this.state;

    this.setState({ showDropDown: !showDropDown });
  }

  render() {
    const { showDropDown } = this.state;
    const {
      mini, myAccount: {
        firstName, lastName, id, avatar,
      },
    } = this.props;
    const name = [firstName, lastName].map((n) => n).join(' ');

    return (
      <div id="accountDropDown" className={mini ? 'mini' : undefined}>
        <div className="accountInfo" onClick={this.toggleDropDown}>
          <img src={avatar} className="avatar" alt={name} />
          <div className="accounEamail">{name}</div>
          <img src={Dropdown} alt="" />
        </div>

        {showDropDown ? (
          <>
            <Outside onClick={this.toggleDropDown} exclude="#accountDropDown">
              <div className="dropdown">
                <ul>
                  <li className="nameSign">
                    {mini ? (
                      <Icon value="fa-chevron-down" className="down" />
                    ) : (
                      <span className="name">{Utils.substr(name, 12)}</span>
                    )}
                  </li>
                  <li className="item">
                    <Link to={`/profile/${id}`}>Account</Link>
                  </li>
                  <li className="item">
                    <Link to="/sign/sign-out">Sign Out</Link>
                  </li>
                </ul>
              </div>
            </Outside>
          </>
        ) : null}

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  myAccount: state.account.myAccount,
});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AccountDropDown);

export default withRouter(Container);
