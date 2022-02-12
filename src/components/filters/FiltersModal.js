import React, { Component } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import Button from '../form/Button';
import Chart from '../../Chart';
import NodesFilter from './NodeTypesFilter';
import NodesStatusFilter from './NodesStatusFilter';
import IsolatedFilter from './IsolatedFilter';
import { resetFilter } from '../../store/actions/app';
import LinkTypesFilter from './LinkTypesFilter';
import LinkValueFilter from './LinkValueFilter';
import NodeConnectionFilter from './NodeConnectionFilter';
import { ReactComponent as CloseIcon } from '../../assets/images/icons/close.svg';
import KeywordsFilter from './KeywordsFilter';
import LabelsFilter from './LabelsFilter';
import LabelStatusFilter from './LabelStatusFilter';

import Utils from '../../helpers/Utils';
import { getGraphInfoRequest } from '../../store/actions/graphs';

class FiltersModal extends Component {
  static propTypes = {
    resetFilter: PropTypes.func.isRequired,
    getGraphInfoRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    userGraphs: PropTypes.array.isRequired,
    history: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    const nodes = Chart.getNodes();
    const links = Chart.getLinks();
    const labels = Chart.getLabels();
    this.state = {
      nodes,
      links,
      labels,
    };
  }

  componentDidMount() {
    const { match: { params: { graphId } } } = this.props;
    this.props.getGraphInfoRequest(graphId);

    Chart.event.on('render', this.handleChartRender);
    Chart.event.on('node.dragend', this.handleChartRender);
  }

  componentWillUnmount() {
    Chart.event.removeListener('render', this.handleChartRender);
    Chart.event.removeListener('node.dragend', this.handleChartRender);
    this.props.resetFilter();
  }

  handleChartRender = () => {
    // const { match: { params: { graphId } } } = this.props;
    // this.props.getGraphInfoRequest(graphId);

    // todo remove me
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      const nodes = Chart.getNodes(true);
      const links = Chart.getLinks();
      const labels = Chart.getLabels();
      this.setState({ nodes, links, labels });
    }, 500);
  }

  closeFilter = async () => {
    const { match: { params: { graphId = '', token = '' } } } = this.props;
    setTimeout(() => {
      Utils.isInEmbed()
        ? this.props.history.replace(`/graphs/update/${graphId}/${token}`)
        : this.props.history.replace(`/graphs/update/${graphId}`);
    }, 200);
  }

  render() {
    const { nodes, links, labels } = this.state;
    const { userGraphs, match: { params: { graphId = '', token = '' } } } = this.props;
    const userGraph = userGraphs && userGraphs.find((item) => item.graphId === graphId);
    const hiddenNodes = nodes.filter((d) => !d.hidden && !d.fake).length;
    const totalNodes = nodes.filter((d) => !d.fake).length;
    return (
      <Modal
        className="ghModal ghModalFilters"
        overlayClassName="ghModalOverlay ghModalFiltersOverlay"
        isOpen
      >
        <div className="filter-container">
          <div className="filterHeader">
            {(!userGraph || userGraph.role === 'admin' || userGraph.role === 'edit') && (
            <>
              <Link
                to={Utils.isInEmbed() ? `/graphs/embed/${graphId}/${token}` : `/graphs/update/${graphId}`}
                replace
              >
                <Button className="close" icon={<CloseIcon />} onClick={this.closeFilter} />
              </Link>
            </>
            )}
            <h3 className="title">Filter</h3>
            <div className="row resetAll">
              <div>
                <Button className="btn-classic alt resetButton" onClick={this.props.resetFilter}>RESET ALL</Button>
              </div>
            </div>
          </div>
          <span
            className="nodeCount"
          >
            {`Showing ${hiddenNodes} ${hiddenNodes < 2 ? 'node' : 'nodes'} out of ${totalNodes}`}
          </span>

          <IsolatedFilter />

          <NodesFilter nodes={nodes} />

          <NodesStatusFilter nodes={nodes} />

          <LinkTypesFilter links={links} />

          <LabelsFilter labels={labels} nodes={nodes} />

          <LabelStatusFilter labels={labels} nodes={nodes} />

          <LinkValueFilter links={links} />

          <KeywordsFilter nodes={nodes} />

          <NodeConnectionFilter links={links} nodes={nodes} />

        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  userGraphs: state.shareGraphs.userGraphs,
});

const mapDispatchToProps = {
  resetFilter,
  getGraphInfoRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FiltersModal);

export default withRouter(Container);
