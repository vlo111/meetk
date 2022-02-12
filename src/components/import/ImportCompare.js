import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import GraphCompareList from '../graphCompare/GraphCompareList';
import { setActiveButton } from '../../store/actions/app';
import { clearSingleGraph, getSingleGraphRequest, setGraphCustomFields } from '../../store/actions/graphs';
import { userGraphRequest } from '../../store/actions/shareGraphs';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';
import Button from '../form/Button';

class ImportCompare extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedNodes1: _.cloneDeep(Chart.getNodes()),
      selectedNodes2: _.cloneDeep(this.props.importData.nodes),
    };
  }

  handleChange = (d, checked, pos) => {
    const key = pos === 1 ? 'selectedNodes1' : 'selectedNodes2';
    const data = this.state[key];
    const i = data.findIndex((n) => n.id === d.id);
    if (checked) {
      if (i === -1) {
        data.push(d);
      }
    } else if (i > -1) {
      data.splice(i, 1);
    }
    this.setState({ [key]: data });
  }

  merge = () => {
    const { selectedNodes1, selectedNodes2 } = this.state;
    const { importData: singleGraph2 } = this.props;
    const singleGraph = Chart.getData();

    const {
      nodes, links, labels,
    } = ChartUtils.margeGraphs(singleGraph, singleGraph2, selectedNodes1, selectedNodes2);
    Chart.render({
      nodes, links, labels,
    });
    this.props.setActiveButton('create');
  }

  render() {
    const { selectedNodes1, selectedNodes2 } = this.state;
    const { importData: singleGraph2, customFields } = this.props;
    const singleGraph = Chart.getData();
    singleGraph.customFields = customFields;
    singleGraph.title = this.props.title;
    singleGraph2.title = 'Incoming data';
    const graph1CompareNodes = _.intersectionBy(singleGraph.nodes, singleGraph2.nodes, 'name');
    const selected = [...selectedNodes1, ...selectedNodes2];
    return (
      <div className="compareWrapper">
        <div className="compareListWrapper">
          <GraphCompareList
            singleGraph1={{ ...singleGraph, nodes: graph1CompareNodes }}
            singleGraph2={singleGraph2}
            onChange={this.handleChange}
            selected={selected}
            scrollContainer=".ghImportModal"
            importGraph
          />
        </div>
        <div className="mergeButton">
          <button className="btn-classic" onClick={this.merge}>Merge</button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  customFields: state.graphs.singleGraph.customFields || {},
  title: state.graphs.singleGraph.title || {},
});
const mapDispatchToProps = {
  setGraphCustomFields,
  setActiveButton,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImportCompare);

export default Container;
