import _ from 'lodash';
import Chart from '../Chart';
// import CustomFields from './CustomFields';
import ChartUtils from './ChartUtils';

class Validate {
  static nodeName(val, update, nodes = []) {
    const value = (val || '').trim();
    let error = null;
    if (!value) {
      error = 'Name is required';
    } else if (!update && nodes.some((d) => d.name === value)) {
      error = 'Already exists';
    }
    return [error, value];
  }

  static nodeType(val) {
    const value = (val || '').trim();
    let error = null;
    if (!value) {
      error = 'Type is required';
    }
    return [error, value];
  }

  static nodeLocation(val) {
    if (!val) {
      return [null, undefined];
    }
    let value = val;
    let error = null;
    if (_.isString(val)) {
      value = value.split(',');
    }
    if (!value[0] && !value[1]) {
      return [null, undefined];
    }
    if (!value[0] || !value[1]) {
      error = 'Invalid location';
    }
    return [error, value.join(',')];
  }

  static nodeColor(val, type) {
    const value = (val || '').trim();
    let error = null;
    if (ChartUtils.nodeColorObj[type] !== val
      && Object.entries(ChartUtils.nodeColorObj).find(([, c]) => value === c)) {
      error = 'Already exists';
    }
    return [error, value];
  }

  static nodeLink(link) {
    let error = null;

    const expression = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\\.-]+)+[\w\-\\._~:/?#[\]@!\\$&'\\(\\)\\*\\+,;=.]+$/gm;
    const regex = new RegExp(expression);

    if (!link.match(regex)) {
      error = 'Invalid Link Address';
    }

    return [error, link];
  }

  static linkType(val, linkData) {
    let value = (val || '').trim();

    if (!linkData) {
      return ['', value];
    }

    const { source, target, index } = linkData;
    const links = Chart.getLinks();

    let error = null;

    const sameLink = links.find((d) => source === d.source && target === d.target && value === d.type);
    if (!value) {
      error = 'Type is required';
    } else if (sameLink) {
      if (sameLink.index !== index) {
        error = 'Already exists';
        value = '';
      }
    }

    return [error, value];
  }

  static linkValue(val) {
    let value = +val;
    let error = null;
    if (value < 1) {
      error = 'Value can\'t be less than 1';
      value = 1;
    } else if (value > 15) {
      error = 'Value can\'t be more than 15';
      value = 15;
    }
    return [error, value];
  }

  static node(key, value) {
    switch (key) {
      case 'name': {
        return this.nodeName(value);
      }
      case 'type': {
        return this.nodeType(value);
      }
      default: {
        return [null, value];
      }
    }
  }

  static link(key, value) {
    switch (key) {
      case 'value': {
        return this.linkValue(value);
      }
      case 'type': {
        return this.linkType(value);
      }
      default: {
        return [null, value];
      }
    }
  }

  static hasError(errors) {
    return _.some(errors, (e) => e);
  }

  static customFieldType(val, node, customField) {
    // const customFields = CustomFields.getCustomField(node, Chart.getNodes());
    const value = (val || '').trim();
    let error;
    if (!value) {
      error = 'Field is required';
    } else if (customField.some((f) => f.name === val)) {
      error = 'Field already exists';
    }
    return [error, value];
  }

  static customFieldContent(val) {
    const value = (val || '').trim();
    let error;
    if (!value) {
      error = 'Field is required';
    }
    return [error, value];
  }

  static customFieldSubtitle(val) {
    const value = (val || '').trim();
    return [null, value];
  }

  static labelName(val) {
    const value = (val || '').trim().replace(/"/g, "'");
    let error = null;
    if (!value) {
      error = 'Name is required';
    }
    return [error, value];
  }

  static register(data) {
    const {
      firstName, lastName, email, password, passwordConfirm,
    } = data;

    let errors = {};

    if (!firstName || firstName.trim() === '') {
      errors.firstName = 'First name is required';
    }

    if (!lastName || lastName.trim() === '') {
      errors.lastName = 'last name is required';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (!email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      errors.email = 'Enter a valid email address';
    }

    errors = this.passwordValidation(errors, password, passwordConfirm);

    return errors;
  }

  static passwordValidation({ passwordConfirm: confirm, password: checkPassword, oldPassword: oldPass }) {
    let password = '';
    let passwordConfirm = '';
    let oldPassword = '';

    if (!oldPass) {
      oldPassword = 'Password is required';
    }
    if (!checkPassword) {
      password = 'Password is required';
    } else if (checkPassword.length < 8) {
      password = 'Please enter at least 8 character';
    } else if (!checkPassword.match(/[a-z]/g)) {
      password = 'Please enter at least one lowercase character';
    } else if (!checkPassword.match(/[A-Z]/g)) {
      password = 'Please enter at least one uppercase character';
    } else if (!checkPassword.match(/[0-9]/g)) {
      password = 'Please enter at least one digit.';
    }
    if (!confirm) {
      passwordConfirm = 'Confirm password is required';
    } else if (confirm !== checkPassword) {
      passwordConfirm = 'Password and confirm password do not match';
    }

    return [password, passwordConfirm, oldPassword];
  }
}

export default Validate;
