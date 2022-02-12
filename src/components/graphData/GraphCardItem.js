import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip';
import { connect } from 'react-redux';
import GraphListFooter from './GraphListFooter';
import GraphDashboardSubMnus from './GraphListHeader';
import Button from '../form/Button';
import Utils from '../../helpers/Utils';
import { ReactComponent as ViewPassSvg } from '../../assets/images/icons/viewGraph.svg';

class GraphCardItem extends Component {
  static propTypes = {
    graphs: PropTypes.object.isRequired,
    headerTools: PropTypes.string.isRequired,
    currentUserId: PropTypes.string.isRequired,
  }

  startGraph = () => {
    window.location.href = '/graphs/create';
  }

  showCardOver = (id) => {
    document.getElementsByClassName(`graph-card_${id}`)[0].style.display = 'flex';
  }

  hideCardOver = (id) => {
    document.getElementsByClassName(`graph-card_${id}`)[0].style.display = 'none';
  }

  updateGraph = async (graph) => {
    let { graphs } = this.props;
    graphs = graphs.map((p) => {
      if (p.id === graph.id) {
        p.title = graph.title;
        p.description = graph.description;
        p.thumbnail = `${graph.thumbnail}?t=${moment(graph.updatedAt).unix()}`;
        p.publicState = graph.publicState;
      }
      return p;
    });

    this.setState([graphs]);
  }

  outOver = () => {
    const graphImagesElement = document.querySelectorAll('.buttonView');

    for (let index = 0; index < graphImagesElement.length; index++) {
      const element = graphImagesElement[index];

      element.style.display = 'none';
    }
  }

  render() {
    const { headerTools, graphs, currentUserId } = this.props;
    if (!graphs?.length) return null;

    return (
      <>
        {graphs.map((graph) => (
          <article className="graphs" key={graph.id}>
            <div
              className="graph-image"
              onMouseOver={() => this.showCardOver(graph.id)}
              onMouseOut={() => this.hideCardOver(graph.id)}
            >
              <div className={`buttonView graph-card_${graph.id}`}>
                <div className="hover_header">
                  <Button icon={<ViewPassSvg />} className="view_icon">
                    <span className="graphListFooter__count">{graph?.views || 0}</span>
                  </Button>
                  <div className="sub-menus">
                    <GraphDashboardSubMnus outOver={this.outOver} updateGraph={this.updateGraph} graph={graph} headerTools={headerTools} />
                  </div>
                </div>
                {(graph.userId !== currentUserId && headerTools === 'public') ? (
                  <div>
                    <Link className="btn-preview view" to={`/graphs/view/${graph.id}`} replace>Preview</Link>
                  </div>
                )
                  : (
                    <div>
                      {(graph?.share?.role !== 'view') && <Link className="btn-edit view" to={`/graphs/update/${graph.id}`} replace> Edit </Link>}
                      <Link className="btn-preview view" to={`/graphs/view/${graph.id}`} replace> Preview</Link>
                    </div>
                  )}
              </div>

              <img
                className="thumbnail"
                src={`${graph.thumbnail}?t=${moment(graph.updatedAt).unix()}`}
                alt={graph.title}
              />

              {((headerTools === 'home' || headerTools === 'template') && graph.publicState) && (
              <div className="public_wrapper">
                <div className="public_icon">
                  <i className="fa fa-globe" />
                </div>
              </div>
              )}
            </div>
            <div className="graphCardFutter">
              <div>
                <Tooltip overlay={graph.title} placement="bottom">
                  <h3>
                    {' '}
                    {Utils.substr(graph.title, 18)}
                  </h3>
                </Tooltip>
              </div>
              <GraphListFooter graph={graph} />
            </div>
          </article>
        ))}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUserId: state.account.myAccount.id,
});

const Container = connect(mapStateToProps)(GraphCardItem);

export default withRouter(Container);
