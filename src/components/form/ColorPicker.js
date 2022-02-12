import React, { Component } from 'react';
import { SketchPicker } from 'react-color';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import Outside from '../Outside';
import Input from './Input';
import { NODE_COLOR } from '../../data/node';

class ColorPicker extends Component {
  static propTypes = {
    onChangeText: PropTypes.func.isRequired,
    containerClassName: PropTypes.string,
    value: PropTypes.string,
    expand: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    containerClassName: '',
    value: '',
  }

  constructor(props) {
    super(props);
    this.state = {
      target: null,
    };
  }

  handleColorClick = (ev) => {
    const title = ev.target.getAttribute('title');
    if (title && title.startsWith('#')) {
      this.closePicker();
    }
  }

  closePicker = () => {
    this.setState({ target: null });
  }

  toggleColorPicker = (ev) => {
    const { target } = this.state;
    this.setState({ target: !target ? ev.target : null });
  }

  renderPicker = (left = 0, top = 0, pickerHeight) => {
    const { target } = this.state;
    const { value, onChangeText } = this.props;

    let x;
    let y;
    let height;

    if (pickerHeight) {
      x = left;
      y = top;
      height = pickerHeight;
    } else {
      x = target.getBoundingClientRect().x;
      y = target.getBoundingClientRect().y;
      height = target.getBoundingClientRect().height;
    }

    return (
      <Outside exclude=".ghColorPicker" onClick={this.closePicker}>
        {left !== 0
          ? (ReactDOM.createPortal((
            <div
              className="ghColorPickerPopUp"
              onClick={this.handleColorClick}
              style={{ left: x, top: y + height - 35 }}
            >
              <SketchPicker
                width={230}
                color={value}
                disableAlpha
                onChange={(v) => onChangeText(v.hex)}
                presetColors={[...NODE_COLOR].splice(0, 18)}
              />
            </div>
          ), document.body))
          : (
            <div
              className="ghColorPickerPopUp"
              onClick={this.handleColorClick}
              style={{ left: x, top: y - 200 }}
            >
              <SketchPicker
                width={230}
                color={value}
                disableAlpha
                onChange={(v) => onChangeText(v.hex)}
                presetColors={[...NODE_COLOR].splice(0, 18)}
              />
            </div>
          )}
      </Outside>
    );
  }

  render() {
    const {
      containerClassName, expand, ...props
    } = this.props;
    const { target } = this.state;
    return (
      <>
        <Input
          {...props}
          containerClassName={classNames(containerClassName, 'ghColorPicker')}
          onClick={this.toggleColorPicker}
        />
        {expand ? this.renderPicker(0, -30, 200) : (target ? this.renderPicker() : null)}
      </>
    );
  }
}

export default ColorPicker;
