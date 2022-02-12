import { Component } from 'react';
import Account from '../../helpers/Account';

class SignOut extends Component {
  componentDidMount() {
    Account.delete();
    window.location.href = '/sign/sign-in';
  }

  render() {
    return null;
  }
}

export default SignOut;
