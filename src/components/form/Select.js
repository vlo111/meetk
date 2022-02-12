import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSelect, { components } from 'react-select';

import _ from 'lodash';
import ReactSelectCreatable from 'react-select/creatable';
import ReactSelectAsync from 'react-select/async';
import Icon from './Icon';
import Outside from '../Outside';
import { ReactComponent as ArrowSvg } from '../../assets/images/icons/arrow.svg';

const { Option } = components;

const IconOption = (props) => {
  if (props.options.filter((p) => p.value === 'image').length) {
    return (
      <Option {...props}>
        <div className="node-icons" style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div>
            {props.data.icon}
          </div>
          <div className="nodestyletext">
            <p>
              {props.data.label}
            </p>
          </div>
        </div>
      </Option>
    );
  }
  return <Option {...props} />;
};

class Select extends Component {
  static propTypes = {
    id: PropTypes.string,
    onChange: PropTypes.func,
    containerClassName: PropTypes.string,
    containerId: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string,
    children: PropTypes.node,
    icon: PropTypes.any,
    isCreatable: PropTypes.bool,
    portal: PropTypes.bool,
    isSearchable: PropTypes.bool,
    limit: PropTypes.number,
    options: PropTypes.array,
    value: PropTypes.array,
    getOptionValue: PropTypes.func,
    isMulti: PropTypes.bool,
  }

  static defaultProps = {
    id: undefined,
    onChange: undefined,
    containerClassName: '',
    containerId: undefined,
    label: undefined,
    children: undefined,
    error: undefined,
    getOptionValue: undefined,
    icon: undefined,
    isMulti: false,
    isCreatable: false,
    isSearchable: false,
    limit: undefined,
    portal: false,
    value: undefined,
    options: [],
  }

  static id = 0;

  constructor(props) {
    super(props);
    this.constructor.id += 1;
    this.id = this.constructor.id;
    this.state = {
      inputValue: undefined,
    };
  }

  renderMenu = (props) => {
    const {
      children, className, cx, innerRef, innerProps,
    } = props;
    return (
      <div
        className={cx({ menu: true }, className)}
        {...innerProps}
        ref={innerRef}
      >
        {children}
      </div>
    );
  }

  getValue = () => {
    const { value, getOptionValue } = this.props;
    const val = _.isArray(value) ? value[0] : value;
    return getOptionValue ? getOptionValue(val) : val.value;
  }

  handleInputChange = (inputValue) => {
    const { limit } = this.props;
    if (limit && inputValue.length > limit) {
      inputValue = inputValue.substr(0, limit);
    }
    this.setState({ inputValue });
  }

  handleKeyDown = (ev) => {
    if (['Enter', 'Tab'].includes(ev.key)) {
      ev.preventDefault();
      this.handleInputBlur();
    }
  }

  handleInputBlur = () => {
    const { inputValue } = this.state;
    const { value, isMulti } = this.props;
    if (!inputValue) return;
    if (isMulti) {
      const valueArr = _.isArray(value) ? value : [value];
      this.props.onChange(_.uniqBy([...valueArr, { value: inputValue, label: inputValue }], 'value'));
    } else if (!value || value[0]?.value !== inputValue) {
      this.props.onChange({ value: inputValue, label: inputValue });
    }
    this.setState({ inputValue: '' });
  }

  render() {
    const { inputValue } = this.state;
    const {
      id, label, containerClassName, containerId, children,
      error, icon, portal, limit, isCreatable, isAsync, ...props
    } = this.props;
    const inputId = id || `select_${this.id}`;
    const params = {};
    if (portal) {
      params.styles = { menuPortal: (base) => ({ ...base, zIndex: 9999 }) };
      params.menuPlacement = 'bottom';
      params.menuPortalTarget = document.body;
    }
    return (
      <div
        id={containerId}
        className={classNames(containerClassName, 'ghFormField', 'ghSelect', {
          ghIsSearchable: props.isSearchable,
          ghIsMulti: props.isMulti,
        })}
      >
        {label ? (
          <label htmlFor={inputId}>{label}</label>
        ) : null}
        <Icon value={icon} />
        {!isAsync && !isCreatable ? (
          <ReactSelect
            {...props}
            {...params}
            id={inputId}
            classNamePrefix="gh"
            className={classNames('ghSelectContent', props.className)}
            components={{ DropdownIndicator, Option: IconOption }}
          />
        ) : null}
        {isAsync ? (
          <ReactSelectAsync
            {...props}
            {...params}
            id={inputId}
            isSearchable
            classNamePrefix="gh"
            className={classNames('ghSelectContent', props.className)}
          />
        ) : null}
        {isCreatable ? (
          <Outside onMouseDown={this.handleInputBlur}>
            <ReactSelectCreatable
              {...props}
              {...params}
              isSearchable
              isCreatable
              id={inputId}
              classNamePrefix="gh"
              inputValue={inputValue}
              onKeyDown={this.handleKeyDown}
              onInputChange={this.handleInputChange}
              // onBlur={this.handleInputBlur}
              className={classNames('ghSelectContent', props.className)}
              components={{ DropdownIndicator }}
            />
          </Outside>
        ) : null}
        {!error && limit ? (
          <div className="limit">{`${limit - this.getValue().length} / ${limit} characters`}</div>
        ) : null}
        {children}
        {error ? (
          <div className="error">{error}</div>
        ) : null}
      </div>
    );
  }
}

const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <span><ArrowSvg /></span>
  </components.DropdownIndicator>
);

export default Select;
