import React, { Component } from 'react';
import _ from 'lodash';
import Chart from '../../../Chart';
import ChartInfography from '../../../helpers/ChartInfography';
import ContextMenu from '../../contextMenu/ContextMenu';

class FolderCloseIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 500,
      y: 500,
      width: 225,
      height: 225,
      rotate: 0,
      nodeId: null,
    };
  }

  componentDidMount() {
    Chart.event.on('click', this.handleClick);
    Chart.event.on('node.click', this.handleNodeClick);
    ContextMenu.event.on('node.resize', this.handleNodeResize);

    Chart.event.on('node.edit', this.handleClick);
    Chart.event.on('node.drag', this.handleNodeDrag);
    Chart.event.on('node.resize', this.handleNodeDrag);
    ContextMenu.event.on('node.delete', this.handleDeleteNode);
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener('node.resize', this.handleNodeResize);
    ContextMenu.event.removeListener('node.delete', this.handleDeleteNode);
  }

  handleClick = (ev) => {
    const { nodeId } = this.state;
    if (nodeId) {
      this.setState({ nodeId: null });
    }
  }

  handleDeleteNode = () => {
    const { nodeId } = this.state;
    if (nodeId) {
      this.setState({ nodeId: null });
    }
  }

  handleNodeClick = () => {
    const { nodeId } = this.state;
    if (nodeId) {
      this.setState({ nodeId: null });
    }
  }

  handleNodeResize = (ev, d) => {
    const { nodeId } = this.state;
    if (d.nodeType !== 'infography') {
      if (nodeId) {
        this.setState({ nodeId: null });
      }
      return;
    }
    this.setRsizePosition(d);
    this.setState({
      nodeId: nodeId === d.id ? null : d.id,
    });
  }

  handleNodeDrag = (ev, d) => {
    const { nodeId } = this.state;
    if (!nodeId) {
      return;
    }
    this.setRsizePosition(d);
  }

  setRsizePosition = (d) => {
    const { width, height } = ChartInfography.getPolygonSize(d.d);
    const scaleX = _.get(d, 'scale[0]') || 1;
    const scaleY = _.get(d, 'scale[1]') || 1;
    const rotate = _.get(d, 'scale[2]') || 0;

    const rWidth = width * scaleX;
    const rHeight = height * scaleY;
    const rX = ((d.fx || d.x) - rWidth / 2);
    const rY = ((d.fy || d.y) - rHeight / 2);
    this.setState({
      x: rX,
      y: rY,
      width: rWidth,
      height: rHeight,
    });
  }

  render() {
    const {
      x, y, width, height, nodeId, rotate,
    } = this.state;
    return (
      <g
        id="nodeResizeIcons"
        data-node={nodeId}
        transform={`translate(${x} ${y}) rotate(${rotate})`}
        className="disableZoom"
      >
        {nodeId ? (
          <>
            <g className="square" transform="rotate(-45)">
              <rect
                width="14"
                height="14"
                x={0}
                y={0}
                transform="rotate(45)"
                data-resize="top-left"
              />
              <rect
                width="14"
                height="14"
                x={width - 14}
                y={0}
                transform="rotate(45)"
                data-resize="top-right"
              />
              <rect
                width="14"
                height="14"
                x={width - 14}
                y={height - 14}
                transform="rotate(45)"
                data-resize="bottom-right"
              />
              <rect
                width="14"
                height="14"
                x={0}
                y={height - 14}
                transform="rotate(45)"
                data-resize="bottom-left"
              />
            </g>
            {/* <g className="circleWrapper">
              <circle
                r="8"
                cx={-4}
                cy={-4}
                className="circle"
              />
              <circle
                r="8"
                cx={width + 4}
                cy={-4}
                className="circle"
              />
              <circle
                r="8"
                cx={width + 4}
                cy={height + 4}
                className="circle"
              />
              <circle
                r="8"
                cx={-4}
                cy={height + 4}
                className="circle"
              />
            </g> */}
          </>
        ) : null}
      </g>
    );
  }
}

export default FolderCloseIcon;
