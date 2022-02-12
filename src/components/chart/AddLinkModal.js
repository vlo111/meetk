import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import PropTypes from 'prop-types';
import Select from '../form/Select';
import Input from '../form/Input';
import Button from '../form/Button';
import Chart from '../../Chart';
import { DASH_TYPES, TYPE_STATUS } from '../../data/link';
import Validate from '../../helpers/Validate';
import SvgLine from '../SvgLine';
import ContextMenu from '../contextMenu/ContextMenu';
import Utils from '../../helpers/Utils';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { createLinksRequest, updateLinksRequest } from '../../store/actions/links';
import ChartUtils from '../../helpers/ChartUtils';
import Checkbox from '../form/Checkbox';

class AddLinkModal extends Component {
  static propTypes = {
    currentUserId: PropTypes.string.isRequired,
  }

  getTypes = memoizeOne((links) => {
    const types = links.filter((d) => d.type)
      .map((d) => ({
        value: d.type,
        label: d.type,
      }));

    return _.uniqBy(types, 'value');
  }, _.isEqual)

  constructor(props) {
    super(props);
    this.state = {
      linkData: {},
      show: false,
      index: null,
      errors: {},
    };
  }

  componentDidMount() {
    Chart.event.on('link.new', this.handleAddNewLine);
    Chart.event.on('link.dblclick', this.handleLineEdit);
    ContextMenu.event.on('link.edit', this.handleLineEdit);
  }

  handleAddNewLine = (ev, d) => {
    if (Chart.isAutoPosition) { Chart.isAutoPosition = false; }
    const { source, target } = d;
    // const { linkData: { type } } = this.state;
    const links = Chart.getLinks();
    const types = this.getTypes(links);
    const linkData = {
      source,
      target,
      value: 2,
      direction: false,
      type: types[0]?.value || null,
      linkType: 'a',
      description: '',
      status: 'approved',
    };
    this.setState({
      linkData, show: true, index: null, errors: {},
    });
  }

  handleLineEdit = (ev, d) => {
    if (Chart.isAutoPosition) { Chart.isAutoPosition = false; }
    const linkData = Chart.getLinks().find((l) => l.index === d.index);
    this.setState({
      linkData: { ...linkData }, show: true, index: linkData.index, errors: {},
    });
  }

  closeModal = () => {
    this.setState({ show: false });
  }

  addLink = async (ev) => {
    ev.preventDefault();
    const { currentUserId, graphId } = this.props;
    const { linkData, index } = this.state;
    const isUpdate = !_.isNull(index);
    let links = Chart.getLinks();
    const errors = {};
    [errors.type, linkData.type] = Validate.linkType(linkData.type, linkData);
    [, linkData.value] = Validate.linkValue(linkData.value);

    if (!Validate.hasError(errors)) {
      linkData.updatedAt = moment().unix();
      linkData.updatedUser = currentUserId;
      if (isUpdate) {
        linkData.update = true;
        links = links.map((d) => {
          if (d.index === linkData.index) {
            d.sx = undefined;

            if (d.type !== linkData.type) {
              linkData.color = '';
              d.color = ChartUtils.linkColor(linkData);
            }

            return { ...linkData };
          }
          return d;
        });
        // this.props.updateLinksRequest(graphId, [linkData]);
      } else {
        linkData.create = true;

        linkData.createdAt = moment().unix();
        linkData.createdUser = currentUserId;
        linkData.id = linkData.id || ChartUtils.uniqueId(links);
        links.push({ ...linkData });

        // this.props.createLinksRequest(graphId, [linkData]);
      }
      this._dataLinks = null;

      await this.setState({ show: false });

      let checkLinkCurve;

      if (isUpdate) {
        checkLinkCurve = 'updateCurve';
      } else if (linkData.linkType === 'a1') {
        checkLinkCurve = 'createCurve';
      } else {
        checkLinkCurve = '';
      }

      Chart.render({ links: [...links] }, checkLinkCurve);
      Chart.event.emit('link.save', linkData);
    }
    this.setState({ errors });
  }

  handleChange = (path, value) => {
    const { linkData, errors } = this.state;
    _.set(linkData, path, value);
    _.remove(errors, path);
    this.setState({ linkData, errors });
  }

  render() {
    const {
      linkData, index, errors, show,
    } = this.state;
    if (!show) {
      return null;
    }
    const links = Chart.getLinks();
    const types = this.getTypes(links);
    const isUpdate = !_.isNull(index);

    Utils.orderGroup(types, linkData.type);

    let dashTypes;

    const res = links.filter((p) => {
      if (((p.source === linkData.source || p.source === linkData.target)
        && (p.target === linkData.source || p.target === linkData.target)) && p.sx) {
        return p;
      }
    });

    if (res.length > 0) {
      dashTypes = Object.keys(DASH_TYPES);
      dashTypes.splice(1, 1);
    } else dashTypes = Object.keys(DASH_TYPES);

    return (
      <Modal
        className="ghModal"
        overlayClassName="ghModalOverlay addLink"
        isOpen
        onRequestClose={this.closeModal}
      >
        <div className="containerModal">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeModal} />
          <form className="form" onSubmit={this.addLink}>
            <h2>
              {isUpdate ? 'Edit Link' : 'Add new Link'}
            </h2>

            <Select
              label="Relation Type"
              containerClassName="relType"
              isSearchable
              portal
              placeholder=""
              value={[
                types.find((t) => t.value === linkData.type) || {
                  value: linkData.type,
                  label: linkData.type,
                },
              ]}
              error={errors.type}
              onChange={(v) => this.handleChange('type', v?.value)}
              options={types}
              isCreatable
            />

            <Select
              label="Link Type"
              value={[linkData.linkType]}
              error={errors.linkType}
              onChange={(v) => this.handleChange('linkType', v)}
              options={dashTypes}
              portal
              containerClassName="lineTypeSelect"
              getOptionValue={(v) => v}
              getOptionLabel={(v) => <SvgLine type={v} />}
            />

            <div className="number-wrapper">
              <Input
                label="Value"
                id="value"
                value={linkData.value}
                error={errors.value}
                type="text"
                autoComplete="off"
                isNumber
                onChangeText={(v) => this.handleChange('value', v)}
              />
              <Select
                label="Status"
                portal
                containerClassName="status"
                options={TYPE_STATUS}
                value={TYPE_STATUS.filter((t) => t.value === linkData.status)}
                error={errors.status}
                onChange={(v) => this.handleChange('status', v?.value || '')}
              />
            </div>
            <div className="show-direction">
              <Checkbox
                label="Show Direction"
                checked={linkData.direction}
                onChange={() => this.handleChange('direction', !linkData.direction)}
              />
            </div>
            <div className="buttons">
              <button className="btn-delete" onClick={this.closeModal}>
                Cancel
              </button>
              <button className="btn-classic" type="submit">
                {isUpdate ? 'Save' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUserId: state.account.myAccount.id,
  graphId: state.graphs.singleGraph.id,
});
const mapDispatchToProps = {
  createLinksRequest,
  updateLinksRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddLinkModal);

export default Container;
