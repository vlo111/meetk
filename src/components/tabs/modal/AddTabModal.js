import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import Input from '../../form/Input';
import Button from '../../form/Button';
import Validate from '../../../helpers/Validate';
import { ReactComponent as CloseSvg } from '../../../assets/images/icons/close.svg';
import { updateNodesCustomFieldsRequest } from '../../../store/actions/nodes';
import Api from '../../../Api';
import Utils from '../../../helpers/Utils';
import Editor from '../../form/Editor';
import ConfirmSaveModal from './ConfirmSaveModal';
import Chart from '../../../Chart';

class AddTabModal extends Component {
    static propTypes = {
      onClose: PropTypes.func.isRequired,
      node: PropTypes.object.isRequired,
    }

    initValues = memoizeOne((node, fieldName, customFields) => {
      let tabData = {};
      if (fieldName === '_description') {
        tabData = {
          name: fieldName,
          originalName: fieldName,
          value: node.description,
        };
      } else {
        const customField = customFields.find((f) => f.name === fieldName);
        if (customField) {
          tabData = {
            name: fieldName,
            originalName: fieldName,
            value: customField.value,
            subtitle: customField.subtitle,
          };
        }
      }
      this.setState({ tabData });
    }, _.isEqual)

    constructor(props) {
      super(props);
      this.state = {
        errors: {},
        files: [],
        tabData: {
          name: '',
          value: '',
          subtitle: '',
        },
        showSaveModal: false,
      };
    }

    getLink = (value) => {
      const currentValue = document.createElement('div');

      currentValue.innerHTML = value.trim();

      return currentValue.getElementsByClassName('documentContainer');
    }

    checkDeleteDocument = (value, prev) => {
      const currentVal = this.getLink(value);

      const prevVal = this.getLink(prev);

      let deletedLink = '';

      if (currentVal) {
        [].forEach.call(currentVal, (el) => {
          [].forEach.call(prevVal, (prev_el) => {
            const valueLink = el.querySelector('a');
            const prevValueLink = prev_el.querySelector('a');

            if (valueLink && prevValueLink) {
              if (valueLink.href === prevValueLink.href) {
                if (valueLink.innerText !== prevValueLink.innerText) {
                  deletedLink = el.innerHTML;
                }
              }
            }
          });
        });
      }
      return deletedLink;
    }

    handleChange = (path, value, prev) => {
      const { tabData, errors } = this.state;

      if (value && path === 'value') {
        const isDelete = this.checkDeleteDocument(value, prev);
        if (isDelete) {
          value = value.replace(isDelete, '');
        }
      }

      _.set(tabData, path, value);
      _.remove(errors, path);
      this.setState({ tabData, errors });
    }

    insertFile = (file) => {
      const { files } = this.state;

      files.push(file);

      this.setState({
        files,
      });
    }

    fileDataFromEditor = (document) => {
      const id = document.querySelector('#docId')?.innerText;

      const description = document.querySelector('.description')?.innerText;

      const tags = document.querySelector('.tags')?.innerText;

      let fileField = document.querySelector('img');

      if (!fileField) {
        fileField = document.querySelector('a');
      }

      return {
        id, description, tags, fileField,
      };
    }

    getDocuments = (documents) => {
      const { files } = this.state;

      const originalFiles = [];

      const fileData = [];

      documents.forEach((document) => {
        const {
          id, description, tags, fileField,
        } = this.fileDataFromEditor(document);

        const file = files.filter((p) => p.id == id);

        if (file.length && fileField) {
          fileData.push({
            id,
            description,
            tags,
          });
          originalFiles.push(file);
        }
      });

      return { fileData, files: originalFiles };
    }

    getUpdatedFiles = (customFields) => {
      const { documentElement } = Utils.tabHtmlFile(customFields.value);

      const { files } = this.state;

      let insertFiles = null;

      if (files.length) {
        insertFiles = this.getDocuments(documentElement);
      }

      const newFiles = [];

      documentElement.forEach((document) => {
        const {
          id, description, tags, fileField,
        } = this.fileDataFromEditor(document);

        if (fileField) {
          const path = fileField.src ?? fileField.href;

          const isInserted = !insertFiles ? true : !insertFiles.fileData.filter((p) => p.id === id).length;

          if (isInserted) {
            if (fileField) {
              newFiles.push({
                id,
                description,
                tags,
                path: `${path.substring(0, 7)}${path.substr(7).replaceAll('/', '\\')}`,
              });
            }
          }
        }
      });

      return { insertFiles, updatedFiles: newFiles };
    }

    getFileFromTab = (customFields) => {
      const { documentElement } = Utils.tabHtmlFile(customFields.value);

      const { fileData, files } = this.getDocuments(documentElement);

      return { fileData, files };
    }

    save = async () => {
      const {
        node, fieldName, customFields,
      } = this.props;

      const { tabData, errors } = this.state;

      if (fieldName === '_description') {
        const nodes = Chart.getNodes();

        nodes.map((p) => {
          if (p.id === node.id) {
            p.description = tabData.value;
          }
        });
        Chart.render({ nodes });
        this.props.onClose(tabData.value);
      } else {
        const isUpdate = !!fieldName;

        if (!isUpdate || (tabData.originalName !== tabData.name)) {
          [errors.name, tabData.name] = Validate.customFieldType(tabData.name, node, customFields);
        }
        // return;
        [errors.value, tabData.value] = Validate.customFieldContent(tabData.value);
        [errors.subtitle, tabData.subtitle] = Validate.customFieldSubtitle(tabData.subtitle);

        if (!Validate.hasError(errors)) {
          const data = {
            name: tabData.name,
            value: tabData.value,
            subtitle: tabData.subtitle,
          };

          if (!isUpdate) {
            customFields.push(data);

            const { fileData, files } = this.getFileFromTab(customFields[customFields.length - 1]);

            if (fileData.length) {
              await Api.createDocument(Utils.getGraphIdFormUrl(), node.id, data.name, fileData, files).catch((d) => d);
            }
          } else {
            const i = customFields.findIndex((f) => f.name === tabData.originalName);
            if (i > -1) {
              customFields[i] = data;

              const { insertFiles, updatedFiles } = this.getUpdatedFiles(customFields[i]);

              await Api.updateDocument(Utils.getGraphIdFormUrl(),
                node.id, data.name,
                { fileData: insertFiles?.fileData, updatedFiles },
                insertFiles?.files)
                .catch((d) => d);
            }
          }

          this.props.setActiveTab(tabData.name);
          this.props.onClose(data, fieldName || tabData.name);
        } else {
          this.setState({
            showSaveModal: false,
          });
        }
        this.setState({ errors, tabData });
      }
    }

    showSaveModal = async () => {
      const { showSaveModal } = this.state;

      this.setState({ showSaveModal: !showSaveModal });
    }

    closeFormModal = async () => {
      this.setState({ showSaveModal: false });
      await this.props.onClose();
    }

    render() {
      const { tabData, errors, showSaveModal } = this.state;
      const { node, fieldName, customFields } = this.props;
      this.initValues(node, fieldName, customFields);
      const isUpdate = !!fieldName;

      return (
        <Modal
          isOpen
          className="ghModal nodeTabsFormModal"
          overlayClassName="ghModalOverlay nodeTabsFormModalOverlay"
        >
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.showSaveModal} />
          <h3>{isUpdate ? 'Update Tab' : 'Add New Tab'}</h3>
          <div className="row">
            {fieldName !== '_description' ? (
              <Input
                value={tabData.name}
                error={errors.name}
                label="Name"
                onChangeText={(v) => this.handleChange('name', v)}
              />
            ) : <label className="description">Description</label>}
          </div>
          <Editor
            value={tabData.value}
            error={errors.value}
            label="ContentTabs"
            node={node}
            insertFile={this.insertFile}
            onChange={(value, prev) => this.handleChange('value', value, prev)}
          />
          <div className="buttonsWrapper">
            <button className="btn-delete" onClick={this.showSaveModal}>Cancel</button>
            <button className="btn-classic" onClick={this.save}>
              {isUpdate ? 'Save' : 'Add'}
            </button>
          </div>
          {showSaveModal && <ConfirmSaveModal hide={this.showSaveModal} onClose={this.props.onClose} save={this.save} />}
        </Modal>
      );
    }
}

const mapStateToProps = (state) => ({
  currentUserId: state.account.myAccount.id,
  graphId: state.graphs.singleGraph.id,
});

const mapDispatchToProps = {
  updateNodesCustomFieldsRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddTabModal);
export default Container;
