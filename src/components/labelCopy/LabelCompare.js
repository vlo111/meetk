import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import _ from 'lodash';
import LabelUtils from '../../helpers/LabelUtils';
import LabelCompareItem from './LabelCompareItem';
import Button from '../form/Button';
import { removeNodeCustomFieldKey, renameNodeCustomFieldKey } from '../../store/actions/graphs';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Checkbox from '../form/Checkbox';

class LabelCompare extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sources: [],
      duplications: [],
    };
  }

  handleChange = (checked, d, type) => {
    const checkedItems = this.state[type];
    const i = checkedItems.findIndex((id) => id === d.id);
    if (checked) {
      if (i === -1) {
        checkedItems.push(d);
      }
    } else {
      checkedItems.splice(i, 1);
    }
    this.setState({ [type]: checkedItems });
  }

  toggleAllSource = () => {
    const {
      compare: { sourceNodes },
    } = this.props;
    let { sources } = this.state;
    if (sourceNodes.length !== sources.length) {
      sources = _.cloneDeep(sourceNodes);
    } else {
      sources = [];
    }
    this.setState({ sources });
  }

  toggleAllDuplicate = () => {
    const {
      compare: { duplicatedNodes },
    } = this.props;
    let { duplications } = this.state;
    if (duplicatedNodes.length !== duplications.length) {
      duplications = _.cloneDeep(duplicatedNodes);
    } else {
      duplications = [];
    }
    this.setState({ duplications });
  }

  handleSubmit = () => {
    const { sources, duplications } = this.state;

    if (sources.length || duplications.length) {
      this.props.onSubmit(sources, duplications);
    }
  }

  render() {
    const {
      compare: { duplicatedNodes, sourceNodes }, onRequestClose, customFields, from, to,
    } = this.props;
    const { sources, duplications } = this.state;
    const data = LabelUtils.getData();
    return (
      <Modal
        isOpen
        className="ghModal graphCompare"
        overlayClassName="ghModalOverlay graphCompareOverlay"
        onRequestClose={onRequestClose}
      >
        <Button color="transparent" className="close" icon={<CloseSvg />} onClick={onRequestClose} />
        <div className="graphCompareContainer">
          <h2 className="title">
            Select nodes you want to keep
          </h2>
          <h4 className="subtitle">
          If you select both nodes, the nodes will be merged
          </h4>
          <div className="graphCompareData">
            <table>
              <thead>
                <tr>
                  <th>
                    <span className="caption-left">
                      {from}
                    </span>
                    {/* <span className="similar-nodes"> */}
                    {/*      Similar nodes */}
                    {/*  {` (${duplicatedNodes?.length})`} */}
                    {/*    </span> */}
                  </th>
                  <th>
                    <span className="caption-right">
                      {to}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Checkbox
                      checked={duplications.length === duplicatedNodes.length}
                      onChange={() => this.toggleAllDuplicate()}
                      label="Check All"
                      id="all_left"
                    />
                  </td>
                  <td>
                    <Checkbox
                      checked={sources.length === sourceNodes.length}
                      onChange={() => this.toggleAllSource()}
                      label="Check All"
                      id="all_right"
                    />
                  </td>
                </tr>
                {duplicatedNodes.map((nodeDuplicate) => {
                  const nodeSource = sourceNodes.find((n) => n.name === nodeDuplicate.name);
                  return (
                    <tr>
                      <td>
                        <LabelCompareItem
                          node={nodeDuplicate}
                          customFields={data.customFields}
                          checked={duplications.some((d) => d.id === nodeDuplicate.id)}
                          onChange={(checked) => this.handleChange(checked, nodeDuplicate, 'duplications')}
                        />
                      </td>
                      <td>
                        <LabelCompareItem
                          node={nodeSource}
                          customFields={customFields}
                          checked={sources.some((d) => d.id === nodeSource.id)}
                          onChange={(checked) => this.handleChange(checked, nodeSource, 'sources')}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button onClick={this.handleSubmit} className="btn-classic" type="submit">
            Save
          </button>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  removeNodeCustomFieldKey,
  renameNodeCustomFieldKey,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LabelCompare);

export default Container;
