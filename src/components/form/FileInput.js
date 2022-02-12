import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Input from './Input';
import Icon from './Icon';
import Utils from '../../helpers/Utils';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { ReactComponent as SelectImg } from '../../assets/images/icons/upload.svg';

class FileInput extends Component {
  static propTypes = {
    onChangeFile: PropTypes.func.isRequired,
    accept: PropTypes.string,
    selectLabel: PropTypes.string,
    value: PropTypes.any,
  }

  static defaultProps = {
    accept: undefined,
    selectLabel: 'Select File',
    value: undefined,
  }

  static blobs = {};

  constructor(props) {
    super(props);
    this.state = {
      file: {},
      focused: false,
    };
  }

  handleFileSelect = (ev) => {
    const file = ev.target.files[0] || {};
    this.setState({ file });
    const uri = Utils.fileToBlob(file);
    this.constructor.blobs[uri] = file.name;
    file.uri = uri;
    this.props.onChangeFile(uri, file);
    this.props.onChangeImgPreview('');

    ev.target.value = '';
  }

  handleTextChange = async (name) => {
    const isImage = Utils.checkImageUrl(name, this.record);

    if (!isImage) {
      this.props.onChangeImgPreview('error');
    }

    this.props.onChangeFile(name, {
      name,
    });
  }

  record = (url, result) => {
    if (result === 'success') {
      this.props.onChangeImgPreview(url);
    } else {
      this.props.onChangeImgPreview('error');
    }
  }

  clearFile = () => {
    this.setState({ file: {} });
    this.props.onChangeFile('icon', '');
    this.props.onChangeImgPreview();
  }

  handleInputFocus = () => {
    this.setState({ focused: true });
  }

  handleInputBlur = () => {
    this.setState({ focused: false });
  }

  render() {
    const { file, focused } = this.state;
    const {
      accept, selectLabel, onChangeFile, ...props
    } = this.props;

    let { preview } = this.props;

    let value = props.value || file.name || '';
    let localFile = file instanceof File;
    if (_.isObject(value) && 'name' in value) {
      value = value.name;
    } else if (value.toString().startsWith('blob:')) {
      localFile = true;
      value = this.constructor.blobs[value] || 'Selected';
    } else if (value.toString().startsWith('data:')) {
      value = '';
    }

    if (preview) {
      if (typeof preview === 'object') {
        if (preview.uri) {
          preview = preview.uri;
        } else {
          preview = preview.name;
        }
      }
    }

    return (
        <div className={`ghFileInput  ${focused ? 'focused' : ''}`}>
          <Input
              // className="inputFile"
              {...props}
              onFocus={this.handleInputFocus}
              onBlur={this.handleInputBlur}
              value={value}
              disabled={localFile}
              onChangeText={this.handleTextChange}
              preview={preview}
          />
          {/* <div className="buttons">
            {localFile ? (
                <Icon value={<CloseSvg/>} className="clear" onClick={this.clearFile}/>
            ) : null}
            <label className="fileLabel">
            <img className="uploadImg" src={SelectImg} />
              {selectLabel}
              <input type="file" accept={accept} onChange={this.handleFileSelect}/>
            </label>
          </div> */}
          <div className="import-input InputFile">
            <div>
              {localFile ? (
                  <Icon value={<CloseSvg />} className="clear" onClick={this.clearFile} />
              ) : null}
              <label>
                <SelectImg />
                {/* <img className="uploadImg" src={SelectImg} /> */}

                <span>Select</span>
                <input type="file" accept={accept} onChange={this.handleFileSelect} />
              </label>
            </div>
          </div>
        </div>
    );
  }
}

export default FileInput;
