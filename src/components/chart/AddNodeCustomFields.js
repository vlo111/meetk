import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import memoizeOne from 'memoize-one';
import Input from '../form/Input';
import { addNodeCustomFieldKey, removeNodeCustomFieldKey } from '../../store/actions/graphs';
import CustomFields from '../../helpers/CustomFields';
import Button from '../form/Button';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Editor from '../form/Editor';

class AddNodeCustomFields extends Component {
  static propTypes = {
    data: PropTypes.object,
    node: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  static defaultProps = {
    data: {},
  }

  initNewCustomFieldsKeys = memoizeOne((data) => {
    const newCustomFieldsKeys = Object.keys(_.pickBy(data, _.identity));
    this.setState({ newCustomFieldsKeys });
  }, _.isEqual)

  constructor(props) {
    super(props);
    this.state = {
      newFieldName: '',
      showNewField: false,
      newCustomFieldsKeys: [],
    };
  }

  handleChange = (path, value) => {
    const { data } = this.props;
    _.set(data, path, value);
    this.props.onChange(data);
  }

  handleNameChange = (ev) => {
    this.setState({ newFieldName: ev.target.value });
  }

  addNodeCustomFieldKey = () => {
    const { newFieldName } = this.state;
    const { node } = this.props;
    this.setState({ showNewField: false, newFieldName: '' });
    if (newFieldName) {
      this.props.addNodeCustomFieldKey(node.type, newFieldName);
    }
  }

  toggleNewField = () => {
    const { showNewField } = this.state;
    this.setState({ showNewField: !showNewField });
  }

  removeCustomField = (key) => {
    const { newCustomFieldsKeys } = this.state;
    const { node, data } = this.props;
    delete data[key];
    this.setState({ newCustomFieldsKeys: newCustomFieldsKeys.filter((f) => f !== key) });
    this.props.removeNodeCustomFieldKey(node.type, key);
    this.props.onChange(data);
  }

  render() {
    const { newFieldName, showNewField, newCustomFieldsKeys } = this.state;
    const { data, node, customFields } = this.props;
    this.initNewCustomFieldsKeys(data);
    const customFieldKey = _.uniq([...CustomFields.getKeys(customFields, node.type), ...newCustomFieldsKeys]);
    return (
      <div>
        {customFieldKey.map((key) => (
          <div key={key} className="customFieldRow">
            <Editor
              label={key}
              value={data[key] || ''}
              buttons={[]}
              minHeight={30}
              node={node}
              onChange={(v) => this.handleChange(key, v)}
            />
            <Button
              className="close"
              icon={<CloseSvg style={{ width: 10 }} />}
              onClick={() => this.removeCustomField(key)}
            />
          </div>
        ))}
        {showNewField ? (
          <Input disabled containerClassName="createCustomField" limit={250}>
            <input
              type="text"
              className="inputName"
              placeholder="Name"
              value={newFieldName}
              autoFocus
              onKeyDown={(ev) => {
                if (ev.keyCode === 13) {
                  ev.preventDefault();
                  ev.target.blur();
                }
              }}
              onBlur={this.addNodeCustomFieldKey}
              onChange={this.handleNameChange}
            />
          </Input>
        ) : null}
        {customFieldKey.length < 6 ? (
          <Button onClick={this.toggleNewField}>
            Add
          </Button>
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  customFields: state.graphs.singleGraph.customFields || {},
});
const mapDispatchToProps = {
  addNodeCustomFieldKey,
  removeNodeCustomFieldKey,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddNodeCustomFields);

export default Container;
