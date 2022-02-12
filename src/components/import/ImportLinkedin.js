import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import ReactDOMServer from 'react-dom/server';
import File from '../form/File';
import Button from '../form/Button';
import { convertNodeRequest } from '../../store/actions/graphs';
import { setActiveButton, toggleNodeModal } from '../../store/actions/app';
import ChartUtils from '../../helpers/ChartUtils';
import ImportLinkedinCustomField from './ImportLinkedinCustomField';
import Utils from '../../helpers/Utils';

class DataImportModal extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    convertNodeRequest: PropTypes.func.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      requestData: {},
    };
  }

  handleChange = async (path, file) => {
    const { requestData } = this.state;
    _.set(requestData, path, file);
    this.setState({ requestData });
  }

  convert = async () => {
    const { requestData } = this.state;
    this.setState({ loading: true });
    const { payload: { data } } = await this.props.convertNodeRequest('linkedin-pdf', requestData);
    if (data?.status === 'ok') {
      this.props.setActiveButton('create');
    } else {
      this.toast = toast.error(data?.message || 'something went wrong');
      return;
    }
    const { node = {} } = data;
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    const { x: fx, y: fy } = ChartUtils.calcScaledPosition(x, y);

    await Promise.all(node.education.map(async (p) => {
      const url = Utils.wikiContentUrlByName(p.institution);

      const wikiData = await Utils.getWikiContent(url);

      if (wikiData) {
        p.wikipedia = true;
      } else p.wikipedia = false;
      return p;
    }));

    const customFields = [];

    const experience = ReactDOMServer.renderToString(<ImportLinkedinCustomField type="experience" data={node} />);
    if (experience) {
      customFields.push({
        name: 'Experience',
        subtitle: '',
        value: experience,
      });
    }

    const education = ReactDOMServer.renderToString(<ImportLinkedinCustomField type="education" data={node} />);
    if (education) {
      customFields.push({
        name: 'Education',
        subtitle: '',
        value: education,
      });
    }

    const skills = ReactDOMServer.renderToString(<ImportLinkedinCustomField type="skills" data={node} />);
    if (skills) {
      customFields.push({
        name: 'Skills',
        subtitle: '',
        value: skills,
      });
    }
    this.props.toggleNodeModal({
      fx,
      fy,
      name: node.name,
      type: node.type,
      description: node.summary,
      customFields,
    });
    this.setState({ loading: false });
  }

  render() {
    const { loading } = this.state;

    return (
      <>
        <div className="ghFormField importFile">
          <label className="importSelectFileLbl">Select file</label>
          <File
            onChangeFile={(file) => this.handleChange('file', file)}
            accept=".pdf"
          />
        </div>
        <div className="importButton">
          <button className="btn-classic" onClick={this.convert} loading={loading}>Import</button>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = {
  convertNodeRequest,
  setActiveButton,
  toggleNodeModal,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DataImportModal);

export default Container;
