import React, { Component } from 'react';
import EventEmitter from 'events';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Button from '../form/Button';
import Chart from '../../Chart';
import NodeContextMenu from './NodeContextMenu';
import ExpandNodeContextMenu from './ExpandNodeContextMenu';
import QueryContextMenu from './QueryContextMenu';
import MatchNodeContextMenu from './MatchNodeContextMenu';
import LinkContextMenu from './LinkContextMenu';
// import TabContext from './TabContext';
import LabelContextMenu from './LabelContextMenu';
import Icon from '../form/Icon';
import LabelUtils from '../../helpers/LabelUtils';
import SelectSquare from './SelectSquare';
import DeleteModalContext from './DeleteModalContext';
import { setActiveButton } from '../../store/actions/app';
import Api from '../../Api';
import { KEY_CODES } from '../../data/keyCodes';

class ContextMenu extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    expand: PropTypes.bool,
    activeButton: PropTypes.string.isRequired,
    singleGraphId: PropTypes.string.isRequired,
    currentUserRole: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
  }

  static defaultProps = {
    expand: false,
  }

  static event = new EventEmitter();

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      x: 0,
      y: 0,
      params: {},
      deleteDataModal: {},
    };
  }

  componentDidMount() {
    document.addEventListener('contextmenu', this.onHandleContextMenu);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    this.constructor.event.removeAllListeners();
    document.removeEventListener('contextmenu', this.onHandleClick);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Handle copy and past events
   * @param {object} ev
   */
  handleKeyDown = async (ev) => {
    if (ev.chartEvent && ev.ctrlPress && ev.keyCode === KEY_CODES.copy_code && !ev.altKey
    ) {
      await this.handleCopy(ev);
    }
  }

  /**
   * Send copy to backend and save it in cache
   * @param {object} ev
   */
  handleCopy = async (ev) => {
    const { singleGraphId } = this.props;
    Chart.loading(true);
    const {
      width, height, x, y,
    } = Chart.squareData;
    const { data } = await Api.dataCopy(singleGraphId, {
      width, height, x, y,
    });
    localStorage.setItem('label.copy', JSON.stringify(data.data));

    Chart.event.emit('window.mousedown', ev);
    Chart.loading(false);
  }

  onHandleContextMenu = async (ev) => {
    ev.preventDefault();
    const { show } = this.state;
    const { currentUserRole } = this.props;
    if (show) {
      this.setState({ show: false });
      return;
    }
    if (currentUserRole === 'edit_inside') {
      return;
    }
    const { x, y } = ev;
    let element;
    let params = {};
    if (ev.target.closest('.nodes')) {
      if (ev.target.classList.contains('selectMultyNodes')) {
        params = {
          squareData: Chart.squareData || {},
        };
        element = 'selectNode';
      } else {
        const { parentElement } = ev.target;
        let index;

        if (parentElement.classList.value.includes('infography')) {
          index = +ev.target.parentNode.getAttribute('data-i');
        } else {
          index = +ev.target.parentNode.parentNode.getAttribute('data-i');
        }
        ev.target.parentElement.classList.value.includes('infography');
        params = Chart.getNodes().find((d) => d.index === index);
        element = 'node';
      }
    } else if (ev.target.closest('.links')) {
      const index = +ev.target.getAttribute('id').replace('l', '');
      params = { index };
      element = 'link';
    } else if (ev.target.tagName === 'svg' || ev.target.classList.contains('labelsBoard')) {
      element = 'chart';
    }
    // else if (ev.target.closest('.contentWrapper')) {
    //   const el = ev.target.closest('.contentWrapper');
    //   const fieldName = el.getAttribute('data-field-name');
    //   if (fieldName) {
    //     element = 'Tab';
    //     params = { fieldName };
    //   }
    // }
    else if (ev.target.classList.contains('label')) {
      const id = ev.target.getAttribute('data-id');
      const label = Chart.getLabels().find((l) => l.id === id);
      params = { ...label };
      element = 'label';
    } else if (ev.target.parentNode && ev.target.parentNode.closest('.folder')) {
      const id = ev.target.parentNode.getAttribute('data-id');
      const label = Chart.getLabels().find((l) => l.id === id);
      params = { ...label };
      element = 'label';
    } else if (ev.target.classList.contains('selectSquare')) {
      params = {
        squareData: Chart.squareData || {},
      };
      element = 'selectSquare';
    }
    params.originalEvent = ev;
    this.setState({
      x, y, show: element, params,
    });
  }

  closeMenu = (ev) => {
    if (ev && ev.target.classList.contains('notClose')) {
      return;
    }
    this.setState({ show: false });
  }

  handleClick = (ev, type, additionalParams) => {
    if (type.includes('.delete')) {
      this.setState({
        deleteDataModal: { ev, type },
      });
      this.props.setActiveButton('deleteModal');
    } else if (type === 'findPath') {
      this.props.setActiveButton(`findPath.${this.state.params.id}`);
    } else {
      const { params, x, y } = this.state;
      params.contextMenu = true;
      params.x = x;
      params.y = y;
      this.constructor.event.emit(type, params.originalEvent, { ...params, ...additionalParams });
    }
  }

  render() {
    const {
      x, y, params, deleteDataModal,
    } = this.state;
    let { show } = this.state;
    const { activeButton, location: { pathname } } = this.props;
    const viewLocation = pathname.startsWith('/graphs/view/');

    if (activeButton !== 'deleteModal') {
      if (!show) {
        return null;
      }
    }
    if (pathname.includes('filter')) {
      return null;
    }

    if (viewLocation && show === 'node') {
      show = 'expand';
    }
    const { match: { params: { graphId = '' } }, expand } = this.props;
    const undoCount = Chart.undoManager.undoCount();
    const showInMap = Chart.getNodes().some((d) => d?.location?.length > 0);
    const pastData = LabelUtils.getData();

    const showPast = !_.isEmpty(pastData) && !_.isEmpty(pastData.nodes) && (show === 'chart' || show === 'label');
    if (params.fieldName === '_location') {
      return null;
    }

    const contexHeight = show === 'selectSquare' ? 195 : 300;

    const top = window.innerHeight - y < contexHeight ? window.innerHeight - contexHeight : y;

    const left = window.innerWidth - x < 170 ? window.innerWidth - 170 : x;

    // remove curve points
    Chart.wrapper.selectAll('#fcurve, #lcurve').remove();
    return (
      activeButton === 'deleteModal' ? <DeleteModalContext data={deleteDataModal} params={params} />
        : (
          <div className={`contextmenuOverlay ${x + 360 > window.innerWidth ? 'toLeft' : ''}`} onClick={this.closeMenu}>
            <div
              className="contextmenu"
              style={{ left, top }}
            >
              {show === 'node' ? <NodeContextMenu onClick={this.handleClick} params={params} /> : null}
              {show === 'expand' ? <ExpandNodeContextMenu onClick={this.handleClick} params={params} /> : null}
              {show === 'expand' ? <MatchNodeContextMenu onClick={this.handleClick} params={params} /> : null}
              {viewLocation ? <QueryContextMenu onClick={this.handleClick} params={params} /> : null}
              {show === 'link' ? <LinkContextMenu onClick={this.handleClick} params={params} /> : null}
              {show === 'label' ? <LabelContextMenu onClick={this.handleClick} params={params} /> : null}
              {/* {show === 'Tab' ? <TabContext onClick={this.handleClick} params={params} /> : null} */}
              {show === 'selectSquare' ? <SelectSquare onClick={this.handleClick} params={params} /> : null}

              {['label', 'chart'].includes(show) && !expand ? (
                <>
                  <Button icon="fa-circle-o" onClick={(ev) => this.handleClick(ev, 'node.create')}>
                    Create Node
                  </Button>
                  {showPast ? (
                    <div className="ghButton notClose">
                      <Icon value="fa-clipboard" />
                      Paste
                      <Icon className="arrow" value="fa-angle-right" />
                      <div className="contextmenu">
                        <Button onClick={(ev) => this.handleClick(ev, 'label.append')}>
                          Append
                        </Button>
                        {pastData.type === 'label' ? (
                          <Button onClick={(ev) => this.handleClick(ev, 'label.embed')}>
                            Past Embedded
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}

              {['selectSquare'].includes(show) && !viewLocation ? (
                <>
                  <Button icon="fa-folder-open" onClick={(ev) => this.handleClick(ev, 'folder.selectSquare')}>
                    Create a Folder
                  </Button>
                </>
              ) : null}
              {['node', 'link', 'label', 'selectSquare', 'selectNode'].includes(show) && !viewLocation ? (
                <>
                  {show === 'node' ? (!params.readOnly ? (
                    <Button icon="fa-eraser" onClick={(ev) => this.handleClick(ev, `${show}.delete`)}>
                      Delete
                    </Button>
                  ) : null)
                    : (
                      <Button icon="fa-eraser" onClick={(ev) => this.handleClick(ev, `${show}.delete`)}>
                        Delete
                      </Button>
                    )}
                </>
              ) : null}
              {['chart', 'label'].includes(show) && !expand ? (
                <>
                  {showInMap ? (
                    <Button
                      icon="fa-globe"
                      onClick={(ev) => this.handleClick(ev, 'active-button', { button: 'maps-view' })}
                    >
                      Show on map
                    </Button>
                  ) : null}
                </>
              ) : null}
              {['chart'].includes(show) && !expand ? (
                <>
                  {/* <div className="ghButton notClose"> */}
                  {/*  <Icon value="fa-plus-square" /> */}
                  {/*  Create */}
                  {/*  <Icon className="arrow" value="fa-angle-right" /> */}
                  {/*  <div className="contextmenu"> */}

                  {/*    <Button icon="fa-folder-open" onClick={(ev) => this.handleClick(ev, 'folder.new')}> */}
                  {/*      Folder */}
                  {/*    </Button> */}
                  {/*    <Button icon="fa-tags" onClick={() => this.props.setActiveButton('create-label')}> */}
                  {/*      Label */}
                  {/*    </Button> */}
                  {/*  </div> */}
                  {/* </div> */}
                  <Button icon="fa-crop" onClick={(ev) => this.handleClick(ev, 'crop')}>
                    Crop
                  </Button>
                  <Button disabled={!undoCount} icon="fa-undo" onClick={(ev) => this.handleClick(ev, 'undo')}>
                    {'Undo '}
                    <sub>(Ctrl+Z)</sub>
                  </Button>
                </>
              ) : null}
              {['node'].includes(show) ? (
                <>
                  {showInMap ? (
                    <Button
                      icon="fa-globe"
                      onClick={(ev) => this.handleClick(ev, 'active-button', { button: 'maps-view' })}
                    >
                      Show on map
                    </Button>
                  ) : null}

                </>
              ) : null}
            </div>
          </div>
        )
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  currentUserRole: state.graphs.singleGraph.currentUserRole || '',
  singleGraphId: state.graphs.singleGraph.id || '',
});
const mapDispatchToProps = {
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ContextMenu);

export default withRouter(Container);
