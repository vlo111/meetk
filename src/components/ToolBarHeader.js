import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Switch from 'rc-switch';
import Button from './form/Button';
import { setActiveButton } from '../store/actions/app';
import { ReactComponent as UndoSvg } from '../assets/images/icons/undo.svg';
import { socketMousePositionTracker } from '../store/actions/socket';
import AccountDropDown from './account/AccountDropDown';
import Legend from './Legend';
import GraphSettings from './graphData/GraphSettings';
import { ReactComponent as CommentSvg } from '../assets/images/icons/commentGraph.svg';
import CommentModal from './CommentModal';
import Notification from './Notification';
import { KEY_CODES } from '../data/keyCodes';
import ContributorsModal from './Contributors';
import Helps from './Helps/index';
import Chart from '../Chart';
import ChartUtils from '../helpers/ChartUtils';
import { ReactComponent as GraphSvg } from '../assets/images/icons/graph.svg';
import Utils from '../helpers/Utils';
import SearchModal from './search/SearchModal';

class ToolBarHeader extends Component {
  static propTypes = {
    history: PropTypes.func.isRequired,
    socketMousePositionTracker: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    currentUserId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      mouseTracker: false,
      commentModal: false,
      showDropDown: false,

    };
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  toggleDropDown = () => {
    const { showDropDown } = this.state;

    this.setState({ showDropDown: !showDropDown });
  }

  openCommentModal = (open) => {
    this.setState({ commentModal: open });
  }

  handleCursor = (tracker) => {
    const {
      currentUserId,
      match: {
        params: { graphId },
      },
    } = this.props;
    this.setState({ mouseTracker: !tracker });
    Chart.cursorTrackerListRemove();
    this.props.socketMousePositionTracker(graphId, !tracker, currentUserId);
  };

  handleKeyDown = (ev) => {
    if (ev.chartEvent && !ev.ctrlPress && ev.shiftKey && !ev.altKey) {
      if (ev.keyCode === KEY_CODES.search_code) {
        ChartUtils.keyEvent(ev);
        ev.preventDefault();
        this.handleClick('search');
      }

      if (ev.keyCode === KEY_CODES.graphScience_code) {
        ChartUtils.keyEvent(ev);
        ev.preventDefault();
        this.handleClick('sciGraph');
      }

      if (ev.keyCode === KEY_CODES.media_code) {
        ChartUtils.keyEvent(ev);
        ev.preventDefault();
        this.handleClick('media');
      }
    }
  };

  render() {
    const {
      singleGraph, currentUserId, location: { pathname }, match: { params: { graphId } },
    } = this.props;
    const { mouseTracker, commentModal, showDropDown } = this.state;
    const singleGraphUser = singleGraph.user;
    this.props.socketMousePositionTracker(graphId, mouseTracker, currentUserId);

    const updateLocation = pathname.startsWith('/graphs/update/');

    return (
      <>
        <header id={!updateLocation ? 'header-create' : 'header-on-graph-name'}>
          <div>
            <GraphSvg className="headerSvg" />
          </div>

          <div className="grapSanme">
            {' '}
              <span className="graphsName">{singleGraph.title}</span>
            {!updateLocation && (
            <span className="graphNames">
              {Utils.substr(singleGraph.title, 16)}
            </span>
          )} 
          </div>

          <div className="commentsHeader">
            <div className="commentHeader">
              <Button
                icon={<CommentSvg />}
                className="transparent footer-icon"
                onClick={() => this.openCommentModal(true)}
                title="Comments"
              />
            </div>
          </div>
          <div className="notify_container">
            <div className="notificationHeader">
              <Notification />
            </div>
          </div>
          <div className="account">
            <div className="signOut">
              <AccountDropDown />
            </div>
          </div>
          <div className="notify_container">
            <div className="notificationHeader">
              <Notification />
            </div>
          </div>
        </header>
        <header id={!updateLocation ? 'header-on-view-graph' : 'header-on-graph'}>
          <ul className="container">
            <li className="logo">
              <Link to="/" className="logoWrapper">
                <UndoSvg className="orange" />
                <span className="undoText">My schemas</span>
                <span className="autoSaveText">Saving...</span>
              </Link>
            </li>
            <li className="search">
              {updateLocation && (
              <SearchModal history={this.props.history} />
              )}
            </li>
            <li className="cursor">
              <div className="header-right-panel">
                {updateLocation && (
                  <label className="switchLabel">
                    <span className="switchPublic">Show  cursors</span>
                    <Switch
                      className={`cursor-header ${mouseTracker ? 'activeMouseTracker' : 'mouseTracker'}`}
                      onClick={() => this.handleCursor(mouseTracker)}
                      title={`${mouseTracker ? 'hide collaborators cursor' : 'show collaborators cursor'}`}
                    />
                  </label>
                )}
              </div>
            </li>
            <li className="user">
              {updateLocation && (
              <div className="button-group social-button-group">

                {graphId && <ContributorsModal graphId={graphId} graphOwner={singleGraphUser} isOwner="true" />}
              </div>
              )}
            </li>
            <li className="legend">
              <span>
                {updateLocation && <Legend /> }
                Legends
              </span>
            </li>
            <li>
              {updateLocation ? (
                <GraphSettings singleGraph={singleGraph} />
              ) : null}
              {!updateLocation && (
              <span className="graphNames">
                {Utils.substr(singleGraph.title, 16)}
              </span>
              )}
            </li>
            <li>
              <div className="headerHelp">
                <Button
                  onClick={this.toggleDropDown}
                >
                  ? Help
                </Button>
              </div>
              {showDropDown ? (
                <div className="helpsOutside">
                  <Helps closeModal={this.toggleDropDown} />
                </div>
              ) : null}
            </li>
          </ul>
        </header>
        {commentModal && (
        <CommentModal
          closeModal={() => this.openCommentModal(false)}
          graph={singleGraph}
        />
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  mouseTracker: state.graphs.mouseTracker,
  currentUserId: state.account.myAccount.id,
  singleGraph: state.graphs.singleGraph,
});
const mapDispatchToProps = {
  setActiveButton,
  socketMousePositionTracker,
};
const Container = connect(mapStateToProps, mapDispatchToProps)(ToolBarHeader);

export default withRouter(Container);
