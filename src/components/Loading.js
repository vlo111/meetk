import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Loading extends Component {
  static propTypes = {
    size: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.object,
  }

  static defaultProps = {
    size: 50,
    className: '',
    style: {},
  }

  render() {
    const { size, className, style } = this.props;
    return (
      <div
        className={`ghLoading ${className}`}
        style={{
          width: size, height: size, borderWidth: size / 10, ...style,
        }}
      />
    );
  }
}

export default Loading;
