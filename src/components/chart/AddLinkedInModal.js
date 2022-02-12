import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { toast } from 'react-toastify';
import ReactDOMServer from 'react-dom/server';
import { setActiveButton, toggleNodeModal } from '../../store/actions/app';
import File from '../form/File';
import Button from '../form/Button';
import ChartUtils from '../../helpers/ChartUtils';
import Utils from '../../helpers/Utils';
import ImportLinkedinCustomField from '../import/ImportLinkedinCustomField';
import { convertNodeRequest } from '../../store/actions/graphs';
import CloseImg from '../../assets/images/icons/close.png';

class AddLinkedInModal extends Component {
    static propTypes = {
      setActiveButton: PropTypes.func.isRequired,
      convertNodeRequest: PropTypes.func.isRequired,
      toggleNodeModal: PropTypes.func.isRequired,
    }

    constructor(props) {
      super(props);
      this.state = {
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

    closeModal = () => {
      this.props.setActiveButton('create');
    }

    render() {
      const { activeButton } = this.props;

      if (activeButton !== 'linkedIn') return null;

      return (
        <Modal
          className="ghModal"
          overlayClassName="ghModalOverlay linkedinModal"
          isOpen
          onRequestClose={this.closeModal}
        >
          <div className="import-popup">
            <img onClick={this.closeModal} className="close" src={CloseImg} />
            <div className="import-title">
              <p>Linkedin</p>
            </div>
            <File
              onChangeFile={(file) => this.handleChange('file', file)}
              accept=".pdf"
            />
            <div className="import-btn">
              <Button onClick={this.convert} className="btn-classic">Import</Button>
            </div>
          </div>
        </Modal>
      );
    }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
});

const mapDispatchToProps = {
  convertNodeRequest,
  setActiveButton,
  toggleNodeModal,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddLinkedInModal);

export default Container;
