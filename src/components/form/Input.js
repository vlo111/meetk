import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from './Icon';
import { ReactComponent as ArrowSvg } from '../../assets/images/icons/arrow.svg';

class Input extends Component {
  static propTypes = {
    id: PropTypes.string,
    onChangeText: PropTypes.func,
    onChange: PropTypes.func,
    containerClassName: PropTypes.string,
    containerId: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string,
    children: PropTypes.node,
    icon: PropTypes.any,
    textArea: PropTypes.bool,
    limit: PropTypes.number,
    onRef: PropTypes.func,
  }

  static defaultProps = {
    id: undefined,
    onChangeText: undefined,
    onChange: undefined,
    containerClassName: '',
    containerId: undefined,
    label: undefined,
    children: undefined,
    error: undefined,
    icon: undefined,
    textArea: false,
    limit: undefined,
    onRef: undefined,
  }

  static id = 0;

  constructor(props) {
    super(props);
    this.constructor.id += 1;
    this.id = this.constructor.id;
  }

  handleChange = (ev) => {
    const {
      onChangeText, onChange, limit, isNumber, value: prevValue,
    } = this.props;

    let { value, valueNumber = +value, name } = ev.target;

    if (isNumber) {
      if (Number.isNaN(valueNumber)) {
        return;
      } if (valueNumber > 50) {
        valueNumber = 50;
      }
      valueNumber = valueNumber === 0 ? prevValue : valueNumber;
    }

    if (limit && value.length > limit) {
      value = value.substr(0, limit);
    }
    if (onChange) onChange(ev);

    if (onChangeText) onChangeText(isNumber ? valueNumber : value, name);
  }

  handleKeyDown = (ev) => {
    const { onChangeText } = this.props;

    const value = parseInt(ev.target.value) || 0;

    if (onChangeText) {
      if (ev.key === 'ArrowDown') {
        onChangeText(value <= 1 ? 1 : value - 1);
      } else if (ev.key === 'ArrowUp') {
        onChangeText(value >= 50 ? 50 : value + 1);
      }
    }
  }

  numberArrowClick = (item) => {
    const { onChangeText, value } = this.props;

    if (onChangeText) {
      if (item === 'ArrowDown') {
        onChangeText(value <= 1 ? 1 : value - 1);
      } else if (item === 'ArrowUp') {
        onChangeText(value >= 50 ? 50 : value + 1);
      }
    }
  }

  showHideNumberArrow = (type) => {
    const arrowElements = document.querySelectorAll('.arrow-down, .arrow-top');

    for (let i = 0; i < arrowElements.length; i++) {
      if (type === 'leave') {
        arrowElements[i].style.display = 'none';
      } else if (type === 'hover') {
        arrowElements[i].style.display = 'flex';
      }
    }
  }

  numberArrowOnMouseDown = (item) => {
    document.querySelector(`.${item} svg path`).style.fill = 'white';
  }

  numberArrowOnMouseUp = (item) => {
    document.querySelector(`.${item} svg path`).style.fill = '#7166f8';
  }

  render() {
    const {
      id, label, containerClassName, containerId, children,
      textArea, limit, onRef, previewError, preview,
      error, onChangeText, icon, isNumber, ...props
    } = this.props;
    const inputId = id || `input_${this.id}`;
    return (
        <div
            id={containerId}
            className={classNames(containerClassName, 'ghFormField', 'ghInput')}
        >
          {label ? (
              <label htmlFor={inputId}>{label}</label>
          ) : null}
          {(preview && previewError !== 'error')
          && (
              <img
                  className="img-thumbnail"
                  src={preview}
                  alt=""
              />
          )}
          <Icon value={icon} />
          {textArea ? (
              <textarea ref={(ref) => onRef && onRef(ref)} {...props} id={inputId} onChange={this.handleChange} />
          ) : (
              isNumber
                  ? (
                      <div className="number-input-container" onMouseLeave={() => this.showHideNumberArrow('leave')}>
                <span
                    className="arrow-top"
                    onClick={() => this.numberArrowClick('ArrowUp')}
                    onMouseDown={() => this.numberArrowOnMouseDown('arrow-top')}
                    onMouseUp={() => this.numberArrowOnMouseUp('arrow-top')}
                >
                  <ArrowSvg />
                </span>
                        <span
                            className="arrow-down"
                            onClick={() => this.numberArrowClick('ArrowDown')}
                            onMouseDown={() => this.numberArrowOnMouseDown('arrow-down')}
                            onMouseUp={() => this.numberArrowOnMouseUp('arrow-down')}
                            onWheel={() => this.numberArrowClick('ArrowDown')}
                        >
                  <ArrowSvg />
                </span>
                        <input
                            ref={(ref) => onRef && onRef(ref)}
                            {...props}
                            id={inputId}
                            onChange={this.handleChange}
                            onKeyDown={this.handleKeyDown}
                            onMouseOver={() => this.showHideNumberArrow('hover')}
                        />
                      </div>
                  )
                  : <input ref={(ref) => onRef && onRef(ref)} {...props} id={inputId} onChange={this.handleChange} />
          )}
          {!error && limit ? (
              <div className="limit">{`${limit - (props.value || '').length} / ${limit} characters`}</div>
          ) : null}
          {children}
          {error ? (
              <div className="error">{error}</div>
          ) : null}
        </div>
    );
  }
}

export default Input;
