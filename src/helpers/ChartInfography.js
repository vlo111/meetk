import * as d3 from 'd3';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import Chart from '../Chart';
import ChartUtils from './ChartUtils';

class ChartInfography {
  static render = (chart) => {
    this.chart = chart;
    chart.nodesWrapper.selectAll('.infography rect')
      .on('mousemove', (ev, d) => {
        ChartUtils.keyEvent(ev);
        const { parentNode } = ev.target;
        if (ev.shiftKey) {
          if (!parentNode.classList.contains('crop')) {
            parentNode.classList.add('crop');
          }
        } else if (parentNode.classList.contains('crop')) {
          parentNode.classList.remove('crop');
          this.dragend(ev, d);
        }
      });
    this.resize();
  }

  static resize = () => {
    if (this.chart.isCalled('ChartInfography.resize')) {
      return;
    }
    const nodeResizeIcons = this.chart.wrapper.select('#nodeResizeIcons');

    let data = {};
    const handleDragStart = (ev) => {
      const resize = ev.sourceEvent.target.getAttribute('data-resize');
      const rotate = ev.sourceEvent.target.classList.contains('circle');
      const nodeId = nodeResizeIcons.attr('data-node');
      data = {
        node: ChartUtils.getNodeById(nodeId),
        resize,
        rotate,
      };
    };
    const handleDrag = (ev) => {
      const { dx, dy } = ev;
      if (!data.node.scale || !data.node.scale[0]) {
        _.set(data.node, 'scale', [1, 1, 0]);
      }
      // if(ev.sourceEvent.shiftKey){
      //   dy = dx;
      // }

      const prevX = data.node.fx || data.node.x;
      const prevY = data.node.fy || data.node.y;
      const [prevScaleX, prevScaleY] = data.node.scale;
      const mx = dx / 2;
      const my = dy / 2;
      const sx = mx / 100;
      const sy = my / 100;

      if (data.resize) {
        data.node.fx += dx / 2;
        data.node.fy += dy / 2;
        if (data.resize === 'bottom-right') {
          data.node.scale[0] += sx;
          data.node.scale[1] += sy;
        } else if (data.resize === 'bottom-left') {
          data.node.scale[0] -= sx;
          data.node.scale[1] += sy;
        } else if (data.resize === 'top-left') {
          data.node.scale[0] -= sx;
          data.node.scale[1] -= sy;
        } else if (data.resize === 'top-right') {
          data.node.scale[0] += sx;
          data.node.scale[1] -= sy;
        }

        if (data.node.scale[0] < 0.2) {
          data.node.scale[0] = prevScaleX;
          data.node.fx = prevX;
        }
        if (data.node.scale[1] < 0.2) {
          data.node.scale[1] = prevScaleY;
          data.node.fy = prevY;
        }

        data.node.x = data.node.fx;
        data.node.y = data.node.fy;
      }

      if (data.rotate) {
        return;
        if (!data.node.scale[2]) {
          data.node.scale[2] = 0;
        }
        data.node.scale[2] += Math.sqrt((dx * dx) + (dy * dy));
      }

      const nodes = this.chart.getNodes();
      nodes[data.node.index] = data.node;

      this.chart.event.emit('node.resize', ev, data.node);
      this.chart.render({ nodes }, { ignoreAutoSave: true });
    };

    const handleDragEnd = (ev, d) => {
      this.chart.event.emit('node.resize-end', ev, data.node);
    };

    nodeResizeIcons.call(d3.drag()
      .on('start', handleDragStart)
      .on('drag', handleDrag)
      .on('end', handleDragEnd));
  }

  static renderPath = d3.line()
    .x((i) => i[0])
    .y((i) => i[1])
    .curve(d3.curveBasis);

  static dragstart = (ev, d) => {
    Chart.event.emit('infography.cut', ev, d);
    const node = Chart.wrapper.select(`[data-i="${d.index}"]`);

    const line = node.append('path')
      .datum({
        d: [],
      })
      .attr('class', 'nodeCut');
    this.activeNode = {
      node,
      line,
      rect: ev.sourceEvent.target,
    };
  }

  static dragged = (ev, d) => {
    if (!this.activeNode?.line) {
      return;
    }
    Chart.event.emit('infography.cut', ev, d);
    const { line, node } = this.activeNode;
    const nodeDatum = node.datum();
    const [scaleX, scaleY] = nodeDatum.scale || [1, 1];
    const { x, y } = ChartUtils.calcScaledPosition(ev.sourceEvent.clientX, ev.sourceEvent.clientY);
    const x1 = (x - d.fx).toFixed(2) / scaleX;
    const y1 = (y - d.fy).toFixed(2) / scaleY;
    const datum = line.datum();
    datum.d.push([x1, y1]);
    line.datum(datum)
      .attr('d', (i) => this.renderPath(i.d));
  }

  static coordinatesNormalize(coord, target) {
    if (!target) {
      return coord;
    }
    const transform = target.getAttribute('transform');
    if (!transform) {
      return coord;
    }
    const [, dx, dy] = target.getAttribute('transform').match(/(-?[\d.]+)\s*(-?[\d.]+)/) || [0, 0, 0];

    return coord.map((c) => ([c[0] - parseFloat(dx), c[1] - parseFloat(dy)]));
  }

  static dragend = (ev, d) => {
    if (!this.activeNode?.line) {
      return;
    }
    const { line, rect, node } = this.activeNode;
    const datum = line.datum();
    datum.d = this.coordinatesNormalize(datum.d, rect);
    datum.d = ChartUtils.coordinatesCompass(datum.d, 3);
    line.datum(datum)
      .attr('d', (i) => this.renderPath(i.d));
    const nodeDatum = _.cloneDeep(node.datum());

    Chart.event.emit('node.edit', ev, {
      name: d.name,
      icon: d.icon,
      fx: d.fx,
      fy: d.fy,
      nodeType: 'infography',
      type: d.type,
      d: datum.d,
      infographyId: d.id,
      editPartial: true,
      scale: nodeDatum.scale,
    });

    line.remove();
    this.activeNode = {};
  }

  static getPolygonSize = memoizeOne((rect) => {
    try {
      const x = rect.map((d) => d[0]);
      const y = rect.map((d) => d[1]);

      const minX = Math.min(...x);
      const maxX = Math.max(...x);

      const minY = Math.min(...y);
      const maxY = Math.max(...y);

      const width = maxX - minX;
      const height = maxY - minY;

      return {
        width,
        height,
        min: [minX, minY],
        max: [maxX, maxY],
      };
    } catch (e) {
      return {
        width: 512,
        height: 384,
      };
    }
  })

  static getRectDimensions = memoizeOne((rect) => {
    try {
      return rect.getBoundingClientRect();
    } catch (e) {
      return {
        width: 512,
        height: 384,
      };
    }
  })
}

export default ChartInfography;
