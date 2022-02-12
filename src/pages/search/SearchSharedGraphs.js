import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { Link, withRouter } from 'react-router-dom';
import moment from 'moment';
import memoizeOne from 'memoize-one';
import Tooltip from 'rc-tooltip';
import { searchGraphsListRequest } from '../../store/actions/shareGraphs';
import GraphListFooter from '../../components/graphData/GraphListFooter';
import GraphDashboardSubMnus from '../../components/graphData/GraphListHeader';
import NotFound from '../../assets/images/NotFound.png';
import Utils from '../../helpers/Utils';

class SearchSharedGraphs extends Component {
  static propTypes = {
    setLimit: PropTypes.bool,
    searchGraphsListRequest: PropTypes.func.isRequired,
    shareGraphsList: PropTypes.array.isRequired,
    shareGraphsListStatus: PropTypes.string.isRequired,
  };

  static defaultProps = {
    setLimit: false,
  }

  getGraphs = memoizeOne((page, searchParam) => {
    this.props.searchGraphsListRequest(page, { s: searchParam });
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
    const { setLimit, shareGraphsList, shareGraphsListStatus } = this.props;
    const { page = 1, s: searchParam } = queryString.parse(window.location.search);
    this.getGraphs(page, searchParam);
    return (
      <>
        {shareGraphsList && shareGraphsList.length ? (
          <>
            {shareGraphsList.slice(0, 5).map((shGraph) => (
              <article key={shGraph.graph.id} className="graphs">
                <div className="top">
                  <div className="infoContent">
                    <img
                      className="avatar"
                      src={shGraph.graph.user.avatar}
                      alt={shGraph.graph.user.name}
                    />
                    <div className="infoWrapper">
                      <Link to={`/profile/${shGraph.graph.user.id}`}>
                        <span className="author">
                          {`${shGraph.graph.user.firstName} ${shGraph.graph.user.lastName}`}
                        </span>
                      </Link>
                      <div className="info">
                        <span>{moment(shGraph.graph.updatedAt).format('YYYY.MM.DD HH:mm')}</span>
                        <span className="nodesCount">{` ${shGraph.graph.nodesCount} nodes `}</span>
                      </div>
                    </div>
                  </div>
                  <div className="sub-menus">
                    <GraphDashboardSubMnus
                      updateGraph={this.updateGraph}
                      shGraph={shareGraphsList}
                      headerTools="shared"
                    />
                  </div>
                </div>
                <div>
                  <Tooltip overlay={shGraph.graph.title} placement="bottom">
                    <h3 className="sharGraphSearch">
                      {' '}
                      {Utils.substr(shGraph.graph.title, 25)}
                    </h3>
                  </Tooltip>
                </div>

                <div
                  onMouseOver={() => this.showCardOver(shGraph.graph.id)}
                  onMouseOut={() => this.hideCardOver(shGraph.graph.id)}
                  className="graph-image"
                >

                  <div className={`buttonView graph-card_${shGraph.graph.id}`}>
                    <Link className="btn-edit view" to={`/graphs/update/${shGraph.graph.id}`} replace> Edit </Link>
                    <Link className="btn-preview view" to={`/graphs/view/${shGraph.graph.id}`} replace> Preview</Link>
                  </div>
                  <img
                    className="thumbnail"
                    src={`${shGraph.graph.thumbnail}?t=${moment(shGraph.graph.updatedAt).unix()}`}
                    alt={shGraph.graph.title}
                  />
                </div>
                <GraphListFooter graph={shGraph.graph} />

              </article>
            ))}

          </>
        ) : ((!setLimit && shareGraphsListStatus !== 'request' && (
        <div className="not_graphfound">
          <img src={NotFound} alt="" />
          <h3>Not Found</h3>
        </div>
        )) || null)}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  shareGraphsListStatus: state.shareGraphs.shareGraphsListStatus,
  shareGraphsList: state.shareGraphs.shareGraphsList,
});
const mapDispatchToProps = {
  searchGraphsListRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchSharedGraphs);

export default withRouter(Container);
