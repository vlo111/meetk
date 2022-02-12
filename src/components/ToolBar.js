import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import memoizeOne from 'memoize-one';
import { setActiveButton } from '../store/actions/app';
import { getSingleGraphRequest } from '../store/actions/graphs';
import Utils from '../helpers/Utils';
import ChartUtils from '../helpers/ChartUtils';
import { KEY_CODES } from '../data/keyCodes';
import AnalyseModal from './Analysis/AnalyseModal';
import Outside from './Outside';
import Undo from './Undo';
import SearchModal from './search/SearchModal';
import { ReactComponent as Ellipse } from '../assets/images/Ellipse.svg';
import { ReactComponent as FreeForm } from '../assets/images/freeform.svg';
import { ReactComponent as Square } from '../assets/images/Square.svg';

class ToolBar extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    singleGraph: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  initialGraph = memoizeOne(async (graphId) => {
    await this.props.getSingleGraphRequest(graphId, { full: true });
  });

  constructor(props) {
    super(props);
    this.state = {
      showMenu: true,
      overMenu: '',
      selected: '',
      createNewPopup: false,
      showAddNode: false,
      showAddLabel: false,

    };
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (ev) => {
    if (ev.chartEvent && ev.ctrlPress && !ev.shiftKey && !ev.altKey) {
      if (ev.keyCode === KEY_CODES.analytic_code) {
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('analytic');
      }
      if (ev.keyCode === KEY_CODES.import_code) {
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('import');
      }
      if (ev.keyCode === KEY_CODES.data_code) {
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('data');
      }
      if (ev.keyCode === KEY_CODES.label_code) {
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('create-label');
      }
      if (ev.keyCode === KEY_CODES.label_ellipse_code) {
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('create-label-ellipse');
      }
    }
    if (ev.chartEvent && ev.shiftKey && !ev.ctrlPress) {
      if (ev.keyCode === KEY_CODES.create_code) {
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('create-node');
      }
      if (ev.keyCode === KEY_CODES.label_code) {
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('create-label-square');
      }
      if (ev.keyCode === KEY_CODES.data_code) {
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('create');
      }
      if (ev.keyCode === KEY_CODES.find_node) {
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('findNode');
      }
    }
    if (ev.keyCode === KEY_CODES.escape) {
      this.props.setActiveButton('create');
    }
  }

  handleClick = async (button) => {
    const {
      match: {
        params: { graphId, token = '' },
      },
    } = this.props;

    const { selected } = this.state;

    switch (button) {
      case 'analytic': {
        await this.initialGraph(graphId);

        const { nodes, links } = this.props.singleGraph;

        if (!(nodes && nodes.length && links && links.length)) {
          button = 'analyse';
        } else {
          this.props.history.replace(`/graphs/view/${graphId}?analytics`);
        }
        break;
      }
      case 'filter':
        Utils.isInEmbed()
          ? this.props.history.replace(`/graphs/embed/filter/${graphId}/${token}`)
          : this.props.history.replace(`/graphs/filter/${graphId}`);
        break;
      case 'view':
        this.props.history.replace(`/graphs/view/${graphId}`);
        break;
      case 'create-folder':
        this.setState({
          selected: 'folder',
        });
        break;
      case 'create-label': {
        this.setState({
          selected: 'label->freeForm',
        });
        break;
      }
      case 'create-node':
      case 'maps':
      case 'linkedIn':
      case 'wikipedia':
      case 'sciGraph':
      case 'create-label-square':
      case 'create-label-ellipse': {
        let value;
        if (selected.search('->')) {
          value = `${selected.split('->')[0]}->${button}`;
        } else {
          value = `${selected}->${button}`;
        }
        this.setState({
          selected: value,
        });
        break;
      }
      default:
        break;
    }

    this.props.setActiveButton(button);
    this.toggleOutside();
  };

  handleOpenNewModal = () => {
    const { createNewPopup, selected } = this.state;

    if (selected === 'folder') {
      this.setState({
        createNewPopup: !createNewPopup,
        showAddNode: false,
        showAddLabel: false,
      });
    } else {
      this.setState({
        createNewPopup: !createNewPopup,
      });
    }
  }

  toggleShowModal = () => {
    const { showMenu } = this.state;
    this.setState({ showMenu: !showMenu });

    setTimeout(() => {
      this.collapse();
    }, 20);
  };

  handleOver = (mode) => {
    const { showMenu } = this.state;

    if (!showMenu) {
      if (mode !== 'create') {
        this.setState({
          overMenu: mode,
          createNewPopup: false,
        });
      } else {
        this.setState({
          overMenu: mode,
        });
      }
    }
  };

  handleLeave = () => {
    const { showMenu, createNewPopup } = this.state;

    if (!showMenu && !createNewPopup) {
      this.setState({
        overMenu: '',
      });
    }
  };

  showAddNode = () => {
    const { showAddNode } = this.state;

    this.setState({
      showAddNode: !showAddNode,
      showAddLabel: false,
      selected: 'node',
    });
  }

  showAddLabel = () => {
    const { showAddLabel } = this.state;

    this.setState({
      showAddLabel: !showAddLabel,
      showAddNode: false,
      selected: 'label',
    });
  }

  toggleOutside = () => {
    this.setState({
      createNewPopup: false,
      overMenu: '',
    });
  }

  collapse = () => {
    const closedMenu = document.getElementsByClassName('closed_menu')[0];
    const menu = document.getElementsByClassName('menu')[0];
    const undo = document.getElementById('undoWrapper');
    const footer = document.getElementById('graphs-data-info');

    let left;

    if (closedMenu) {
      left = closedMenu.offsetWidth;
    } else {
      left = menu.offsetWidth;
    }
    undo.style.left = `${left + 13}px`;
    if (undo) {
      left += undo.offsetWidth;
    }
    footer.style.left = `${left}px`;
  }

  render() {

    const {
      showMenu, overMenu, createNewPopup, showAddNode, showAddLabel, selected,
    } = this.state;

    return (
      <>
        <div className={`${!showMenu ? 'closed_menu' : ''} menu`}>
          <ul className="containerMenu">
            <li onClick={this.toggleShowModal} className="collapse">
              <i className="fa fa-align-justify"> </i>
              <div className="sidebar_text"> Menu </div>
            </li>
            <li
              onClick={() => this.handleOpenNewModal()}
              onMouseOver={() => this.handleOver('create')}
              onMouseLeave={this.handleLeave}
              className={`${((overMenu === 'create') || createNewPopup) ? 'collapse_over' : ''} collapse`}
            >
              <i className="fa fa-plus"> </i>
              <div className="sidebar_text">
                Create
                <i className="fa fa-caret-right" />
              </div>
            </li>
            <li
              onClick={() => this.handleClick('media')}
              onMouseOver={() => this.handleOver('media')}
              onMouseLeave={this.handleLeave}
              className={`${overMenu === 'media' ? 'collapse_over' : ''} collapse`}
            >
              <i className="fa fa-picture-o"> </i>
              <div className="sidebar_text"> Media </div>
            </li>
            <li
              onClick={() => this.handleClick('data')}
              onMouseOver={() => this.handleOver('data_sheet')}
              onMouseLeave={this.handleLeave}
              className={`${overMenu === 'data_sheet' ? 'collapse_over' : ''} collapse`}
            >
              <i className="fa fa-th-list"> </i>
              <div className="sidebar_text"> Data Sheet </div>
            </li>
            <li
              onClick={() => this.handleClick('import')}
              onMouseOver={() => this.handleOver('import')}
              onMouseLeave={this.handleLeave}
              className={`${overMenu === 'import' ? 'collapse_over' : ''} collapse`}
            >
              <i className="fa fa-arrow-down"> </i>
              <div className="sidebar_text"> Import Data </div>
            </li>
            <li
              onClick={() => this.handleClick('view')}
              onMouseOver={() => this.handleOver('view')}
              onMouseLeave={this.handleLeave}
              className={`${overMenu === 'view' ? 'collapse_over' : ''} collapse`}
            >
              <i className="fa fa-eye"> </i>
              <div className="sidebar_text"> Explore </div>
            </li>
            <li
              onClick={() => this.handleClick('filter')}
              onMouseOver={() => this.handleOver('filter')}
              onMouseLeave={this.handleLeave}
              className={`${overMenu === 'filter' ? 'collapse_over' : ''} collapse`}
            >
              <i className="fa fa-filter"> </i>
              <div className="sidebar_text"> Filter </div>
            </li>
            <li
              onClick={() => this.handleClick('analytic')}
              onMouseOver={() => this.handleOver('analytic')}
              onMouseLeave={this.handleLeave}
              className={`${overMenu === 'analytic' ? 'collapse_over' : ''} collapse`}
            >
              <i className="fa fa-bar-chart" />
              <div className="sidebar_text"> Analysis </div>
            </li>
            <li
              onClick={() => this.handleClick('findNode')}
              onMouseOver={() => this.handleOver('findNode')}
              onMouseLeave={this.handleLeave}
              className={`${overMenu === 'findNode' ? 'collapse_over' : ''} collapse`}
            >
              <i className="fa fa-search-plus" />
              <div className="sidebar_text"> Find Node </div>
            </li>

          </ul>
          {createNewPopup ? (
            <Outside onClick={() => this.toggleOutside()}>
              <ul className="dropdown-addNew">
                <li
                  className={`${selected.includes('node') ? 'selected' : ''}`}
                  onClick={this.showAddNode}
                >
                  Node
                  <i className="fa fa-caret-right" />
                </li>
                <li className={`${selected.includes('label') ? 'selected' : ''}`} onClick={this.showAddLabel}>
                  Label
                  <i className="fa fa-caret-right" />
                </li>
                <li
                  className={`${selected.includes('folder') ? 'selected' : ''}`}
                  onClick={() => {
                    this.handleClick('create-folder');
                  }}
                >
                  Folder
                </li>
              </ul>
              {showAddNode && (
                <ul className="dropdown-node">
                  <li
                    className={`${selected.includes('create-node') ? 'selected' : ''}`}
                    onClick={() => this.handleClick('create-node')}
                  >
                    New
                  </li>
                  <li
                    className={`${selected.includes('maps') ? 'selected' : ''}`}
                    onClick={() => this.handleClick('maps')}
                  >
                    Use Google Map
                  </li>
                  <li
                    className={`${selected.includes('linkedIn') ? 'selected' : ''}`}
                    onClick={() => this.handleClick('linkedIn')}
                  >
                    Use LinkedIn
                  </li>
                  <li
                    className={`${selected.includes('wikipedia') ? 'selected' : ''}`}
                    onClick={() => this.handleClick('wikipedia')}
                  >
                    Use Wikipedia
                  </li>
                  <li
                    className={`${selected.includes('sciGraph') ? 'selected' : ''}`}
                    onClick={() => this.handleClick('sciGraph')}
                  >
                    Use Mind Science
                  </li>
                </ul>
              )}
              {showAddLabel && (
                <ul className="create_label">
                  <li
                    onClick={() => this.handleClick('create-label')}
                    className={`${selected.includes('freeForm') ? 'selected' : ''}`}
                  >
                    <FreeForm className="lablMenu" />
                    <span> Free form </span>
                  </li>
                  <li
                    onClick={() => this.handleClick('create-label-square')}
                    className={`${selected.includes('create-label-square') ? 'selected' : ''}`}
                  >
                    <Square className="lablMenu" />
                    <span> Square </span>
                  </li>
                  <li
                    onClick={() => this.handleClick('create-label-ellipse')}
                    className={`${selected.includes('create-label-ellipse') ? 'selected' : ''}`}
                  >
                    <Ellipse className="lablMenu" />
                    <span> Ellipse </span>
                  </li>
                </ul>
              )}
            </Outside>
          ) : <></>}
          <AnalyseModal />
        </div>
        <Undo />
        <SearchModal history={this.props.history} />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  currentUserRole: state.graphs.singleGraph.currentUserRole || '',
  singleGraphUser: state.graphs.singleGraph.user,
  singleGraph: state.graphs.singleGraph,
});

const mapDispatchToProps = {
  setActiveButton,
  getSingleGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToolBar);

export default withRouter(Container);
