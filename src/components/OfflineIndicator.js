import React, { Component } from 'react';

class OfflineIndicator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      onLine: navigator.onLine,
    };
  }

  componentDidMount() {
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  }

  updateOnlineStatus = () => {
    const { onLine } = navigator;
    this.setState({ onLine });
  };

  render() {
    const { onLine } = this.state;
    if (onLine === true) {
      return null;
    }
    return (
      <div id="offline">
        {'You\'re offline right now. Please check your connection.'}
      </div>
    );
  }
}

export default OfflineIndicator;
