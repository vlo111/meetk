import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { withRouter, Link } from 'react-router-dom';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import memoizeOne from 'memoize-one';
import Tooltip from 'rc-tooltip';
import { getGraphsListRequest } from '../../store/actions/graphs';
import GraphListFooter from '../../components/graphData/GraphListFooter';
import GraphDashboardSubMnus from '../../components/graphData/GraphListHeader';
import NotFound from '../../assets/images/NotFound.png';
import Utils from '../../helpers/Utils';

class SearchGraphs extends Component {
  static propTypes = {
    setLimit: PropTypes.bool,
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsListStatus: PropTypes.string.isRequired,
    graphsList: PropTypes.array.isRequired,
  };

  static defaultProps = {
    setLimit: false,
  }

  getGraphs = memoizeOne((page, searchParam) => {
    this.props.getGraphsListRequest(page, { s: searchParam });
  })

  showCardOver = (id) => {
    document.getElementsByClassName(`graph-card_${id}`)[0].style.display = 'flex';
  }

  hideCardOver = (id) => {
    document.getElementsByClassName(`graph-card_${id}`)[0].style.display = 'none';
  }

  updateGraph = (graph) => {
    const { graphsList } = this.props;

    graphsList.map((p) => {
      if (p.id === graph.id) {
        p.title = graph.title;
        p.description = graph.description;
      }
    });

    this.setState({
      graphsList,
    });
  }

  render() {
    const {
      setLimit, graphsList, headerTools, graphsListStatus,
    } = this.props;
    const { page = 1, s: searchParam } = queryString.parse(window.location.search);
    this.getGraphs(page, searchParam);
    return (
      <>
        {graphsList && !isEmpty(graphsList) && graphsList.length ? (
          <>
            {graphsList.map((graph) => (
              <article key={graph.id} className="graphs">
                <div className="top">
                  <div className="infoContent">
                    <img
                      className="avatar"
                      src={graph.user.avatar}
                      alt={graph.user.name}
                    />
                    <div className="infoWrapper">
                      <Link to={`/profile/${graph.user.id}`}>
                        <span className="author">{`${graph.user.firstName} ${graph.user.lastName}`}</span>
                      </Link>
                      <div className="info">
                        <span>{moment(graph.updatedAt).format('YYYY.MM.DD HH:mm')}</span>
                        <span className="nodesCount">{` ${graph.nodesCount} nodes `}</span>
                      </div>
                    </div>
                  </div>
                  <div className="sub-menus">
                    <GraphDashboardSubMnus updateGraph={this.updateGraph} graph={graph} />
                  </div>
                </div>
                <div>
                  <Tooltip overlay={graph.title} placement="bottom">
                    <h3>
                      {' '}
                      {Utils.substr(graph.title, 23)}
                    </h3>
                  </Tooltip>
                </div>

                <div
                  onMouseOver={() => this.showCardOver(graph.id)}
                  onMouseOut={() => this.hideCardOver(graph.id)}
                  className="graph-image"
                >

                  <div className={`buttonView graph-card_${graph.id}`}>
                    <Link className="btn-edit view" to={`/graphs/update/${graph.id}`} replace> Edit </Link>
                    <Link className="btn-preview view" to={`/graphs/view/${graph.id}`} replace> Preview</Link>
                  </div>
                  <img
                    className="thumbnail"
                    src={`${graph.thumbnail}?t=${moment(graph.updatedAt).unix()}`}
                    alt={graph.title}
                  />
                </div>
                <GraphListFooter graph={graph} />
              </article>
            ))}
          </>
        ) : ((!setLimit && graphsListStatus !== 'request' && (
        <div className="not_graphfound">
          <img src={NotFound} />
          <h3>Not Found</h3>
        </div>
        )) || null)}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  graphsListStatus: state.graphs.graphsListStatus,
  graphsList: state.graphs.graphsList,
});
const mapDispatchToProps = {
  getGraphsListRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchGraphs);

export default withRouter(Container);
