import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { withRouter } from 'react-router-dom';
import Button from '../form/Button';
import Utils from '../../helpers/Utils';
import { convertGraphRequest } from '../../store/actions/graphs';
import Input from '../form/Input';
import ImportStep2 from './ImportStep2';

class ImportGoogle extends Component {
  static propTypes = {
    convertGraphRequest: PropTypes.func.isRequired,
    importData: PropTypes.object.isRequired,
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
    requestData.graphId = graphId;
    this.setState({ loading: true });
    const { payload: { data } } = await this.props.convertGraphRequest('google-sheets', requestData);
    if (data.nodes?.length) {
      this.props.getNodesLocation(data.nodes);
      this.setState({ loading: false, step: 2 });
      this.props.showSelectHandler(false);
    } else {
      this.toast = toast.error(data.errors?.url || 'something went wrong');
      this.setState({ loading: false });
    }
  }

  handleChange = async (path, value) => {
    const { requestData } = this.state;
    _.set(requestData, path, value);
    this.setState({ requestData });
  }

  updateShowSelect = (param) => {
    if (param) this.setState({ step: 1 });
    else this.setState({ step: 2 });

    this.props.showSelectHandler(param);
  }

  render() {
    const { importData } = this.props;
    const { step, loading } = this.state;

    return (
      <>
        {step === 1 ? (
          <>
            <div className="ghFormField importFile">
              <Input
                containerClassName="importSelectFileLbl"
                value={importData.url}
                onChangeText={(value) => this.handleChange('url', value)}
                type="url"
                name="google_sheets_url"
                label="Google Sheets URL"
                placeholder="Google Sheets URL"
              />
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

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  importData: state.graphs.importData,
});
const mapDispatchToProps = {
  convertGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImportGoogle);

export default withRouter(Container);
