import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { withRouter } from 'react-router-dom';
import Button from '../form/Button';
import File from '../form/File';
import Utils from '../../helpers/Utils';
import { convertGraphRequest } from '../../store/actions/graphs';
import ImportStep2 from './ImportStep2';
import templetaAraks from '../../assets/file/AraksTemplate.xlsx';

class DataImportModal extends Component {
  static propTypes = {
    convertGraphRequest: PropTypes.func.isRequired,
    showSelectHandler: PropTypes.func.isRequired,
    getNodesLocation: PropTypes.func.isRequired,
  }

  // eslint-disable-next-line no-unused-vars
  resetStep = memoizeOne((reset) => {
    this.setState({ step: 1 });
  })

  constructor(props) {
    super(props);
    this.state = {
      fileType: '',
      step: 1,
      loading: false,
      requestData: [],
    };
  }

  handleChange = async (path, file) => {
    const { requestData } = this.state;
    let { fileType } = this.state;
    _.set(requestData, path, file);

    const firstFile = requestData.file || {};
    if (path === 'file') {
      if (firstFile.type === 'text/csv') {
        const data = await Utils.fileToString(file);
        if (data.includes('"Name","Description","Icon",')) {
          fileType = 'nodes';
        } else {
          fileType = 'links';
        }
      } else {
        fileType = firstFile.type;
      }
    }
    this.setState({ requestData, fileType });
  }

  convert = async () => {
    const { requestData } = this.state;
    const { match: { params: { graphId = '' } } } = this.props;
    const { file } = requestData;
    toast.dismiss(this.toast);
    if (!file) {
      this.toast = toast.warn('Please Select File');
      return;
    }
    let convertType = 'xlsx';
    if (file.type === 'text/csv') {
      convertType = 'csv';
    }
    requestData.graphId = graphId;
    this.setState({ loading: true });
    const { payload: { data } } = await this.props.convertGraphRequest(convertType, requestData);
    if (data.nodes?.length) {
      this.props.getNodesLocation(data.nodes);

      this.setState({ loading: false, step: 2 });
      this.props.showSelectHandler(false);
    } else {
      this.toast = toast.error('Invalid File');
      this.setState({ loading: false });
    }
  }

  updateShowSelect = (param) => {
    if (param) this.setState({ step: 1 });
    else this.setState({ step: 2 });

    this.props.showSelectHandler(param);
  }

  render() {
    const { fileType, step, loading } = this.state;

    return (
      <>
        {step === 1 ? (
          <>
            <div className="ghFormField importFile">
              <div className="downloadTempletaAraks">
                <span>
                  Use the
                  <Button><a href={templetaAraks} download="AraksTemplate.xlsx"> Template </a></Button>
                  to import data
                </span>
              </div>
              <label className="importSelectFileLbl">Select file</label>
              <File
                onChangeFile={(file) => this.handleChange('file', file)}
                accept=".xlsx,.xls"
              />
              {['nodes', 'links'].includes(fileType) ? (
                <File
                  onChangeFile={(file) => this.handleChange('file_2', file)}
                  accept=".csv"
                />
              ) : null}
            </div>

            <div className="importButton">
              <button className="btn-classic" onClick={this.convert} loading={loading}>Next</button>
            </div>
          </>
        ) : null}
        {step === 2 ? <ImportStep2 updateShowSelect={this.updateShowSelect} /> : null}
      </>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  convertGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DataImportModal);

export default withRouter(Container);
