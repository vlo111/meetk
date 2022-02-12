import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Button from '../../form/Button';
import { ReactComponent as CloseSvg } from '../../../assets/images/icons/close.svg';
import FileUpload from '../../form/FileUpload';
import Input from '../../form/Input';
import Select from '../../form/Select';
import Utils from '../../../helpers/Utils';

class InsertMediaModal extends Component {
    static propTypes = {
      close: PropTypes.func,
      insertFile: PropTypes.func,
    }

    static defaultProps = {
      close: null,
      insertFile: null,
    }

    constructor(props) {
      super(props);
      this.state = {
        files: [],
        fileData: {
          tags: [],
        },
      };
    }

    handleChange = (path, value) => {
      const { fileData } = this.state;
      _.set(fileData, path, value);
      this.setState({ fileData });
    }

    closeInsertMedia = () => {
      this.props.close();
    }

    insertData = () => {
      const { files, fileData } = this.state;

      const file = files[0];

      const id = Utils.generateUUID();

      file.id = id;
      fileData.id = id;

      this.props.insertFile(file, fileData);
      this.props.close();
    }

    addFile = (files) => {
      this.setState({ files });
    };

    render() {
      const { files, fileData } = this.state;

      return (
        <Modal
          className="ghModal insertMediaModal"
          overlayClassName="ghModalOverlay"
          isOpen
          onRequestClose={this.closeInsertMedia}
        >
          <div className="containerModal">
            <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeInsertMedia} />
            <div className="form">
              <h2>Select media</h2>
              <FileUpload addFile={this.addFile} file={files} />
              <Input
                type="text"
                value={fileData.description || ''}
                label="Description"
                onChange={(ev) => this.handleChange('description', ev.target.value)}
              />
              <Input
                type="text"
                value={fileData.alt || ''}
                label="Alternative text"
                onChange={(ev) => this.handleChange('alt', ev.target.value)}
              />
              <Select
                label="Tags"
                isCreatable
                isMulti
                value={fileData.tags.map((v) => ({ value: v, label: v }))}
                menuIsOpen={false}
                placeholder="Add..."
                onChange={(value) => this.handleChange('tags', (value || []).map((v) => v.value))}
              />
              <div className="buttons">
                <Button className="inserCancel btn-delete" onClick={this.closeInsertMedia}>
                  Back
                </Button>
                <Button onClick={this.insertData} className="accent btn-classic">
                  Insert
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      );
    }
}

export default InsertMediaModal;
