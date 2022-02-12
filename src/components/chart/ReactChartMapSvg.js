import React, { Component } from 'react';
import * as d3 from 'd3';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';

class ReactChartMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transform: {
        k: +Chart.wrapper.attr('data-scale') || 1,
        x: Chart.wrapper.attr('data-x') || 0,
        y: Chart.wrapper.attr('data-y') || 0,
      },
    };
  }

  componentDidMount() {
    Chart.event.on('zoom', this.handleChartZoom);
    Chart.event.on('auto-save', this.autoSave);
    this.viewArea = d3.select('#reactChartMap .viewArea');
    this.viewArea.call(
      d3.drag()
        .on('drag', this.handleDrag),
    );

    this.board = d3.select('#reactChartMap');
    this.board.on('click', this.handleBoardClick);
  }

  componentWillUnmount() {
    Chart.event.removeListener('zoom', this.handleChartZoom);
    Chart.event.removeListener('auto-save', this.autoSave);

    this.viewArea.call(
      d3.drag()
        .on('drag', null),
    );
    this.board.on('click', null);
  }

  autoSave = () => {
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => this.forceUpdate(), 500);
  }

  handleBoardClick = (ev) => {
    const { transform } = this.state;
    const { layerX, layerY } = ev;
    const { min, max } = ChartUtils.getDimensions();
    const originalWidth = max[0] - min[0];
    const originalHeight = max[1] - min[1];
    const { width, height } = this.ref.getBoundingClientRect();
    const areaSize = this.getAreaSize();

    const { width: gWidth, height: gHeight } = this.objects.getBoundingClientRect();
    const x1 = layerX - ((width - gWidth) / 2);
    const y1 = layerY - ((height - gHeight) / 2);

    let x;
    let y;
    if (originalWidth > originalHeight) {
      x = ((x1 * originalWidth / width * -1) - min[0] + (areaSize.width / 2)) * transform.k;
      y = ((y1 * originalWidth / width * -1) - min[1] + (areaSize.height / 2)) * transform.k;
    } else {
      x = ((x1 * originalHeight / height * -1) - min[0] + (areaSize.width / 2)) * transform.k;
      y = ((y1 * originalHeight / height * -1) - min[1] + (areaSize.height / 2)) * transform.k;
    }

    this.zoom(transform.k, x, y);
  }

  handleChartZoom = (ev, d) => {
    clearTimeout(this.timeOutZoom);
    this.timeOutZoom = setTimeout(() => {
      this.setState({ transform: d.transform });
    }, 200);
  }

  zoom = (scale = 1, x = 0, y = 0) => {
    Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
  }

  handleDrag = (ev) => {
    const { transform } = this.state;
    const { dx, dy } = ev;
    transform.x -= (dx * transform.k);
    transform.y -= (dy * transform.k);
    Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k));
    this.setState({ transform });
  }

  getAreaSize = () => {
    const { min, max } = ChartUtils.getDimensions();
    const { transform } = this.state;
    const originalWidth = max[0] - min[0];
    const originalHeight = max[1] - min[1];
    const width = (originalWidth / window.innerWidth + window.innerWidth) / transform.k;
    const height = (originalHeight / window.innerHeight + window.innerHeight / transform.k);
    return {
      width, height,
    };
  }

  render() {
    const { transform } = this.state;
    const nodes = Chart.getNodes();
    const labels = Chart.getLabels();
    const { min, max } = ChartUtils.getDimensions();
    const originalWidth = max[0] - min[0];
    const originalHeight = max[1] - min[1];
    const areaSize = this.getAreaSize();
    let r = originalWidth / 180;
    if (r > 150) {
      r = 150;
    } else if (r < 50) {
      r = 50;
    }
    return (
      <svg
        ref={(ref) => this.ref = ref}
        id="reactChartMap"
        viewBox={`${min[0]} ${min[1]} ${originalWidth} ${originalHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <g ref={(ref) => this.objects = ref}>
          {labels.filter((l) => l.type !== 'folder').map((l) => {
            const square = (l.type !== 'square' && l.type !== 'ellipse')
              ? ChartUtils.pathToSquare(l.d) : l.size;
            return (
              <rect
                key={l.id}
                width={square.width}
                height={square.height}
                x={square.x}
                y={square.y}
                fill={ChartUtils.labelColors(l)}
              />
            );
          })}
          {nodes.map((n) => (
            <circle
              key={n.id}
              cx={+n.fx.toFixed(3)}
              cy={+n.fy.toFixed(3)}
              r={+r.toFixed(3)}
              fill={ChartUtils.nodeColor(n)}
            />
          ))}
          {/* <rect className="board" opacity={0} width={originalWidth} height={originalHeight} x={min[0]} y={min[1]}/> */}
        </g>
        <rect
          className="viewArea"
          x={(-1 * transform.x) / transform.k}
          y={(-1 * transform.y) / transform.k}
          strokeWidth={originalWidth / window.innerWidth * 2}
          width={areaSize.width}
          height={areaSize.height}
        />
      </svg>
    );
  }
}

export default ReactChartMap;
