import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Input from './Input';
import Icon from './Icon';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { ReactComponent as SelectImg } from '../../assets/images/icons/upload.svg';
import Utils from '../../helpers/Utils';

class File extends Component {
  static propTypes = {
    onChangeFile: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    multiple: PropTypes.bool,
    label: PropTypes.string,
    containerClassName: PropTypes.string,
    containerId: PropTypes.string,
    id: PropTypes.string,
  }

  static defaultProps = {
    label: undefined,
    containerId: undefined,
    onChange: undefined,
    id: undefined,
    containerClassName: '',
    multiple: false,
  }

  static id = 0;

  constructor(props) {
    super(props);
    this.constructor.id += 1;
    this.id = this.constructor.id;
    this.state = {
      file: {},
      focused: false,
    };
  }

  handleInputFocus = () => {
    this.setState({ focused: true });
  }

  handleInputBlur = () => {
    this.setState({ focused: false });
  }

  handleChange = (ev) => {
    const { files } = ev.target;
    const { multiple } = this.props;
    if (this.props.onChangeFile) {
      this.props.onChangeFile(multiple ? files : files[0]);
    }
    if (this.props.onChange) {
      this.props.onChange(ev);
    }
    this.setState({ file: files[0] || '' });
  }

  clearFile = () => {
    this.setState({ file: {} });
    this.props.onChangeFile('', {
      name: '',
    });
  }

  handleTextChange = (name) => {
    this.setState({ file: { name } });
  }

  render() {
    const {
      id, containerId, containerClassName, onChangeFile, linkedIn, ...props
    } = this.props;

    const { file, focused } = this.state;
    const inputId = id || `file_${this.id}`;

    const fileName = props.value || file.name || '';
    const localFile = file.type && !!fileName;

    return (
      <div className={`ghFileInput ${focused ? 'focused' : ''}`}>
        {linkedIn ? (
          <div>
            {localFile ? (
              <Icon value={<CloseSvg />} className="clear" onClick={this.clearFile} />
            ) : null}
            <Input
              onFocus={this.handleInputFocus}
              onBlur={this.handleInputBlur}
              value={fileName}
              title={fileName}
              disabled={localFile}
              onChangeText={this.handleTextChange}
            />
            <div className="buttons">
              <label className="fileLabel">
                select file
                <input {...props} id={inputId} type="file" onChange={(ev) => this.handleChange(ev)} />
              </label>
            </div>

          </div>
        ) : (
          <div className="import-input">
            <Input
              className="InputLink"
              type="text"
              placeholder="Select or paste your file"
              onFocus={this.handleInputFocus}
              onBlur={this.handleInputBlur}
              value={Utils.substr(fileName, 10)}
              title={fileName}
              disabled={localFile}
              onChangeText={this.handleTextChange}
            />
            <div>
              {localFile ? (
                <Icon value={<CloseSvg />} className="clear" onClick={this.clearFile} />
              ) : null}
              <label>
                <SelectImg />
                <span>Select</span>
                <input {...props} id={inputId} type="file" onChange={(ev) => this.handleChange(ev)} />
              </label>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default File;
