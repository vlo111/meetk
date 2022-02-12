import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from './Icon';

class Button extends Component {
  static propTypes = {
    icon: PropTypes.any,
    children: PropTypes.any,
    className: PropTypes.string,
    loading: PropTypes.bool,
    type: PropTypes.oneOf(['button', 'submit']),
    onClick: PropTypes.func,
    color: PropTypes.oneOf(['main', 'blue', 'accent', 'orange', 'transparent', 'light']),
  }

  static defaultProps = {
    icon: undefined,
    loading: undefined,
    onClick: undefined,
    children: '',
    type: 'button',
    className: '',
    color: 'main',
  }

  render() {
    const {
      icon, children, className, loading, color, ...props
    } = this.props;
    return (
      <button
        className={classNames('ghButton', className, color, { alt: color !== 'main', onlyIcon: !children })}
        {...props}
      >
        <Icon value={icon} />
        {children}
        {loading ? <Icon className="loading" value="fa-spinner fa-pulse fa-fw" /> : null}
      </button>
    );
  }
}

export default Button;
