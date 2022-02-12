import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Button from '../form/Button';
import Chart from '../../Chart';
import { setActiveButton } from '../../store/actions/app';
import {
  convertGraphRequest,
  setGraphCustomFields,
  updateSingleGraph,
} from '../../store/actions/graphs';
import ChartUtils from '../../helpers/ChartUtils';
import ImportCompare from './ImportCompare';

class ImportStep2 extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    setGraphCustomFields: PropTypes.func.isRequired,
    updateSingleGraph: PropTypes.func.isRequired,
    importData: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      compare: false,
    };
  }

  import = async () => {
    const { importData } = this.props;
    const singleGraph = _.cloneDeep(Chart.getData());

    const duplications = _.intersectionBy(singleGraph.nodes, importData.nodes, 'name');
    if (duplications.length) {
      this.setState({ compare: true });
      return;
    }
    const {
      nodes, links, labels,
    } = ChartUtils.margeGraphs(singleGraph, importData);

    Chart.render({
      nodes, links, labels,
    });
    ChartUtils.resetColors();

    // this.props.updateNodesCustomFieldsRequest(singleGraph.id, nodes.map(d => ({
    //   id: d.id,
    //   customFields: d.customFields,
    // })));

    // this.props.updateSingleGraph({
    //   nodes,
    //   links,
    //   labels,
    //   title,
    //   description,
    // });

    this.props.setActiveButton('create');
    this.props.updateShowSelect(true);

    // const {
    //   importData: {
    //     nodes = [], links = [], labels = [], customFields = {},
    //   },
    //   singleGraph: { title, description },
    // } = this.props;
    // ChartUtils.resetColors();
    // this.props.updateSingleGraph({
    //   nodes,
    //   links,
    //   labels,
    //   title,
    //   description,
    //   embedLabels: [],
    // });
    // Chart.render({
    //   nodes, links, labels, embedLabels: [],
    // });
    // this.props.setGraphCustomFields(customFields);
    // this.props.setActiveButton('create');
    // this.props.updateShowSelect(true);
  }

  back = () => {
    this.props.updateShowSelect(true);
  }

  render() {
    const { compare } = this.state;
    const { importData } = this.props;
    if (compare) {
      return <ImportCompare importData={importData} />;
    }
    return (
      <>
        <div className="importResult">
          <div className="importNode">
            <strong>Nodes: </strong>
            {importData.nodes?.length || 0}
          </div>
          <div className="importLink">
            <strong>Links: </strong>
            {importData.links?.length || 0}
          </div>
          {importData.warnings?.length ? (
            <div className="importWrong">
              <span>Wrong: </span>
              {importData.warnings?.length}
            </div>
          ) : null}
        </div>
        <div className="buttons prev-next">
          <Button className="btn-delete" onClick={this.back}>
            Prev
          </Button>
          <Button className="btn-classic" onClick={this.import}>Import</Button>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  importData: state.graphs.importData,
  singleGraph: state.graphs.singleGraph,
  embedLabels: state.graphs.embedLabels,
});

const mapDispatchToProps = {
  setActiveButton,
  convertGraphRequest,
  setGraphCustomFields,
  updateSingleGraph,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImportStep2);

export default Container;
