import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import { getGraphQueryRequest, getGraphQueryDataRequest } from '../../store/actions/query';
import Button from '../form/Button';
import Icon from '../form/Icon';
import Chart from '../../Chart';
import Zoom from '../Zoom';
import ChartUtils from '../../helpers/ChartUtils';
import { ReactComponent as QuerySvg } from '../../assets/images/icons/query.svg';

class QueryContextMenu extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    getGraphQueryRequest: PropTypes.func.isRequired,
    singleGraph: PropTypes.object.isRequired,
    queryData: PropTypes.array.isRequired,
  }

  initialGraph = memoizeOne(async (graphId) => {
    await this.props.getGraphQueryRequest(graphId);
  });

  showQueryData = async (id, graphId) => {
    let nodes = [];
    let links = [];
    const { payload: { data } } = await this.props.getGraphQueryDataRequest(id, graphId);
    if (data.status === 'ok') {
      nodes = data.nodes;
      links = data.links;
      links = ChartUtils.cleanLinks(links, nodes);
    }

    Chart.render({ nodes, links }, { ignoreAutoSave: true });
  }

  render() {
    const { singleGraph, queryData } = this.props;
    this.initialGraph(singleGraph.id);
    return (
      <div className="ghButton notClose">
        <Icon value={<QuerySvg />} />
        Fragment
        <span className="connections">
          <span className="connection-item">
            <span className="indicator" />
            {queryData.length}
          </span>
        </span>

        <Icon className="arrow" value="fa-angle-right" />
        <div className="contextmenu">

          {_.map(queryData, (item, index) => (
            <Button key={index} onClick={() => this.showQueryData(item.id, singleGraph.id)}>
              {item.title}
            </Button>
          ))}
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph || [],
  queryData: state.graphs.query?.queryList || [],
});

const mapDispatchToProps = {
  getGraphQueryRequest,
  getGraphQueryDataRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(QueryContextMenu);

export default Container;
