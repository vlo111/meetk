import { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';

class HeaderPortal extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    position: PropTypes.oneOf(['left', 'right']),
  }

  static defaultProps = {
    position: 'left',
  }

  constructor(props) {
    super(props);
    const { position } = this.props;
    this.className = `headerPortal${_.upperFirst(position)}`;
    this.el = document.createElement('div');
  }

  componentDidMount() {
    document.getElementById(this.className).appendChild(this.el);
  }

  componentWillUnmount() {
    document.getElementById(this.className).removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.el,
    );
  }
}

export default HeaderPortal;
