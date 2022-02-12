import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip';
import GraphListFooter from './GraphListFooter';
import GraphDashboardSubMnus from './GraphListHeader';
import Utils from '../../helpers/Utils';

class GraphListItem extends Component {
  static propTypes = {
    graphs: PropTypes.object.isRequired,
    currentUserId: PropTypes.string.isRequired,
    headerTools: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
  }

  updateGraph = (graph) => {
    let { graphs } = this.props;
    graphs = graphs.forEach((p) => {
      if (p.id === graph.id) {
        p.title = graph.title;
        p.description = graph.description;
        p.thumbnail = `${graph.thumbnail}?t=${moment(graph.updatedAt).unix()}`;
        p.publicState = graph.publicState;
      }
    });

    this.setState([graphs]);
  }

  render() {
    const {
      graphs, headerTools, mode, currentUserId,
    } = this.props;
    if (!graphs?.length) return null;
    return (
      graphs
        ? graphs.map((graph) => (
          <article className="graphsItem" key={graph.id}>
            <div className="public_context">
              {((headerTools === 'home' || headerTools === 'template') && graph.publicState) && (
                <div className="public_icon">
                  <i className="fa fa-globe" />
                </div>
              )}
              <Tooltip overlay={graph.title} placement="bottom" className="tooltipList">
                <h3>
                  {' '}
                  {Utils.substr(graph.title, 30)}
                </h3>
              </Tooltip>
              {(mode === 'card') ? (
                <p>
                  {' '}
                  {graph.description}
                </p>
              ) : ''}
            </div>
            <div className="top">
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
            <GraphListFooter graph={graph} />
            {(graph.userId !== currentUserId && headerTools === 'public') ? (
              <div className="buttonHidden">
                <Link className="btn-preview view" to={`/graphs/view/${graph.id}?public=1`} replace> Preview</Link>
              </div>
            )
              : (
                <div className="buttonHidden">
                  {(graph?.share?.role !== 'view') && <Link className="btn-edit view" to={`/graphs/update/${graph.id}`} replace> Edit </Link>}
                  <Link className="btn-preview view" to={`/graphs/view/${graph.id}`} replace> Preview</Link>
                </div>
              )}
            <div className="unlucky" />
            <div className="sub-menus">
              <GraphDashboardSubMnus updateGraph={this.updateGraph} graph={graph} headerTools={headerTools} />
            </div>

          </article>
        ))
        : <></>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUserId: state.account.myAccount.id,
});

const Container = connect(mapStateToProps)(GraphListItem);
export default withRouter(Container);
