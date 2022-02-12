import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Button from '../Button';
import { ReactComponent as CloseSvg } from '../../../assets/images/icons/close.svg';
import FileUpload from '../FileUpload';

class MediaModal extends Component {
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
      popUpData: {
        file: [],
        tags: [],
      },
    };
  }

  closeInsertMedia = () => {
    this.props.close();
  }

  insertData = () => {
    const { popUpData } = this.state;
    this.props.insertFile(popUpData);
    this.props.close();
  }

  handleTextChange = (path, value) => {
    const { popUpData } = this.state;
    _.set(popUpData, path, value);
    this.setState({ popUpData });
  }

  removeTag = (i) => {
    const { popUpData } = this.state;

    const newTags = [...popUpData.tags];
    newTags.splice(i, 1);

    _.set(popUpData, 'tags', newTags);
    this.setState({ popUpData });
  }

  inputTagKeyDown = (e) => {
    const val = e.target.value;
    const { popUpData } = this.state;

    if (e.key === 'Enter' && val) {
      if (popUpData.tags.find((tag) => tag.toLowerCase() === val.toLowerCase())) {
        return;
      }
      _.set(popUpData, 'tags', [...popUpData.tags, val]);
      this.tagInput.value = null;

      e.target.value = '';
      this.setState({ popUpData });
    } else if (e.key === 'Backspace' && !val) {
      this.removeTag(popUpData.tags.length - 1);
    }
  }

  addFile = (file) => {
    this.setState({
      popUpData: {
        file,
        tags: [],
      },
    });
  };

  render() {
    const { popUpData } = this.state;

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
            <FileUpload addFile={this.addFile} file={popUpData.file} />
            <div className="buttons">
              <Button className="cancel  btn-delete" onClick={this.closeInsertMedia}>
                Back
              </Button>
              <Button onClick={this.insertData} className="accent  btn-classic" type="submit">
                Insert
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default MediaModal;
