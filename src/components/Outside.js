import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

class Outside extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    component: PropTypes.any,
    id: PropTypes.string,
    exclude: PropTypes.string,
  }

  static defaultProps = {
    component: 'span',
    id: undefined,
    exclude: undefined,
  }

  static id = 0;

  constructor(props) {
    super(props);
    this.constructor.id += 1;
    this.id = `outside_${this.constructor.id}`;
  }

  componentDidMount() {
    const { children, ...events } = this.props;
    _.forEach(events, (cb, ev) => {
      if (ev.startsWith('on')) {
        const event = ev.replace(/^on/, '').toLowerCase();
        window.addEventListener(event, this.eventHandle, true);
      }
    });
  }

  componentWillUnmount() {
    const { children, ...events } = this.props;
    _.forEach(events, (cb, ev) => {
      if (ev.startsWith('on')) {
        const event = ev.replace(/^on/, '').toLowerCase();
        window.removeEventListener(event, this.eventHandle, true);
      }
    });
  }

  eventHandle = (ev) => {
    const { id, exclude } = this.props;
    const dataId = id || this.id;
    if ('closest' in ev.target && !ev.target.closest(`#${dataId}`)) {
      if (!exclude || !ev.target.closest(exclude)) {
        const callback = _.find(this.props, (fn, key) => key.toLowerCase() === `on${ev.type}`);
        callback(ev);
      }
    }
  }

  render() {
    const {
      component: C, children, id,
    } = this.props;
    const dataId = id || this.id;
    return (
      <C id={dataId}>
        {children}
      </C>
    );
  }
}

export default Outside;
