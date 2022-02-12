import React, { Component } from 'react';

class PopoverContent extends Component {
  handleClickOutSide(e) {
    if (this.node) {
      if (this.props.closeOnClick) {
        this.props.onClose();
      } else if (!this.node.contains(e.target)) {
        this.props.onClickOutSide();
      }
    }
  }

  componentDidMount() {
    this.node && this.node.focus();
    window.document.addEventListener('click', this.handleClickOutSide.bind(this), true);
  }

  componentWillUnmount() {
    this.node && this.node.blur();
    window.document.removeEventListener('click', this.handleClickOutSide.bind(this), true);
  }

  onKeyDown(e) {
    if (e.keyCode === 27) {
      e.stopPropagation();
      this.props.onClose();
    }
  }

  render() {
    return (
      <div
        ref={(node) => this.node = node}
        tabIndex="-1"
        onKeyDown={this.onKeyDown.bind(this)}
        className={`ar-popover-content${this.props.className ? ` ${this.props.className}` : ''}${this.props.placement ? ` ${this.props.placement}` : ''}${this.props.showArrow ? ' -arrow' : ''}`}
        style={this.props.style}
      >
        <div
          className="ar-popover-inner"
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

class Popover extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: !!this.props.visible,
    };
  }

  onShow(e) {
    e.stopPropagation();
    this.setState({ visible: true });
  }

  onClose() {
    this.setState({ visible: false });
  }

  onToggle(e) {
    e.stopPropagation();
    this.setState({ visible: !this.state.visible });
  }

  onClickOutSide() {
    this.onClose();
    this.props.onClickOutSide && this.props.onClickOutSide();
  }

  render() {
    return (
      <div className="ar-popover">
        {this.props.triggerNode && React.cloneElement(this.props.triggerNode, {
          onClick: this.props.trigger === 'click' || this.props.trigger === 'hover' ? this.onToggle.bind(this) : null,
          onMouseOver: this.props.trigger === 'hover' ? this.onShow.bind(this) : null,
        })}

        {this.state.visible
            && (
            <PopoverContent
              showArrow={this.props.showArrow}
              placement={this.props.placement}
              closeOnClick={this.props.closeOnClick}
              onClickOutSide={this.onClickOutSide.bind(this)}
              className={this.props.className}
              style={this.props.style}
              onClose={this.onClose.bind(this)}
            >
              {this.props.children}
            </PopoverContent>
            )}
      </div>
    );
  }
}

export default Popover;
