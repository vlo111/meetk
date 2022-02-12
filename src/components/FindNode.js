import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import memoizeOne from 'memoize-one';
import Button from './form/Button';
import { ReactComponent as CloseSvg } from '../assets/images/icons/close.svg';
import DragNDropSvg from '../assets/images/icons/drag-n-drop.gif';
import { setActiveButton, toggleNodeModal } from '../store/actions/app';
import Input from './form/Input';
import ChartUtils from '../helpers/ChartUtils';
import Utils from '../helpers/Utils';
import { getGraphNodesRequest, getSingleGraphRequest, setGraphCustomFields } from '../store/actions/graphs';
import Api from '../Api';
import Chart from '../Chart';
import circleImg from '../assets/images/icons/circle.svg';
// import LabelCopy from './labelCopy/LabelCopy';
import ContextMenu from './contextMenu/ContextMenu';
import NodeIcon from './NodeIcon';

class FindNode extends Component {
    static propTypes = {
      setActiveButton: PropTypes.func.isRequired,
      getSingleGraphRequest: PropTypes.func.isRequired,
      getGraphNodesRequest: PropTypes.func.isRequired,
      activeButton: PropTypes.string.isRequired,
      graphNodes: PropTypes.array.isRequired,
      singleGraph: PropTypes.object.isRequired,
    }

    initialGraph = memoizeOne(async (graphId) => {
      await this.props.getSingleGraphRequest(graphId, { full: true });
    });

    constructor(props) {
      super(props);
      this.state = {
        search: '',
        // graphIdParam: window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1),
        selected: {},
        drag: false,
        showCompare: false,
        virtualPos: [],
        position: [],
        duplicateNode: {},
        overDrag: '',
      };
    }

    async componentDidMount() {
      document.addEventListener('mouseup', this.handleMouseUp);
      document.addEventListener('mousemove', this.handleMouseMove);
    }

    closeModal = () => {
      this.setState({
        search: '',
        // graphIdParam: window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1),
        selected: {},
        drag: false,
        showCompare: false,
        virtualPos: [],
        position: [],
        duplicateNode: {},
        overDrag: '',
      });
      this.props.setActiveButton('create');
    }

    formatHtml = (text) => {
      const { search } = this.state;
      return text.replace(new RegExp(Utils.escRegExp(search), 'ig'), '<b>$&</b>');
    }

    findNode = (node) => {
      ChartUtils.findNodeInDom(node);
      this.closeModal();
    }

    handleChange = async (search = '') => {
      if (search.length > 3) {
        if (!search.trim().toLowerCase()) {
          this.setState({ search });
          return;
        }

        this.props.getGraphNodesRequest(1,
          {
            s: search,
            graphId: window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1),
          });
      }

      this.setState({ search });
    }

    handleMouseDown = async (ev, node, graph) => {
      const { clientX, clientY } = ev;
      this.setState({
        drag: true,
        virtualPos: [clientX, clientY],
        selected: {
          node,
          graph,
        },
      });
      this.props.setActiveButton('create');
    }

    handleMouseMove = (ev) => {
      const { drag } = this.state;
      if (!drag) return;

      const { clientX, clientY } = ev;
      this.setState({ virtualPos: [clientX, clientY] });
    }

    handleMouseUp = async (ev) => {
      const { drag } = this.state;

      if (!drag) return;

      const { graphNodes } = this.props;

      if (graphNodes && graphNodes.length) {
        const { selected } = this.state;

        const { node, graph } = selected;
        const { singleGraph } = this.props;

        const { data: compare } = await Api.dataPastCompare(
          window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1),
          [node],
        );

        const { clientX, clientY } = ev;

        const { x, y } = ChartUtils.calcScaledPosition(clientX, clientY);

        node.fx = x;
        node.fy = y;

        if (!(compare.duplicatedNodes && compare.duplicatedNodes.length)) {
          if (!singleGraph.nodes.filter((p) => p.id === node.id)[0]) {
            node.create = true;

            singleGraph.nodes = singleGraph.nodes.concat(node);
            Chart.render({ nodes: singleGraph.nodes });
          }
        } else {
          const { showCompare } = this.state;

          const position = [x, y];

          this.setState({ showCompare: !showCompare, position, duplicateNode: compare });

          const data = {
            sourceId: graph.id,
            label: null,
            nodes: [node],
            links: null,
            customFields: node.customFields,
            title: graph.title,
          };

          localStorage.setItem('label.copy', JSON.stringify(data));

          const params = {
            x, y, compare,
          };

          ContextMenu.event.emit('node.append', ev, params);
        }
      }

      this.closeModal();
    }

    toggleCompareNodes = (showCompareModal) => {
      this.setState({ showCompare: showCompareModal });
    }

    mouseOver = (nodeId) => {
      this.setState({
        overDrag: nodeId,
      });
    }

    mouseLeave = () => {
      this.setState({
        overDrag: '',
      });
    }

    render() {
      const { activeButton, graphNodes } = this.props;

      const {
        virtualPos, drag, overDrag, search,
      } = this.state;

      if (activeButton === 'findNode') {
        const { singleGraph } = this.props;

        this.initialGraph(singleGraph.id);
      }

      return (
        <>
          <Modal
            isOpen={activeButton === 'findNode'}
            className="ghModal ghModalSearch ghModalFind"
            overlayClassName="ghModalOverlay"
            onRequestClose={this.closeModal}
          >
            <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeModal} />

            <Input
              placeholder="Enter Node name"
              label="Search"
              autoComplete="off"
              value={search}
              containerClassName="graphSearch"
              onChangeText={this.handleChange}
              autoFocus
            />
            <ul className="list findNodeList">
              {((search && search.length > 3) && graphNodes) && graphNodes.map((graph) => (

                graph.nodes.map((node) => (
                  <li className="item" key={node.index}>
                    <div
                      tabIndex="0"
                      role="button"
                      className="ghButton"
                    >
                      <div
                        onMouseOver={() => this.mouseOver(`${node.id}${graph.id}`)}
                        onMouseLeave={() => this.mouseLeave()}
                        onMouseDown={(e) => this.handleMouseDown(e, node, graph)}
                        className="leftPanel"
                      >
                        <div className="left">
                          {overDrag === `${node.id}${graph.id}`
                            ? <img src={DragNDropSvg} alt="draggable" />
                            : <NodeIcon node={node} />}
                        </div>
                        <div className="right">
                          <span className="row">
                            <span
                              title={node.name}
                              className="name"
                              dangerouslySetInnerHTML={{
                                __html: this.formatHtml(Utils.substr(node.name, 15)),
                              }}
                            />

                          </span>

                          {!node.name.toLowerCase().includes(search) && !node.type.toLowerCase().includes(search) ? (
                            <span
                              className="keywords"
                              dangerouslySetInnerHTML={{
                                __html: node.keywords.map((k) => this.formatHtml(k)).join(', '),
                              }}
                            />
                          ) : null}

                        </div>
                      </div>
                      <a
                        title={graph.title}
                        target="_blank"
                        href={`${window.location.href.substring(window.location.href.lastIndexOf('/'), 0)}/${graph.id}`}
                        className="findNodesTitle"
                        rel="noreferrer"
                      >
                        {Utils.substr(graph.title, 12)}
                      </a>
                      <div className="aboutNode">
                        <p>Created by</p>
                        <a
                          target="_blank"
                          href={`${window.location.origin}/profile/${graph.userId}`}
                          title={node.userName}
                          rel="noreferrer"
                        >
                          {Utils.substr(node.userName, 12)}
                        </a>
                        <p>
                          {'in '}
                          {moment(graph.updatedAt).calendar()}
                        </p>
                        <span
                          className="type"
                          dangerouslySetInnerHTML={{ __html: this.formatHtml(node.type, 10) }}
                        />
                      </div>
                    </div>
                  </li>
                ))
              ))}
            </ul>

          </Modal>
          {drag ? (
            <img
              src={circleImg}
              style={{ left: virtualPos[0], top: virtualPos[1] }}
              className="ghMapsModalVirtualMarker"
              alt="marker"
            />
          ) : null}
        </>
      );
    }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  graphNodes: state.graphs.graphNodes,
  singleGraph: state.graphs.singleGraph,
});
const mapDispatchToProps = {
  setActiveButton,
  setGraphCustomFields,
  toggleNodeModal,
  getGraphNodesRequest,
  getSingleGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FindNode);

export default Container;
