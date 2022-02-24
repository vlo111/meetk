import * as d3 from 'd3';
import _ from 'lodash';
import EventEmitter from 'events';
import { toast } from 'react-toastify';
import ChartUtils from './helpers/ChartUtils';
import ChartUndoManager from './helpers/ChartUndoManager';
import Utils from './helpers/Utils';
import SvgService from './helpers/SvgService';
import ChartInfography from './helpers/ChartInfography';

class Chart {
  static event = new EventEmitter();

  static autoSave = true;

  /* @todo in view mode for show shortest path */
  static nodesPath = false;

  /* @todo transform i mej avelacnem rotate u translate move y image i arandznacnem */
  static minWidth;

  static minHeight;

  static tPos;

  static loading = (show) => {
    const loading = document.querySelector('#graph .loading');
    if (!loading) {
      return;
    }
    if (show) {
      loading.classList.add('show');
    } else {
      loading.classList.remove('show');
    }
  }

  static isLoading = () => {
    const loading = document.querySelector('#graph .loading');
    return !!loading?.classList?.contains('show');
  }

  // gets the passed d3 element center coordinates
  static getElementCenter() {
    const uCords = SvgService.getImageUpdatedCoordinates();
    return {
      x: uCords.x + uCords.width / 2,
      y: uCords.y + uCords.height / 2,
    };
  }

  static moveObject(ev, image) {
    // increments the x/y values with the dx/dy values from the d3.event object
    this.tPos.x += ev.dx;
    this.tPos.y += ev.dy;
    // updates the translate transform values to move the object to the new point
    SvgService.updateImageTransform(
      'translate',
      `translate(${[this.tPos.x, this.tPos.y]})`,
    );
    // updates the translate coordinates in the model for further use
    SvgService.updateImageTranslateCoordinates(this.tPos.x, this.tPos.y);
    d3.select('.controls-group').attr('transform', SvgService.getTransform());
    d3.select(image).attr('transform', SvgService.getTransform());
  }

  static resizeObject(direction, ev, size, image) {
    // gets the original image coordinates from the service model
    const updatedCoordinates = SvgService.getImageUpdatedCoordinates();
    // auxiliar variables
    let x;
    let y;
    let width;
    let height;
    // do the resize math based in the direction that the resize started
    switch (direction) {
      // top left
      case 'resize-tl':
        width = updatedCoordinates.width - ev.dx;
        height = updatedCoordinates.height - ev.dy;
        x = updatedCoordinates.x + (updatedCoordinates.width - width);
        y = updatedCoordinates.y + (updatedCoordinates.height - height);
        break;
      // top right
      case 'resize-tr':
        width = updatedCoordinates.width + ev.dx;
        height = updatedCoordinates.height - ev.dy;
        y = updatedCoordinates.y + (updatedCoordinates.height - height);
        break;
      // bottom left
      case 'resize-bl':
        width = updatedCoordinates.width - ev.dx;
        height = updatedCoordinates.height + ev.dy;
        x = updatedCoordinates.x + (updatedCoordinates.width - width);
        break;
      // bottom right
      default: // 'resize-br'
        width = updatedCoordinates.width + ev.dx;
        height = updatedCoordinates.height + ev.dy;
        break;
    }

    if (width > this.minWidth && height > this.minHeight) {
      // updates the image object model with the new coordinates values
      SvgService.updateImageCoordinates(width, height, x, y);
      const myImage = d3.select(image);
      x && myImage.attr('x', x);
      y && myImage.attr('y', y);
      width && myImage.attr('width', width);
      height && myImage.attr('height', height);

      Chart.imageManipulation({
        width,
        height,
        x: updatedCoordinates.x,
        y: updatedCoordinates.y,
      }, image);
    }
  }

  static rotateObject(rotateHandleStartPos, ev, image) {
    // gets the current udapted rotate coordinates
    const updatedRotateCoordinates = SvgService.getImageUpdatedRotateCoordinates();

    // increments the mouse event starting point with the mouse movement event
    rotateHandleStartPos.x += ev.dx;
    rotateHandleStartPos.y += ev.dy;

    // calculates the difference between the current mouse position and the center line
    const angleFinal = Chart.calcAngleDeg(
      updatedRotateCoordinates,
      rotateHandleStartPos,
    );

    // gets the difference of the angles to get to the final angle
    let angle = rotateHandleStartPos.angle + angleFinal - rotateHandleStartPos.iniAngle;

    // converts the values to stay inside the 360 positive
    angle %= 360;
    if (angle < 0) {
      angle += 360;
    }

    // creates the new rotate position array
    const rotatePos = [
      angle,
      updatedRotateCoordinates.cx,
      updatedRotateCoordinates.cy,
    ];

    // updates the transform rotate string value and the rotate info in the service model
    SvgService.updateImageTransform('rotate', `rotate(${rotatePos})`);
    // and updates the current angle with the new one
    SvgService.updateImageRotateCoordinates(angle);

    d3.select('.controls-group').attr('transform', SvgService.getTransform());
    d3.select(image).attr('transform', SvgService.getTransform());
    // const myImage = d3.select(image);
    Chart.imageManipulation({}, image);
  }

  static getHandleRotatePosition(handleStartPos) {
    // its possible to use "cx/cy" for properties
    const originalX = handleStartPos.x ? handleStartPos.x : handleStartPos.cx;
    const originalY = handleStartPos.y ? handleStartPos.y : handleStartPos.cy;

    // gets the updated element center, without rotatio
    const center = this.getElementCenter();
    // calculates the rotated handle position considering the current center as
    // pivot for rotation
    const dx = originalX - center.x;
    const dy = originalY - center.y;
    const theta = (handleStartPos.angle * Math.PI) / 180;

    return {
      x: dx * Math.cos(theta) - dy * Math.sin(theta) + center.x,
      y: dx * Math.sin(theta) + dy * Math.cos(theta) + center.y,
    };
  }

  // gets the angle in degrees between two points
  static calcAngleDeg(p1, p2) {
    const p1x = p1.x ? p1.x : p1.cx;
    const p1y = p1.y ? p1.y : p1.cy;
    return (Math.atan2(p2.y - p1y, p2.x - p1x) * 180) / Math.PI;
  }

  static bindControlsDragAndDrop(size, image) {
    // auxiliar variables
    let target;
    let targetClass;
    let rotateHandleStartPos;

    // binding the behavior callback functions
    const dragData = d3.drag()
      .on('start', dragStart)
      .on('drag', dragMove)
      .on('end', dragEnd);

    /**
     * For the drag action starts
     * */
    function dragStart(ev) {
      if (this.nodesPath) return;
      // gets the current target element where the drag event started
      target = d3.select(ev.sourceEvent.target);
      // and saves the target element class in a aux variable
      targetClass = target.attr('class');

      // when the user is rotating the element, stores the initial angle
      // information to be used in the rotate function
      if (targetClass.indexOf('rotate') > -1) {
        // gets the updated rotate coordinates
        const updatedRotateCoordinates = SvgService.getImageUpdatedRotateCoordinates();

        // updates the rotate handle start posistion object with
        // basic information from the model and the handles
        rotateHandleStartPos = {
          angle: updatedRotateCoordinates.angle, // the current angle
          x: parseFloat(target.attr('cx')), // the current cx value of the target handle
          y: parseFloat(target.attr('cy')), // the current cy value of the target handle
        };

        // calc the rotated top & left corner
        if (rotateHandleStartPos.angle > 0) {
          const correctsRotateHandleStartPos = Chart.getHandleRotatePosition(
            rotateHandleStartPos,
          );
          rotateHandleStartPos.x = correctsRotateHandleStartPos.x;
          rotateHandleStartPos.y = correctsRotateHandleStartPos.y;
        }

        // adds the initial angle in degrees
        rotateHandleStartPos.iniAngle = Chart.calcAngleDeg(
          updatedRotateCoordinates,
          rotateHandleStartPos,
        );
      }
    }

    /**
     * For while the drag is happening
     * */
    function dragMove(ev) {
      // checks the target class to choose the right function
      // to be executed while dragging
      // #1 - If the user is moving the element around
      if (targetClass.indexOf('move') > -1) {
        Chart.moveObject(ev, image);
      } else if (targetClass.indexOf('resize') > -1) {
        // #2 - If the user is resizing the element
        Chart.resizeObject(targetClass, ev, size, image);
      } else if (targetClass.indexOf('rotate') > -1) {
        // #3 - If the user is rotating the element
        Chart.rotateObject(rotateHandleStartPos, ev, image);
      }
      // apply the scope changes for any function that might
      // have been called, to keep things updated in the service model
    }

    /**
     * For when the drag stops (the user release the element)
     * */
    function dragEnd() {
      // check if the user was resizing
      d3.select('.controls-group').remove();
      if (targetClass.indexOf('resize') > -1) {
        // updates the center of rotation after resizing the element
        const elemCenter = Chart.getElementCenter();
        SvgService.updateImageRotateCoordinates(
          null,
          elemCenter.x,
          elemCenter.y,
        );
      }
    }

    return dragData;
  }

  static drag(simulation) {
    let moveX;
    let moveY;
    const dragNode = {};
    const dragstart = (ev, d) => {
      moveX = 0;
      moveY = 0;
      if (d !== undefined) {
        if (d.nodeType === 'infography' && ev.sourceEvent.shiftKey) {
          ChartInfography.dragstart(ev, d);
          return;
        }
      }

      if (d && !(this.curentTarget && (this.curentTarget.id === 'tc' || this.curentTarget.id === 'sc'))) {
        if (d.readOnly) {
          return;
        }
        if (ev.active) simulation.alphaTarget(0.3).restart();
        d.fixed = !!d.fx;

        dragNode.startX = ev.x;
        dragNode.startY = ev.y;
        dragNode.labels = [...(d.labels || [])];
      }
      this.oldData.nodes = _.cloneDeep(this.getNodes());
      this.event.emit('node.dragstart', ev, d);
    };

    const dragged = (ev, d) => {
      if (this.nodesPath) return;
      if (d !== undefined && (d.nodeType === 'infography' && ev.sourceEvent.shiftKey)) {
        ChartInfography.dragged(ev, d);
        return;
      }
      this.event.emit('node.drag', ev, d);
      if (this.curentTarget && (this.curentTarget.id === 'tc' || this.curentTarget.id === 'sc')) {
        // drag curve
        const { id } = this.curentTarget;

        if (this.point[id]) {
          this.point[id].x = ev.x;
          this.point[id].y = ev.y;

          this.curentTarget.setAttributeNS(null, 'cx', ev.x);
          this.curentTarget.setAttributeNS(null, 'cy', ev.y);
        }
      } else if (d) {
        if (d.readOnly || ev.sourceEvent.shiftKey) {
          return;
        }
        d.fx = ev.x;
        d.fy = ev.y;

        d.x = ev.x;
        d.y = ev.y;

        moveX += ev.dx;
        moveY += ev.dy;
      }

      this.graphMovement();
    };

    const dragend = (ev, d) => {
      if (this.nodesPath) return;
      if (d !== undefined) {
        if (d.nodeType === 'infography' && ev.sourceEvent.shiftKey) {
          ChartInfography.dragend(ev, d);
          return;
        }
      }
      if (!ev.active) simulation.alphaTarget(0);
      if (d !== undefined) {
        if (d.readOnly) {
          return;
        }
        // if (this.activeButton === 'view') {
        //   this.detectLabels(d);
        // }
        this.detectLabels(d);

        if (this.getCurrentUserRole() === 'edit_inside') {
          const node = ChartUtils.getNodeById(d.id);
          if (node && !_.isEqual(node.labels, dragNode.labels)) {
            d.fx = dragNode.startX;
            d.x = dragNode.startX;

            d.fy = dragNode.startY;
            d.y = dragNode.startY;

            d.labels = dragNode.labels;

            this.event.emit('node.mouseleave', ev, d);
            this.graphMovement();
            return;
          }
        }

        if (!d.fixed) {
          d.x = d.fx || d.x;
          d.y = d.fy || d.y;
          delete d.fx;
          delete d.fy;
        }
      }

      if (Math.abs(moveX) >= 1 || Math.abs(moveY) >= 1) {
        this.oldData.links = Chart.getLinks();
        this.event.emit('node.dragend', ev, d);
      }
    };

    return d3.drag()
      .on('start', dragstart)
      .on('drag', dragged)
      .on('end', dragend);
  }

  static imageManipulation(size, image) {
    d3.select('.controls-group').remove();
    const imageTransform = d3.select(image).attr('transform');
    const controlsGroup = d3.select('.nodes')
      .append('g')
      .attr('class', 'controls-group')
      .attr('transform', imageTransform);
    controlsGroup.append('rect')
      .attr('class', 'move-rect')
      .attr('fill-opacity', '0')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', '2')
      .attr('width', size.width)
      .attr('height', size.height)
      .attr('x', size?.x)
      .attr('y', size?.y);

    const addResizeOption = (classAttr, fillAttr, xAttr, yAttr) => {
      controlsGroup.append('rect')
        .attr('class', classAttr)
        .attr('fill-opacity', '0')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', '2')
        .attr('fill', fillAttr)
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', xAttr)
        .attr('y', yAttr);
    };

    const addRotateOption = (classAttr, fillAttr, xAttr, yAttr) => {
      controlsGroup.append('circle')
        .attr('class', classAttr)
        .attr('stroke', '#6f2409')
        .attr('stroke-width', '2')
        .attr('fill', fillAttr)
        .attr('r', 12)
        .attr('cx', xAttr)
        .attr('cy', yAttr);
    };
    addResizeOption('resize-tl', 'white', size.x - 10, size.y - 10);
    addResizeOption('resize-tr', 'red', size.x + size.width - 10, size.y - 10);
    addResizeOption('resize-bl', 'blue', size.x - 10, size.y + size.height - 10);
    addResizeOption('resize-br', 'yellow', size.x + size.width - 10, size.y + size.height - 10);

    addRotateOption('rotate-tl', 'white', size.x - 20, size.y - 20);
    addRotateOption('rotate-tr', 'red', size.x + size.width + 20, size.y - 20);
    addRotateOption('rotate-bl', 'blue', size.x - 20, size.height + size.y + 20);
    addRotateOption('rotate-br', 'yellow', size.x + size.width + 20, size.height + size.y + 20);

    return controlsGroup;
  }

  static getSource(l) {
    return l.source?.id || l.source || NaN;
  }

  static getTarget(l) {
    return l.target?.id || l.target || NaN;
  }

  static normalizeData(data, param) {
    data.nodes = data.nodes || Chart.getNodes();
    data.links = data.links || _.cloneDeep(Chart.getLinks());
    data.labels = data.labels || Chart.getLabels();
    data.embedLabels = _.cloneDeep(data.embedLabels || this.data?.embedLabels || []);

    if (data.embedLabels.length) {
      data.embedLabels = data.embedLabels.map((label) => {
        data.links = data.links.filter((d) => +d.sourceId !== +label.sourceId);
        const labelNodes = data.nodes.filter((n) => +label.sourceId === +n.sourceId);
        label.nodes = label.nodes.map((d) => {
          d.sourceId = label.sourceId;
          d.readOnly = true;
          if (!labelNodes.some((n) => d.id === n.id)) {
            data.nodes.push(d);
          }
          return d;
        });
        // synchronize links
        label.links = label.links.map((l) => {
          l.sourceId = label.sourceId;
          l.readOnly = true;
          return l;
        });
        data.links.push(...label.links);

        data.labels = data.labels.map((l) => {
          if (l.id === label.label?.id) {
            l.readOnly = true;
            if (label.label.type === 'folder') {
              // todo;
              label.mx = label.label.d[0][0] - l.d[0][0];
              label.my = label.label.d[0][1] - l.d[0][1];
            } else if (l.type === 'ellipse' || l.type === 'square') {
              label.mx = label.label.size.x - l.size.x;
              label.my = label.label.size.y - l.size.y;
            } else {
              label.mx = label.label.d[0][0] - l.d[0][0];
              label.my = label.label.d[0][1] - l.d[0][1];
            }
          }
          return l;
        });

        return label;
      });
      data.links = ChartUtils.uniqueLinks(data.links);
      let removedNodes = false;
      data.nodes = data.nodes.map((d) => {
        if (!d.sourceId) {
          return d;
        }
        d.manually_size = d.manually_size || 1;
        // d.labels = ChartUtils.getNodeLabels(d);

        const labelData = data.embedLabels.find((l) => d.labels?.includes(l.labelId));
        if (!labelData) {
          console.error('can\'t find label', d);
          d.remove = true;
          removedNodes = true;
          return d;
        }

        const labelNode = labelData.nodes.find((n) => n.id === d.id);
        if (!labelNode) {
          // remove deleted nodes
          if (!data.links.some((l) => !l.sourceId && (l.target === d.id || l.source === d.id))) {
            d.remove = true;
            console.log('remove', d);
            removedNodes = true;
          } else {
            d.deleted = true;
          }
          return d;
        }

        // const name = ChartUtils.nodeUniqueName(d);
        // set node right position
        const fx = labelNode.fx - labelData.mx;
        const fy = labelNode.fy - labelData.my;
        return {
          ...labelNode,
          sourceId: d.sourceId,
          readOnly: true,
          fx,
          fy,
          x: fx,
          y: fy,
        };
      });

      // remove unused data
      if (removedNodes) {
        data.nodes = data.nodes.filter((d) => !d.remove);
      }
      data.links = ChartUtils.cleanLinks(data.links, data.nodes);
    } else if (data.nodes.some((d) => d.sourceId)) {
      data.nodes = data.nodes.filter((d) => !d.sourceId);
      data.links = ChartUtils.cleanLinks(data.links, data.nodes);
    }

    _.forEach(data.nodes, (d, i) => {
      d.id = d.id || ChartUtils.uniqueId(data.nodes);
      d.name = d.name || '';
      if (this.isAutoPosition) {
        d.x = d.fx || 0;
        d.y = d.fy || 0;
        delete d.fx;
        delete d.fy;
      } else if (_.isUndefined(d.fx) || _.isUndefined(d.fy)) {
        d.fx = d.x || 0;
        d.fy = d.y || 0;
      }
      data.nodes[i] = Object.create(d);
    });

    let embedLinks = [];

    if (data.embedLabels.length) {
      embedLinks = [].concat.apply(...data.embedLabels.map((e) => e.links));
    }
    // data.embedLabels.map((e) => e.links)[0];

    _.forEach(data.links, (link) => {
      link.id = link.id || ChartUtils.uniqueId(data.links);
      if (param.embeded) {
        _.forEach(embedLinks, (embedLink) => {
          if (link.source === embedLink.source && link.target === embedLink.target) {
            if (embedLink.sx && embedLink.linkType === 'a1') {
              link.sx = embedLink.sx;
              link.sy = embedLink.sy;
              link.tx = embedLink.tx;
              link.ty = embedLink.ty;
            }
          }
        });
      }

      const sameLinks = data.links.filter((l) => (
        ((this.getSource(l) === this.getSource(link) && this.getTarget(l) === this.getTarget(link))
          || (this.getSource(l) === this.getTarget(link) && this.getTarget(l) === this.getSource(link))) && !l.curve
      ));
      if (sameLinks.length) {
        _.forEach(sameLinks, (l, i) => {
          if (l.linkType !== 'a1') {
            const reverse = this.getSource(l) === this.getTarget(link);
            const totalHalf = sameLinks.length / 2;
            const index = i + 1;
            const even = sameLinks.length % 2 === 0;
            const half = Math.floor(sameLinks.length / 2);
            const middleLink = !even && Math.ceil(totalHalf) === index;
            const indexCorrected = index <= totalHalf ? index : index - Math.ceil(totalHalf);

            let arcDirection = index <= totalHalf ? 0 : 1;
            if (reverse) {
              arcDirection = arcDirection === 1 ? 0 : 1;
            }

            let arc = half / (indexCorrected - (even ? 0.5 : 0));

            if (middleLink) {
              arc = 0;
            }

            l.same = {
              arcDirection,
              arc,
            };
          } else {
            l.curve = true;
          }
        });
      }
    });

    const links = Object.values(data.links).map((d) => Object.create(d));

    const lastUid = data.lastUid || this.data?.lastUid || 0;

    // data.labels = data.labels.map((d) => {
    //   if (d.type === 'folder') {
    //     if (!d.d[1]) {
    //       d.d[1] = [500, 500];
    //     }
    //     const fakeId = `fake_${d.id}`;
    //     if (d.open) {
    //       console.log(d)
    //       data.links.forEach((link) => {
    //         if (d.nodes?.includes(link._source)) {
    //           link.source = link._source;
    //           delete link._source;
    //         } else if (d.nodes?.includes(link._target)) {
    //           link.target = link._target;
    //           delete link._target;
    //         }
    //       });
    //     } else {
    //       data.links.forEach((link) => {
    //         if (d.nodes?.includes(link.source)) {
    //           console.log(5555)
    //           link._source = link.source;
    //           link.source = fakeId;
    //           link.fake = true;
    //         } else if (d.nodes?.includes(link.target)) {
    //           link._target = link.target;
    //           link.target = fakeId;
    //           link.fake = true;
    //         }
    //       });
    //     }
    //     console.log(d.nodes);
    //   }
    //   return d;
    // });
    const labels = Object.values(data.labels).map((d) => {
      d.id = d.id || ChartUtils.uniqueId(data.labels);
      d.size = d.size || {
        x: 0, y: 0, width: 0, height: 0,
      };
      return Object.create(d);
    });

    return {
      links, nodes: data.nodes, labels, embedLabels: data.embedLabels, lastUid,
    };
  }

  static getData = () => ({
    links: this.getLinks(),
    nodes: this.getNodes(),
    labels: this.getLabels(),
    embedLabels: this.data.embedLabels,
    lastUid: this.data.lastUid,
  })

  static resizeSvg = () => {
    if (!this.svg) {
      return null;
    }
    const graph = document.querySelector('#graph');
    if (!graph) {
      return null;
    }
    const { width, height } = graph.getBoundingClientRect();
    return this.svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
  }

  static autoPosition() {
    if (this.isAutoPosition) {
      const graph = document.querySelector('#graph');
      if (!graph) {
        return null;
      }
      const { width, height } = graph.getBoundingClientRect();
      this.simulation = this.simulation
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('charge', d3.forceManyBody()
          .strength(-2000)
          .distanceMin(1).distanceMax(2000))
        .force('y', d3.forceY(0.5))
        .force('x', d3.forceX(0.5));
    }
    return true;
  }

  static handleZoom = (ev) => {
    if (this.activeButton === 'create-label' || ev.sourceEvent?.shiftKey) {
      return;
    }
    const { transform } = ev;
    this.wrapper.attr('transform', transform)
      .attr('data-scale', transform.k)
      .attr('data-x', transform.x)
      .attr('data-y', transform.y);
    // mouse cursor
    const mouseCursorPosition = this.svg.select('.mouseCursorPosition');
    mouseCursorPosition.attr('transform', transform)
      .attr('data-scale', transform.k)
      .attr('data-x', transform.x)
      .attr('data-y', transform.y);

    this.event.emit('zoom', ev, { transform });

    this.setAreaBoardZoom(transform);
    if (this.nodesPath) return;
    // this.renderNodeText(transform.k);
    this.renderIcons(transform.k);
    this.renderNodeStatusText(transform.k);
    this.renderNodeMatchText(transform.k);
  }

  static setAreaBoardZoom(transform) {
    const scale = 1 / transform.k;
    const size = 100 * scale;
    const x = transform.x * -1;
    const y = transform.y * -1;

    // this.wrapper.select('.labelsBoard')
    //   .attr('transform', `scale(${scale}) translate(${x}, ${y})`)

    this.wrapper.selectAll('.areaBoard')
      .attr('width', `${size}%`)
      .attr('height', `${size}%`)
      .attr('x', x * scale)
      .attr('y', y * scale);
  }

  static detectLabelsProcess = false;

  static detectLabels(d = null) {
    this.data.nodes = this.data.nodes.map((n) => {
      if (d) {
        if (d.id === n.id) {
          n.labels = ChartUtils.getNodeLabels(n);
        }
      } else {
        n.labels = ChartUtils.getNodeLabels(n);
      }
      return n;
    });
    this._dataNodes = null;
  }

  static renderFolders() {
    const dragFolder = {};
    const handleDragStart = (ev) => {
      if (this.nodesPath) return;
      const { target } = ev.sourceEvent;
      let element = target.closest('.folder');
      if (target.classList.contains('show')) {
        const href = target.getAttribute('href');
        const id = href.replace('#', '');
        element = document.querySelector(`[id="${id}"]`);
      }
      if (element) {
        const id = element.getAttribute('data-id');
        dragFolder.folder = folderWrapper.select(`[data-id="${id}"]`);
        dragFolder.rsize = target.classList.contains('folderResizeIcon');
        dragFolder.nodes = this.getNotesWithLabels().filter((d) => d.labels.includes(id));
        dragFolder.labelLock = this.wrapper.select(`use[data-label-id="${id}"]`);
        dragFolder.move = [0, 0];
      }
    };
    const handleDrag = (ev, d) => {
      if (!dragFolder.folder || dragFolder.folder.empty()) {
        return;
      }

      if (this.nodesPath) return;

      const datum = dragFolder.folder.datum();
      dragFolder.move[0] += ev.dx;
      dragFolder.move[1] += ev.dy;
      if (dragFolder.rsize) {
        if (!datum.d[1]) {
          datum.d[1] = [500, 500];
        }
        if (datum.d[1][0] < 200) datum.d[1][0] = 200;

        if (datum.d[1][1] < 200) datum.d[1][1] = 200;

        // const minX = _.minBy(dragFolder.nodes, 'fx');
        // const maxX = _.maxBy(dragFolder.nodes, 'fx');
        //
        // const minY = _.minBy(dragFolder.nodes, 'fy');
        // const maxY = _.maxBy(dragFolder.nodes, 'fy');
        //
        // const posTopLeft = [minX, minY];
        // const posTopRight = [maxX, minY];
        // const posBottomRight = [maxX, maxY];
        // const posBottomLeft = [minX, maxY];

        datum.d[1][0] = +(datum.d[1][0] + (ev.dx * 2)).toFixed(2);
        datum.d[1][1] = +(datum.d[1][1] + (ev.dy * 2)).toFixed(2);
        const [width, height] = datum.d[1];
        dragFolder.folder.select('rect')
          .datum(datum)
          .attr('x', width / -2)
          .attr('y', height / -2)
          .attr('width', width)
          .attr('height', height);

        dragFolder.folder.select('.folderResizeIcon')
          .attr('x', width / 2 - 25)
          .attr('y', height / 2 - 25);

        dragFolder.folder.select('.closeIcon')
          .attr('x', width / 2 - 40)
          .attr('y', height / -2 + 10);

        dragFolder.folder.select('.folder-name')
          .attr('x', width / -2 + 50)
          .attr('y', height / -2 - 30);

        dragFolder.folder.select('.folderIconSmall')
          .attr('x', width / -2 + 10)
          .attr('y', height / -2 - 50);

        this.undoManager.push(this.getData());
        return;
      }
      datum.d[0][0] = +(datum.d[0][0] + ev.dx).toFixed(2);
      datum.d[0][1] = +(datum.d[0][1] + ev.dy).toFixed(2);

      dragFolder.folder
        .datum(datum)
        .attr('transform', (d) => `translate(${d.d[0][0]}, ${d.d[0][1]})`);

      let readOnlyLabel;
      if (datum.readOnly) {
        readOnlyLabel = this.data.embedLabels.find((l) => l.label.id === datum.id);
      }
      this.node.each((d) => {
        if (dragFolder.nodes.some((n) => n.id === d.id) || readOnlyLabel) {
          if (
            (!d.readOnly && !datum.readOnly)
            || (readOnlyLabel && readOnlyLabel.nodes.some((n) => n.id === d.id))
            || (d.deleted && d.sourceId === datum.sourceId)
          ) {
            d.fx += ev.dx;
            d.fy += ev.dy;

            d.x = d.fx;
            d.y = d.fy;
          }
        }
      });

      this.moveCurveWithLabel(dragFolder, datum, ev);

      if (!dragFolder.labelLock.empty()) {
        let [, x, y] = dragFolder.labelLock.attr('transform').match(/(-?[\d.]+),\s*(-?[\d.]+)/) || [0, 0, 0];
        x = +x + ev.dx;
        y = +y + ev.dy;
        dragFolder.labelLock.attr('transform', `translate(${x}, ${y})`);
      }

      this._dataNodes = undefined;
      this.undoManager.push(this.getData());
      this.graphMovement();
    };
    const handleDragEnd = (ev, d) => {
      // if (this.nodesPath) return;
      if (+dragFolder.move[0].toFixed(3) || +dragFolder.move[1].toFixed(3)) {
        this.event.emit('square.dragend', ev);
      }
      dragFolder.resize = false;
      dragFolder.folder = null;
      dragFolder.move = [0, 0];
      // this.event.emit('label.dragend', ev, d);
    };
    const folderWrapper = d3.selectAll('#graph .folders')
      .call(d3.drag()
        .on('start', handleDragStart)
        .on('drag', handleDrag)
        .on('end', handleDragEnd));

    d3.selectAll('#graph .folderIcons')
      .call(d3.drag()
        .on('start', handleDragStart)
        .on('drag', handleDrag)
        .on('end', handleDragEnd));
    const squareSize = 500;

    folderWrapper.selectAll('.folder > *').remove();

    //
    // const openFolder = d.labels.some((l) => {
    //   const label = ChartUtils.getLabelById(l);
    //   return label.type === 'folder' && label.open;
    // })

    const aaaa = (ev, d) => {
      d.open = false;
      const [x, y] = d.d[0];
      const [width, height] = d.d[1];
      const squareX = x - (width / 2);
      const squareY = y - (height / 2);
      folderWrapper.selectAll(`[data-id="${d.id}"] rect`).remove();
      folderWrapper.selectAll(`[data-id="${d.id}"] .closeIcon`).remove();
      folderWrapper.selectAll(`[data-id="${d.id}"] .folderResizeIcon`).remove();
      folderWrapper.selectAll(`[data-id="${d.id}"] .folderIconSmall`).remove();
      folderWrapper.selectAll(`[data-id="${d.id}"] .folder-name`).remove();
      this.wrapper.select(`[href="#${d.id}"]`).attr('class', 'show');
      folderWrapper.select(`[data-id="${d.id}"]`).attr('class', 'folder folderClose');

      // this.link.filter((n) => {
      //   if (n.source.labels.includes(d.id) && n.target.labels.includes(d.id)) {
      //     return true;
      //   }
      //
      //   return false;
      // }).style('display', 'none');

      this.node
        .filter((n) => {
          const nodeOldFolder = n.labels?.find((l) => l.startsWith('f_'));
          const inLabel = n.labels?.some((l) => !l.startsWith('f_'));
          if ((nodeOldFolder && nodeOldFolder !== d.id) || inLabel) {
            return false;
          }

          return ChartUtils.isInSquare([squareX, squareY], [width, height], [n.fx, n.fy]);
        })
        .attr('class', ChartUtils.setClass(() => ({ hideInFolder: true })));

      this._dataNodes = undefined;
      this.graphMovement();
      this.event.emit('folder.close', ev, d);
    };

    this.folders = folderWrapper.selectAll('.folder')
      .data(this.data.labels.filter((l) => l.type === 'folder' && l.hidden !== 1))
      .join('g')
      .attr('id', (d) => d.id)
      .attr('data-id', (d) => d.id)
      .attr('fill', ChartUtils.labelColors)
      .attr('transform', (d) => `translate(${d.d[0][0]}, ${d.d[0][1]})`)
      .attr('class', (d) => `folder ${d.open ? 'folderOpen' : 'folderClose'}`)
      .on('dblclick', (ev, d) => {
        if (this.activeButton === 'view') {
          toast.info('You are in preview mode');
          return;
        }
        if (this.nodesPath) return;
        if (d.open || document.body.classList.contains('autoSave')) {
          return;
        }
        const [x, y] = d.d[0];
        const [width, height] = d.d[1];

        d.open = true;

        folderWrapper.select(`[data-id="${d.id}"]`).attr('class', 'folder folderOpen');

        const squareX = x - (width / 2);
        const squareY = y - (height / 2);
        this.wrapper.select(`[href="#${d.id}"]`).attr('class', 'hide');
        const moveLabels = {};
        const moveX = (width / 2) + 50;
        const moveY = (height / 2) + 50;

        // this.link.filter((n) => {
        //   if (n.source.labels.includes(d.id) && n.target.labels.includes(d.id)) {
        //     return true;
        //   }
        //
        //   return false;
        // }).style('display', 'inherit');

        // todo optimize
        this.node.each((n, i, nodesArr) => {
          const inFolder = n.labels.includes(d.id);
          const inOtherFolder = !inFolder && n.labels.some((l) => l && l.startsWith('f_'));
          if (inOtherFolder) {
            return;
          }
          if (inFolder) {
            nodesArr[i].classList.remove('hideInFolder');
          }
          const inSquare = ChartUtils.isInSquare([squareX, squareY], [width, height], [n.fx, n.fy]);
          if (inSquare && !inFolder) {
            const labelPosition = n.labels.find((l) => moveLabels[l]);
            let position = labelPosition || ChartUtils.getPointPosition([x, y], [n.fx, n.fy]);
            const labelMove = [width, height];
            if (!labelPosition) {
              n.labels.forEach((l) => {
                if (!l.startsWith('f_')) {
                  // const el = this.wrapper.select(`[data-id="${l}"]`).node().getBoundingClientRect();
                  // if (el) {
                  //   const { scale } = ChartUtils.calcScaledPosition();
                  //   labelMove = [el.width, el.width];
                  // }
                  // moveLabels[l] = {
                  //   labelMove: [moveX, moveY],
                  //   position,
                  // };
                  position = '';
                } else {
                  moveLabels[l] = {
                    labelMove: [moveX, moveY],
                    position,
                    type: 'folder',
                  };
                }
              });
            }
            if (position === 'right') {
              n.fx += moveX;
            }
            if (position === 'left') {
              n.fx -= moveX;
            }
            if (position === 'top') {
              n.fy -= moveY;
            }
            if (position === 'bottom') {
              n.fy += moveY;
            }
            n.x = n.fx;
            n.y = n.fy;
          }
        });

        const renderPath = d3.line()
          .x((d) => d[0])
          .y((d) => d[1])
          .curve(d3.curveBasis);

        _.forEach(moveLabels, (data, l) => {
          const { position, labelMove, type } = data;
          const label = this.wrapper.select(`[data-id="${l}"]`);
          const datum = label.datum();
          datum.d = datum.d.map((p) => {
            if (position === 'right') {
              p[0] = +(p[0] + labelMove[0]).toFixed(2);
            }
            if (position === 'left') {
              p[0] = +(p[0] - labelMove[0]).toFixed(2);
            }
            if (position === 'top') {
              p[1] = +(p[1] - labelMove[1]).toFixed(2);
            }
            if (position === 'bottom') {
              p[1] = +(p[1] + labelMove[1]).toFixed(2);
            }
            return p;
          });

          if (type === 'folder') {
            label.datum(datum)
              .attr('transform', (ld) => `translate(${ld.d[0][0]}, ${ld.d[0][1]})`);
          } else {
            label.datum(datum).attr('d', (ld) => renderPath(ld.d));
          }
        });

        folderWrapper.select(`[data-id="${d.id}"]`)
          .append('rect')
          .attr('class', 'nodeCreate')
          .attr('opacity', 0.6)
          .attr('rx', 15)
          .attr('stroke', (f) => (f.sourceId ? '#000' : null))
          .attr('width', (f) => _.get(f, 'd[1][0]', squareSize))
          .attr('height', (f) => _.get(f, 'd[1][1]', squareSize))
          .attr('x', (f) => _.get(f, 'd[1][0]', squareSize) / -2)
          .attr('y', (f) => _.get(f, 'd[1][1]', squareSize) / -2);

        folderWrapper.select(`[data-id="${d.id}"]`)
          .append('use')
          .attr('href', '#folderCloseIcon')
          .attr('class', 'closeIcon')
          .attr('width', '20')
          .attr('height', '40')
          .attr('fill', '#58595b')
          .attr('x', (f) => _.get(f, 'd[1][0]', squareSize) / 2 - 40)
          .attr('y', (f) => _.get(f, 'd[1][1]', squareSize) / -2 + 10)
          .on('click', aaaa);

        folderWrapper.select(`[data-id="${d.id}"]`)
          .filter((f) => !f.sourceId)
          .append('use')
          .attr('href', '#folderResizeIcon')
          .attr('opacity', 0)
          .attr('width', '150')
          .attr('height', '150')
          .attr('class', 'folderResizeIcon')
          .attr('x', (f) => _.get(f, 'd[1][0]', squareSize) / 2 - 25)
          .attr('y', (f) => _.get(f, 'd[1][1]', squareSize) / 2 - 25);

        this._dataNodes = undefined;
        this.graphMovement();
        this.event.emit('folder.open', ev, d);
      });
    const folderIconsWrapper = d3.select('#graph .folderIcons');
    folderIconsWrapper.selectAll('.folderIcons use')
      .data(this.data.labels.filter((l) => l.type === 'folder'))
      .join('use')
      .attr('class', (d) => (d.open ? 'hide' : 'show'))
      .attr('href', (d) => `#${d.id}`);

    folderWrapper.selectAll('.folder')
      .append('use')
      .attr('href', '#folderIcon')
      .attr('class', 'folderIconUse')
      .attr('width', 60)
      .attr('height', 60);

    folderWrapper.selectAll('.folderOpen')
      .append('rect')
      .attr('class', 'nodeCreate')
      .attr('opacity', 0.6)
      .attr('rx', 15)
      .attr('stroke', (d) => (d.sourceId ? '#000' : null))
      .attr('width', (d) => _.get(d, 'd[1][0]', squareSize))
      .attr('height', (d) => _.get(d, 'd[1][1]', squareSize))
      .attr('x', (d) => _.get(d, 'd[1][0]', squareSize) / -2)
      .attr('y', (d) => _.get(d, 'd[1][1]', squareSize) / -2);

    folderWrapper.selectAll('.folderOpen')
      .append('use')
      .attr('href', '#folderCloseIcon')
      .attr('class', 'closeIcon')
      .attr('width', '40')
      .attr('height', '60')
      .attr('fill', '#58595b')
      .attr('x', (d) => _.get(d, 'd[1][0]', squareSize) / 2 - 40)
      .attr('y', (d) => _.get(d, 'd[1][1]', squareSize) / -2 + 10)
      .on('click', aaaa);

    folderWrapper.selectAll('.folderOpen')
      .append('use')
      .attr('href', '#folderIcon')
      .attr('class', 'folderIconSmall')
      .attr('width', '40')
      .attr('height', '40')
      .attr('fill', '#58595b')
      .attr('x', (d) => _.get(d, 'd[1][0]', squareSize) / -2 + 10)
      .attr('y', (d) => _.get(d, 'd[1][1]', squareSize) / -2 - 50);

    folderWrapper.selectAll('.folderOpen')
      .append('text').text((d) => d.name)
      .attr('width', '20')
      .attr('class', 'folder-name')
      .attr('height', '40')
      .attr('fill', '#58595b')
      .attr('font-size', (d) => 40)
      .attr('x', (d) => _.get(d, 'd[1][0]', squareSize) / -2 + 55)
      .attr('y', (d) => _.get(d, 'd[1][1]', squareSize) / -2 - 30);

    folderWrapper.selectAll('.folderOpen')
      .filter((f) => !f.sourceId)
      .append('use')
      .attr('href', '#folderResizeIcon')
      .attr('width', '150')
      .attr('height', '150')
      .attr('opacity', 0)
      .attr('class', 'folderResizeIcon')
      .attr('x', (d) => _.get(d, 'd[1][0]', squareSize) / 2 - 25)
      .attr('y', (d) => _.get(d, 'd[1][1]', squareSize) / 2 - 25);

    folderWrapper.selectAll('.folderClose')
      .filter((d) => !_.isEmpty(d.nodes))
      .append('text')
      .attr('class', 'folderBadge')

      .text((d) => d.nodes.length);

    this.folders.append('text')
      .text((d) => d.name)
      .attr('y', 75);
  }

  static renderLabels() {
    let activeLine;

    const renderPath = d3.line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveBasis);

    const dragLabel = {};

    let startX;
    let startY;
    let minX;
    let minY;

    const handleDragStart = (ev) => {
      if (this.nodesPath) return;

      if (this.getCurrentUserRole() === 'edit_inside') {
        return;
      }

      switch (this.activeButton) {
        case 'create-label': {
          const id = ChartUtils.uniqueId(this.data.labels);
          activeLine = labelsWrapper.append('path')
            .datum({
              id,
              name: '',
              color: ChartUtils.labelColors({ id }),
              d: [],
            })
            .attr('fill-rule', 'evenodd')
            .attr('class', 'label nodeCreate')
            .attr('data-id', (d) => d.id);

          break;
        }
        case 'create-label-square': {
          const id = ChartUtils.uniqueId(this.data.labels);

          const { x, y } = ev;

          startX = x;
          startY = y;

          activeLine = labelsWrapper.append('rect')
            .datum({
              id,
              name: '',
              color: ChartUtils.labelColors({ id }),
              type: 'square',
              size: {
                x,
                y,
                height: 0,
                width: 0,
              },
            })
            .attr('x', x)
            .attr('y', y)
            .attr('fill-rule', 'evenodd')
            .attr('class', 'label nodeCreate')
            .attr('data-id', (d) => d.id);

          break;
        }
        case 'create-label-ellipse': {
          const id = ChartUtils.uniqueId(this.data.labels);

          const { x, y } = ev;

          startX = x;
          startY = y;

          activeLine = labelsWrapper.append('ellipse')
            .datum({
              id,
              name: '',
              color: ChartUtils.labelColors({ id }),
              type: 'ellipse',
              size: {
                x,
                y,
                height: 0,
                width: 0,
              },
            })
            .attr('cx', x)
            .attr('cy', y)
            .attr('fill-rule', 'evenodd')
            .attr('class', 'label nodeCreate')
            .attr('data-id', (d) => d.id);
          break;
        }
        default: {
          if (!this.activeButton.includes('create-label') && ev.sourceEvent.target.classList.contains('label')) {
            const id = ev.sourceEvent.target.getAttribute('data-id');
            this.detectLabels();
            dragLabel.label = labelsWrapper.select(`[data-id="${id}"]`);
            dragLabel.labelLock = labelsWrapper.select(`use[data-label-id="${id}"]`);
            dragLabel.nodes = this.getNodes().filter((d) => d.labels.includes(id));

            this.oldData.labels = _.cloneDeep(this.getLabels());
          }
          break;
        }
      }
    };

    const handleDrag = (ev) => {
      if (this.nodesPath) return;
      const { x, y } = ev;

      switch (this.activeButton) {
        case 'create-label': {
          const datum = activeLine.datum();
          datum.d.push([+x.toFixed(2), +y.toFixed(2)]);
          activeLine
            .datum(datum)
            .attr('d', (d) => renderPath(d.d))
            .attr('opacity', 1)
            .attr('fill', 'transparent')
            .attr('stroke', '#0D0905')
            .attr('stroke-width', 2);
          break;
        }
        case 'create-label-square': {
          minX = x - startX > 0 ? startX : x;
          minY = y - startY > 0 ? startY : y;

          const datum = activeLine.datum();

          datum.size.x = minX;
          datum.size.y = minY;

          datum.size.width = x - startX > 0 ? x - startX : (x - startX) * -1;
          datum.size.height = y - startY > 0 ? y - startY : (y - startY) * -1;

          activeLine
            .datum(datum)
            .attr('x', (d) => d.size?.x || 0)
            .attr('y', (d) => d.size?.y || 0)
            .attr('width', (d) => d.size?.width || 0)
            .attr('height', (d) => d.size?.height || 0)
            .attr('opacity', 1)
            .attr('fill', 'transparent')
            .attr('stroke', '#0088ff')
            .attr('stroke-width', 2);

          break;
        }
        case 'create-label-ellipse': {
          minX = x - startX > 0 ? startX : x;
          minY = y - startY > 0 ? startY : y;

          const datum = activeLine.datum();

          datum.size.x = minX;
          datum.size.y = minY;

          datum.size.width = x - startX > 0 ? x - startX : (x - startX) * -1;
          datum.size.height = y - startY > 0 ? y - startY : (y - startY) * -1;

          activeLine
            .datum(datum)
            .attr('cx', (d) => d.size?.x || 0)
            .attr('cy', (d) => d.size?.y || 0)
            .attr('rx', (d) => d.size?.width || 0)
            .attr('ry', (d) => d.size?.height || 0)
            .attr('opacity', 1)
            .attr('fill', 'transparent')
            .attr('stroke', '#0088ff')
            .attr('stroke-width', 2);

          break;
        }
        default: {
          if (!this.activeButton.includes('create-label') && dragLabel.label) {
            const datum = dragLabel.label.datum();
            if (datum && datum.d) {
              datum.d = datum.d.map((p) => {
                p[0] = +(p[0] + ev.dx).toFixed(2);
                p[1] = +(p[1] + ev.dy).toFixed(2);
                return p;
              });
              dragLabel.label
                .datum(datum)
                .attr('d', (d) => renderPath(d.d));
            } else {
              datum.size.x = +(datum.size.x + ev.dx).toFixed(2);
              datum.size.y = +(datum.size.y + ev.dy).toFixed(2);

              if (datum.type === 'square') {
                dragLabel.label
                  .datum(datum)
                  .attr('x', (d) => d.size?.x || 0)
                  .attr('y', (d) => d.size?.y || 0);
              } else {
                dragLabel.label
                  .datum(datum)
                  .attr('cx', (d) => d.size?.x || 0)
                  .attr('cy', (d) => d.size?.y || 0);
              }
            }

            if (!dragLabel.labelLock.empty()) {
              let [, x, y] = dragLabel.labelLock.attr('transform').match(/(-?[\d.]+),\s*(-?[\d.]+)/) || [0, 0, 0];
              x = +x + ev.dx;
              y = +y + ev.dy;
              dragLabel.labelLock.attr('transform', `translate(${x}, ${y})`);
            }

            let readOnlyLabel;
            if (datum.readOnly) {
              readOnlyLabel = this.data.embedLabels.find((l) => l.label?.id === datum.id);
            }
            this.node.each((d) => {
              if (dragLabel.nodes.some((n) => n.id === d.id) || readOnlyLabel) {
                if (
                  (!d.readOnly && !datum.readOnly)
                  || (readOnlyLabel && readOnlyLabel.nodes.some((n) => n.id === d.id))
                  || (d.deleted && d.sourceId === datum.sourceId)
                ) {
                  d.fx += ev.dx;
                  d.fy += ev.dy;

                  d.x = d.fx;
                  d.y = d.fy;

                  this.data.nodes[d.index].fx = d.fx;
                  this.data.nodes[d.index].x = d.fx;

                  this.data.nodes[d.index].fy = d.fy;
                  this.data.nodes[d.index].y = d.fy;
                }
              }
            });

            this.moveCurveWithLabel(dragLabel, datum, ev);

            this.graphMovement();

            this.event.emit('label.drag', ev, dragLabel.label);
          }
          break;
        }
      }
    };

    const handleDragEnd = (ev) => {
      if (this.nodesPath) return;

      if (this.activeButton === 'create-label') {
        const datum = activeLine.datum();

        datum.d = ChartUtils.coordinatesCompass(datum.d, 3);

        if (datum.d.length < 4) {
          activeLine.remove();
          activeLine = null;
          return;
        }

        activeLine
          .datum(datum)
          .attr('d', (d) => renderPath(d.d))
          .attr('opacity', 0.4)
          .attr('fill', (d) => d.color)
          .attr('stroke', undefined)
          .attr('stroke-width', undefined);

        this.data.labels.push(datum);
        this.detectLabels();
        activeLine = null;
        this.event.emit('label.new', ev, datum);
        return;
      }

      if (this.activeButton === 'create-label-square') {
        const datum = activeLine.datum();

        activeLine
          .attr('x', minX)
          .attr('y', minY)
          .attr('opacity', 0.4)
          .attr('fill', (d) => d.color)
          .attr('stroke', undefined)
          .attr('stroke-width', undefined);

        this.data.labels.push(datum);
        this.detectLabels();
        activeLine = null;
        this.event.emit('label.new', ev, datum);
        return;
      }

      if (this.activeButton === 'create-label-ellipse') {
        const datum = activeLine.datum();

        activeLine
          .attr('cx', minX)
          .attr('cy', minY)
          .attr('opacity', 0.4)
          .attr('fill', (d) => d.color)
          .attr('stroke', undefined)
          .attr('stroke-width', undefined);

        this.data.labels.push(datum);
        this.detectLabels();
        activeLine = null;
        this.event.emit('label.new', ev, datum);
        return;
      }

      this._dataNodes = null;
      dragLabel.nodes = (dragLabel.nodes || []).map((n) => ChartUtils.getNodeById(n.id));
      this.event.emit('label.dragend', ev, dragLabel);
      dragLabel.label = null;
    };

    const labelsWrapper = d3.select('#graph .labels')
      .call(d3.drag()
        .on('start', handleDragStart)
        .on('drag', handleDrag)
        .on('end', handleDragEnd));

    labelsWrapper.selectAll('.label').remove();

    this.data.labels.map((d) => {
      if (d.hidden !== 1 && d.type !== 'folder') {
        let currentLabel;
        if (d.type === 'square') {
          currentLabel = labelsWrapper
            .append('rect')
            .datum(d)
            .attr('x', d.size?.x || 0)
            .attr('y', d.size?.y || 0)
            .attr('width', d.size?.width || 0)
            .attr('height', d.size?.height || 0);
        } else if (d.type === 'ellipse') {
          currentLabel = labelsWrapper
            .append('ellipse')
            .datum(d)
            .attr('cx', d.size?.x || 0)
            .attr('cy', d.size?.y || 0)
            .attr('rx', d.size?.width || 0)
            .attr('ry', d.size?.height || 0);
        } else {
          currentLabel = labelsWrapper
            .append('path')
            .datum(d)
            .attr('d', renderPath(d.d));
        }

        currentLabel.attr('class', 'label nodeCreate')
          .attr('fill-rule', 'evenodd')
          .attr('opacity', d.sourceId ? 0.6 : 0.4)
          .attr('data-id', d.id)
          .attr('fill', ChartUtils.labelColors)
          .attr('filter', d.sourceId ? 'url(#labelShadowFilter)' : null)
          .on('click', (ev) => this.event.emit('label.click', ev, d))
          .on('mouseenter', (ev) => this.event.emit('label.mouseenter', ev, d))
          .on('mousemove', (ev) => this.event.emit('label.mousemove', ev, d))
          .on('mouseleave', (ev) => this.event.emit('label.mouseleave', ev, d));
      }
    });

    this.labels = labelsWrapper.selectAll('.label');

    this.labelsLock = [];
    setTimeout(() => {
      this.labelsLock = labelsWrapper.selectAll('.labelLock')
        .data(this.data.labels.filter((l) => l.hidden !== 1 && l.status === 'lock'))
        .join('use')
        .attr('data-label-id', (d) => d.id)
        .attr('class', 'labelLock')
        .attr('href', '#labelLock')
        .attr('transform', (d) => {
          if (d.type === 'folder') {
            const [x, y] = d.d[0];
            return `translate(${x + 30}, ${y - 20})`;
          }
          const {
            width, height, left, top,
          } = document.querySelector(`[data-id="${d.id}"]`).getBoundingClientRect();
          const { x, y } = ChartUtils.calcScaledPosition(left + (width / 2) - 20, top + (height / 2) - 20);
          return `translate(${x}, ${y})`;
        });
    }, 10);

    // this.labelMovement();

    this._dataNodes = null;
  }

  static setAutoSave = (autoSave) => {
    this.autoSave = autoSave;
  }

  static render(data = {}, params = {}) {
    try {
      if (!this.isCalled('render')) {
        this.undoManager = new ChartUndoManager();
      }
      this.ignoreAutoSave = params.ignoreAutoSave;

      this.isAutoPosition = !_.isUndefined(params.isAutoPosition) ? params.isAutoPosition : this.isAutoPosition;

      this.graphId = Utils.getGraphIdFormUrl();
      this._dataNodes = null;
      this._dataLinks = null;
      data = this.normalizeData(data, params);

      if (!this.ignoreAutoSave) {
        this.oldData = JSON.parse(JSON.stringify({
          nodes: Chart.getNodes(true, ChartUtils.objectAndProto(data.nodes)),
          links: Chart.getLinks(true, ChartUtils.objectAndProto(data.links)),
          labels: Chart.getLabels(ChartUtils.objectAndProto(data.labels)),
        }));
      }

      if (!params.dontRemember && _.isEmpty(params.filters)) {
        this.undoManager.push(data, params.eventId);
        if (!_.isEmpty(this.data?.nodes) || !_.isEmpty(this.data?.links)) {
          if (!_.isEqual(data, this.data)) {
            this.event.emit('dataChange', this);
          }
        }
      }
      data = ChartUtils.filter(data, params.filters, params.customFields);
      this.data = data;
      if (this.ignoreAutoSave) {
        this.oldData = JSON.parse(JSON.stringify({
          nodes: Chart.getNodes(true, ChartUtils.objectAndProto(data.nodes)),
          links: Chart.getLinks(true, ChartUtils.objectAndProto(data.links)),
          labels: Chart.getLabels(ChartUtils.objectAndProto(data.labels)),
        }));
      }

      this.radiusList = ChartUtils.getRadiusList();
      const filteredLinks = this.data.links.filter((d) => d.hidden !== 1);
      const filteredNodes = this.data.nodes.filter((d) => d.hidden !== 1);
      this.simulation = d3.forceSimulation(this.data.nodes)
        .force('link', d3.forceLink(filteredLinks).id((d) => d.id))
        .on('tick', this.graphMovement);

      this.autoPosition();

      this.svg = d3.select('#graph svg');
      this.zoom = d3.zoom()
        .on('zoom', this.handleZoom)
        .scaleExtent([0.04, 2.5]); // 4% min zoom level to max 250%
      this.svg = this.svg
        .call(this.zoom)
        .on('dblclick.zoom', null)
        .on('click', (...p) => this.event.emit('click', ...p))
        .on('mousemove', (...p) => this.event.emit('mousemove', ...p));

      this.resizeSvg();

      this.wrapper = this.svg.select('.wrapper');
      // this.mouseCursorPosition = this.svg.select('.mouseCursorPosition');

      this.linksWrapper = this.svg.select('.links');

      const listLink = filteredLinks.sort((x, y) => ((x.curve === y.curve) ? 0 : x.curve ? 1 : -1));
      this.link = this.linksWrapper.selectAll('path')
        .data(listLink)
        .join('path')
        .attr('id', (d) => `l${d.index}`)
        .attr('class', (d) => (d.new ? 'emphasisConnection' : ''))
        .attr('stroke-dasharray', (d) => ChartUtils.dashType(d.linkType, d.value || 1))
        .attr('stroke-linecap', (d) => ChartUtils.dashLinecap(d.linkType))
        .attr('stroke', ChartUtils.linkColor)
        .attr('stroke-width', (d) => d.value || 1)
        .attr('marker-end', (d) => (d.direction ? `url(#m${d.index})` : undefined))
        .on('dblclick', (...p) => this.event.emit('link.dblclick', ...p))
        .on('click', (...p) => this.event.emit('link.click', ...p));

      this.renderDirections();
      this.renderLabels();
      this.renderFolders();

      this.nodesWrapper = this.svg.select('.nodes');
      this.node = this.nodesWrapper.selectAll('.node')
        .data(filteredNodes)
        .join('g')
        .attr('class', (d) => {
          const [lx, ly, inFolder] = ChartUtils.getNodePositionInFolder(d);
          return `node ${d.nodeType || 'square'} ${d.new ? 'emphasisIcon' : ''} ${d.icon ? 'withIcon' : ''} ${inFolder ? 'hideInFolder' : ''} ${d.fake ? 'fakeNode' : ''} ${d.hidden === -1 ? 'disabled' : ''} ${d.deleted ? 'deleted' : ''}`;
        })
        .attr('data-i', (d) => d.index)
        .call(this.drag(this.simulation))
        .on('mouseenter', (...p) => this.event.emit('node.mouseenter', ...p))
        .on('mouseleave', (...p) => this.event.emit('node.mouseleave', ...p))
        .on('dblclick', (...p) => this.event.emit('node.dblclick', ...p))
        .on('click', (...p) => this.event.emit('node.click', ...p));

      this.nodesWrapper.selectAll('.node > *').remove();

      this.nodesWrapper.selectAll('.node:not(.infography)')
        .append('rect')
        .attr('rx', 5)
        .attr('ry', 5);

      const infography = this.nodesWrapper.selectAll('.infography');

      infography
        .filter((d) => d.d)
        .append('defs')
        .append('clipPath')
        .attr('id', (d) => `cutOff_${d.id}`)
        .append('path')
        .attr('d', (d) => ChartInfography.renderPath(d.d));

      infography
        .append('rect')
        .attr('width', (d, i, el) =>
          // el[i].setAttribute('opacity', 0);
          // Utils.getInfographyImageWidth(`${d.icon}.large`).then((width) => {
          //   el[i].setAttribute('width', width);
          //   el[i].setAttribute('x', width / -2);
          //   el[i].setAttribute('opacity', 1);
          // });
          512)
        .attr('height', 384)
        .attr('x', 512 / -2)
        .attr('y', 384 / -2)
        .attr('clip-path', (d) => (d.d ? `url(#cutOff_${d.id})` : undefined))
        .attr('transform', (d) => {
          if (!d.d) {
            // return `translate(0 ${384 / -2})`;
            return null;
          }
          const { width, height, min } = ChartInfography.getPolygonSize(d.d);
          const cx = (-1 * min[0]) - (width / 2);
          const cy = -1 * min[1] - height / 2;
          return `translate(${cx} ${cy})`;
        });

      this.nodesWrapper.selectAll('.node > :not(text):not(defs)')
        .filter((d) => d.manually_size > 1)
        .attr('r', (d) => +d.manually_size + 15);

      if (!_.isEmpty(filteredLinks)) {
        const currentLink = filteredLinks[filteredLinks.length - 1];

        if (params === 'createCurve' || (params === 'updateCurve' && currentLink.sx === undefined)) {
          this.curved = true;
          this.renderCurve(currentLink, params);
        }
      }

      this.renderIcons();
      this.renderLinkText(this.data.links);
      this.renderLinkStatusText();
      this.renderNodeText();
      this.renderNodeStatusText();
      this.renderNodeMatchText();
      this.renderNewLink();
      this.renderSelectSquare();
      this.nodeFilter();
      this.windowEvents();
      ChartInfography.render(this);

      this.event.emit('render', this);
      this.event.emit('expandData', this);
      return this;
    } catch (e) {
      console.error(e);
      if (!e.message.startsWith('node not found:')) {
        toast.error(`Chart Error :: ${e.message}`);
      }
      return this;
    }
  }

  static renderCurve(link, curveMode) {
    if (link.linkType !== 'a1') {
      return;
    }
    this.curentLinkIndex = link.index;

    const source = this.data.nodes.filter((d) => d.hidden !== 1).find((p) => p.index === link.source.index);
    const target = this.data.nodes.filter((d) => d.hidden !== 1).find((p) => p.index === link.target.index);

    let scy;
    let tcy;
    let scx;
    let tcx;

    if (curveMode === 'createCurve' || curveMode === 'updateCurve') {
      scy = source.y - 100;
      tcy = target.y - 100;
      scx = source.x;
      tcx = target.x;
    } else {
      scy = link.sy;
      tcy = link.ty;
      scx = link.sx;
      tcx = link.tx;
    }

    this.nodesWrapper
      .append('g')
      .call(this.drag(this.simulation))
      .attr('id', () => 'fcurve')
      .append('circle')
      .attr('class', 'curvedCircle')
      .attr('id', 'sc')
      .attr('r', 9)
      .attr('cx', scx)
      .attr('cy', scy);

    this.nodesWrapper.select('#fcurve')
      .append('line')
      .attr('class', 'curvedLine')
      .attr('id', 'curveLink1')
      .attr('x1', scx)
      .attr('y1', scy)
      .attr('x2', source.x)
      .attr('y2', source.y);

    this.nodesWrapper
      .append('g')
      .call(this.drag(this.simulation))
      .attr('id', 'lcurve')
      .append('circle')
      .attr('class', 'curvedCircle')
      .attr('id', 'tc')
      .attr('r', 9)
      .attr('cx', tcx)
      .attr('cy', tcy);

    this.nodesWrapper.select('#lcurve')
      .append('line')
      .attr('id', 'curveLink2')
      .attr('class', 'curvedLine')
      .attr('x1', tcx)
      .attr('y1', tcy)
      .attr('x2', target.x)
      .attr('y2', target.y);

    // Initial curve line
    this.line = {};
    this.line.l1 = Chart.svg.select('#curveLink1');
    this.line.l2 = Chart.svg.select('#curveLink2');

    this.point = {};

    if (link.sx && link.sy && link.tx && link.ty) {
      this.point.sc = { x: link.sx, y: link.sy };
      this.point.tc = { x: link.tx, y: link.ty };
    } else {
      this.point.sc = { x: scx, y: scy };
      this.point.tc = { x: tcx, y: tcy };
      // Initial curve data
      link.sx = this.point.sc.x;
      link.sy = this.point.sc.y;
      link.tx = this.point.tc.x;
      link.ty = this.point.tc.y;
    }
  }

  static renderSelectSquare() {
    if (this.isCalled('renderSelectSquare')) {
      return;
    }

    this.squareData = {
      selectedNodes: [],
      nodes: [],
      labels: [],
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    };

    let selectSquare;

    const showSelectedNodes = () => {
      this.nodesWrapper.selectAll('.node :not(text)')
        .attr('filter', (n) => (this.squareData.selectedNodes.includes(n.id) ? 'url(#selectedNodeFilter)' : null));
      this.nodesWrapper.selectAll('.node :not(text)')
        .attr('class', (n) => (this.squareData.selectedNodes.includes(n.id) ? 'selectMultyNodes' : null));
    };

    this.event.on('node.click', (ev, d) => {
      if (!ev.shiftKey) {
        return;
      }
      if (this.nodesPath) return;
      const i = this.squareData.selectedNodes.indexOf(d.id);
      if (i > -1) {
        this.squareData.selectedNodes.splice(i, 1);
      } else {
        this.squareData.selectedNodes.push(d.id);
      }

      showSelectedNodes();
    });

    this.event.on('window.keydown', (ev) => {
      if (!ev.shiftKey) {
        return;
      }
      const scale = 1 / (+Chart.wrapper?.attr('data-scale') || 1);
      const x = -1 * (+Chart.wrapper?.attr('data-x') || 0);
      const y = -1 * (+Chart.wrapper?.attr('data-y') || 0);
      const size = scale * 100;
      this.wrapper
        .insert('rect', '.nodes')
        .attr('class', 'selectBoard areaBoard')
        .attr('fill', 'transparent')
        .attr('width', `${size}%`)
        .attr('height', `${size}%`)
        .attr('x', x * scale)
        .attr('y', y * scale)
        .call(d3.drag()
          .on('start', handleDragStart)
          .on('drag', handleDrag)
          .on('end', handleDragEnd));
    });

    this.event.on('window.mousedown', (ev) => {
      if (ev.shiftKey || ev.which === 3) {
        return;
      }
      if (this.nodesPath) return;
      this.wrapper.selectAll('.selectBoard').remove();
      this.wrapper.selectAll('.selectSquare').remove();
      selectSquare = null;
      this.squareData = {
        selectedNodes: [],
        nodes: [],
        labels: [],
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      };
      showSelectedNodes();
    });

    const handleSquareDragStart = () => {
      if (this.nodesPath) return;

      if (selectSquare) {
        let {
          width, height, x, y,
        } = selectSquare.datum();
        if (width < 0) {
          width *= -1;
          x -= width;
        }
        if (height < 0) {
          height *= -1;
          y -= height;
        }
        const allNodes = this.getNodes();
        this.squareData.nodes = allNodes
          .filter((d) => d.fx >= x && d.fx <= x + width && d.fy >= y && d.fy <= y + height);
        this.squareData.labels = this.getLabels()
          .filter((l) => {
            const nodes = this.squareData.nodes.filter((n) => n.labels.includes(l.id));

            const existNodes = allNodes.filter((n) => n.labels.includes(l.id));

            if (l.type === 'folder' && !l.open && this.squareData.nodes.some((n) => n.labels.includes(l.id))) {
              return true;
            }

            if (nodes.length > 0 && (nodes.length === existNodes.length)) {
              return true;
            }
            return false;
          }).map((l) => l.id);

        this.squareData.nodes = this.squareData.nodes.map((d) => d.id);
        this.squareData.width = width;
        this.squareData.height = height;
        this.squareData.x = x;
        this.squareData.y = y;
      }
    };

    const handleSquareDrag = (ev) => {
      if (this.nodesPath) return;

      if (!ev.sourceEvent.shiftKey) {
        return;
      }
      if (selectSquare) {
        const datum = selectSquare.datum();
        datum.x += ev.dx;
        datum.y += ev.dy;
        selectSquare
          .datum(datum)
          .attr('transform', (d) => `translate(${d.x} ${d.y})`);
      }

      this.node.each((d) => {
        if (this.squareData.nodes.includes(d.id) || this.squareData.selectedNodes.includes(d.id)) {
          if (!d.readOnly) {
            d.fx += ev.dx;
            d.x += ev.dx;

            d.fy += ev.dy;
            d.y += ev.dy;
          }
        }
      });

      this.link.data().map((d) => {
        if (this.squareData.nodes.includes(d.source.id) || this.squareData.selectedNodes.includes(d.source.id)) {
          if (this.point) {
            if (d.sx === this.point.sc.x) {
              this.point.sc.x += ev.dx;
              this.point.sc.y += ev.dy;
              this.point.tc.x += ev.dx;
              this.point.tc.y += ev.dy;

              this.wrapper.select('#fcurve').selectAll('circle').attr('cx', this.point.sc.x);
              this.wrapper.select('#fcurve').selectAll('circle').attr('cy', this.point.sc.y);
              this.wrapper.select('#lcurve').selectAll('circle').attr('cx', this.point.tc.x);
              this.wrapper.select('#lcurve').selectAll('circle').attr('cy', this.point.tc.y);
            }
          }

          d.sx += ev.dx;
          d.sy += ev.dy;

          d.tx += ev.dx;
          d.ty += ev.dy;
        }
      });

      this.labels.each((l) => {
        if (this.squareData.labels.includes(l.id) && !l.readOnly) {
          moveLock(l.id, ev.dx, ev.dy);

          if (l.size && (l.type === 'square' || l.type === 'ellipse')) {
            l.size.x = +(l.size.x + ev.dx).toFixed(2);
            l.size.y = +(l.size.y + ev.dy).toFixed(2);
          } else {
            l.d = l.d.map((p) => {
              p[0] = +(p[0] + ev.dx).toFixed(2);
              p[1] = +(p[1] + ev.dy).toFixed(2);
              return p;
            });
          }
        }
        return l;
      });
      this.folders.each((l) => {
        if (this.squareData.labels.includes(l.id) && !l.readOnly) {
          l.d[0][0] = +(l.d[0][0] + ev.dx).toFixed(2);
          l.d[0][1] = +(l.d[0][1] + ev.dy).toFixed(2);

          moveLock(l.id, ev.dx, ev.dy);
        }
        return l;
      }).attr('transform', (d) => `translate(${d.d[0][0]}, ${d.d[0][1]})`);

      this.graphMovement();
      this.labelMovement();
    };

    const handleDragEnd = () => {
      handleSquareDragStart();
    };

    const handleSquareDragEnd = (ev) => {
      if (selectSquare) {
        handleSquareDragStart();
        Chart.event.emit('selected.dragend', ev);
      }
    };

    const handleDragStart = (ev) => {
      if (this.nodesPath) return;

      this.wrapper.select('.selectSquare').remove();
      selectSquare = this.wrapper.append('path')
        .datum({
          width: 0,
          height: 0,
          x: ev.x,
          y: ev.y,
        })
        .attr('class', 'selectSquare')
        .attr('fill', 'transparent')
        .attr('d', (d) => `M 0 0 H ${d.width} V ${d.height} H 0 L 0 0`)
        .attr('transform', (d) => `translate(${d.x} ${d.y})`)
        .call(d3.drag()
          .on('start', handleSquareDragStart)
          .on('drag', handleSquareDrag)
          .on('end', handleSquareDragEnd));
    };
    this.event.on('node.dragstart', handleSquareDragStart);
    this.event.on('node.drag', handleSquareDrag);
    this.event.on('node.dragend', handleSquareDragEnd);

    const moveLock = (id, dx, dy) => {
      const lock = this.svg.select(`use[data-label-id="${id}"]`);

      if (!lock.empty()) {
        let [, x, y] = lock.attr('transform').match(/(-?[\d.]+),\s*(-?[\d.]+)/) || [0, 0, 0];
        x = +x + dx;
        y = +y + dy;
        lock.attr('transform', `translate(${x}, ${y})`);
      }
    };

    const handleDrag = (ev) => {
      if (this.nodesPath) return;

      const datum = selectSquare.datum();
      datum.width += ev.dx;
      datum.height += ev.dy;
      selectSquare
        .datum(datum)
        .attr('d', (d) => `M 0 0 H ${d.width} V ${d.height} H 0 L 0 0`);
    };
  }

  static labelMovement = () => {
    const renderPath = d3.line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveBasis);
    this.labels.attr('d', (d) => {
      if (d && d.d) {
        return renderPath(d.d);
      }
    });

    this.labels.attr('x', (l) => {
      if (l.type === 'square') {
        return l.size?.x;
      }
    });

    this.labels.attr('y', (l) => {
      if (l.type === 'square') {
        return l.size?.y;
      }
    });

    this.labels.attr('cx', (l) => {
      if (l.type === 'ellipse') {
        return l.size?.x;
      }
    });

    this.labels.attr('cy', (l) => {
      if (l.type === 'ellipse') {
        return l.size?.y;
      }
    });
  }

  static graphMovement = () => {
    if (!this.link || !this.link) {
      return;
    }

    const link = this.link.data().find((p) => p.index === this.curentLinkIndex);

    if (this.line !== undefined && link !== undefined && link.linkType === 'a1') {
      if (this.point && this.activeButton !== 'view') {
        link.sx = this.point.sc.x;
        link.sy = this.point.sc.y;
        link.tx = this.point.tc.x;
        link.ty = this.point.tc.y;
      }

      const { source } = link;
      const { target } = link;

      // control curve line 1
      this.line.l1.attr('x1', source.x);
      this.line.l1.attr('y1', source.y);
      this.line.l1.attr('x2', link.sx);
      this.line.l1.attr('y2', link.sy);

      // control curve line 2
      this.line.l2.attr('x1', target.x);
      this.line.l2.attr('y1', target.y);
      this.line.l2.attr('x2', link.tx);
      this.line.l2.attr('y2', link.ty);
    }

    this.link.attr('d', (d) => {
      let arc = 0;
      let arcDirection = 0;
      const { source, target } = d;
      const [targetX, targetY] = ChartUtils.getNodePositionInFolder(target);
      const [sourceX, sourceY] = ChartUtils.getNodePositionInFolder(source);

      if (d.curve) {
        return `M${sourceX},${sourceY} C${d.sx || 0},${d.sy || 0} ${`${d.tx || 0},${d.ty || 0} `}${targetX},${targetY}`;
      }

      if (d.same) {
        const dr = ChartUtils.nodesDistance(d);

        arc = d.same.arc * dr;
        arcDirection = d.same.arcDirection;
      }

      const [centerNodeSource, centerNodeTarget] = this.nodeCenter(source, target);

      const [centerX, centerY] = ChartUtils.linkCenter(sourceX, targetX, centerNodeSource, centerNodeTarget);

      const [sourceOffsetX, sourceOffsetY] = ChartUtils.nodeRadianseCoordinate(source.index, centerX, centerY);

      const [targetOffsetX, targetOffsetY] = ChartUtils.nodeRadianseCoordinate(target.index, centerX, centerY);

      return `M${sourceOffsetX},${sourceOffsetY}
      A${arc},${arc} 0 0,${arcDirection} 
      ${targetOffsetX},${targetOffsetY}`;
    });
    this.node
      .attr('transform', (d) => {
        const [lx, ly] = ChartUtils.getNodePositionInFolder(d);
        let transform = `translate(${lx || d.x || 0}, ${ly || d.y || 0})`;
        if (d.scale && d.nodeType === 'infography') {
          const scaleX = _.get(d, 'scale[0]') || 1;
          const scaleY = _.get(d, 'scale[1]') || 1;
          const rotate = _.get(d, 'scale[2]') || 0;
          transform += ` scale(${scaleX} ${scaleY}) rotate(${0})`;
        }

        return transform;
      })
      .attr('class', ChartUtils.setClass((d) => ({ auto: d.vx !== 0 })));

    this.linkText
      .attr('dy', (d) => (ChartUtils.linkTextLeft(d) ? 17 + +d.value / 2 : (5 + +d.value / 2) * -1))
      .attr('transform', (d) => (ChartUtils.linkTextLeft(d) ? 'rotate(180)' : undefined));

    this.directions
      .attr('dx', 0);

    this._dataNodes = null;
    this._dataLinks = null;
    this._dataLabel = null;
  }

  static renderDirections() {
    const directions = this.wrapper.select('.directions');

    directions.selectAll('text textPath').remove();

    this.directions = directions.selectAll('text')
      .data(this.data.links.filter((d) => d.direction && d.hidden !== 1))
      .join('text')
      .attr('dy', (d) => d.value * 1.8 + 1.55)
      .attr('dx', (d) => {
        let i = this.radiusList[d.target.index] - d.value;
        if (!d.target.icon) {
          i += 4;
        }
        return i * -1;
      })
      .attr('text-anchor', 'end')
      .attr('font-size', (d) => 5 + (d.value * 5))
      .attr('fill', ChartUtils.linkColor)
      .join('text');

    this.directions.append('textPath')
      .attr('startOffset', '100%')
      .attr('href', (d) => `#l${d.index}`)
      .text('➤');
  }

  static renderIcons(scale) {
    const icons = this.wrapper.select('.icons');

    icons.selectAll('defs pattern').remove();

    const defs = icons.selectAll('defs')
      .data(this.data.nodes.filter((d) => d.icon))
      .join('defs')
      .filter((d) => {
        if (scale <= 0.25 && d.nodeType !== 'infography') {
          return false;
        }
        if (scale <= 0.08 && d.nodeType === 'infography') {
          return false;
        }
        // if (this.radiusList[d.index] < 30) {
        //   return false;
        // }
        return true;
      });

    defs.append('pattern')
      .attr('id', (d) => `i${d.index}`)
      .attr('patternUnits', 'objectBoundingBox')
      .attr('height', 1)
      .attr('width', 1)
      .append('image')
      .attr('preserveAspectRatio', (d) => (d.nodeType === 'infography' ? 'xMidYMid meet' : 'xMidYMid slice'))
      .attr('height', (d) => {
        const i = 2;
        if (d.nodeType === 'infography') {
          return 384;
        }
        return (this.radiusList[d.index] + (+d.manually_size || 1)) * i;
      })
      .attr('width', (d) => {
        const i = 2;
        if (d.nodeType === 'infography') {
          return 512;
        }
        return (this.radiusList[d.index] + (+d.manually_size || 1)) * i;
      })
      .attr('xlink:href', (d) => ChartUtils.normalizeIcon(d.icon, d.nodeType === 'infography'));

    this.nodesWrapper.selectAll('.node > :not(text):not(defs)')
      .style('fill', (d) => {
        if (d.icon) {
          if (scale <= 0.25 && d.nodeType !== 'infography') {
            return ChartUtils.nodeColor(d);
          }
          if (scale <= 0.08 && d.nodeType === 'infography') {
            return ChartUtils.nodeColor(d);
          }
          return `url(#i${d.index})`;
        }
      });

    this.nodesWrapper.selectAll('.node > :not(text):not(defs)')
      .attr('stroke', (d) => {
        if (!d.icon) {
          return ChartUtils.nodeColor(d);
        }
      });

    return defs;
  }

  static renderNodeText(param) {
    let scale = param;
    if (!scale && !this.wrapper.empty()) {
      // eslint-disable-next-line no-param-reassign
      scale = +this.wrapper.attr('data-scale') || 1;
    }

    this.nodesWrapper.selectAll('.node text').remove();

    const text = this.nodesWrapper.selectAll('.node')
      .append('text');

    text.data().forEach((d) => {
      const subNames = d.name.match(/.{1,30}/g);

      const nodeText = this.nodesWrapper.selectAll('.node').filter((t) => t.index === d.index)
        .append('text')
        .attr('y', (d) => {
          if (d.nodeType === 'infography') {
            const { height = 384, min = [-384, -384] } = d.d ? ChartInfography.getPolygonSize(d.d) : {};
            const cy = height / 2 + 20;
            return cy;
          }
        });

      subNames.forEach((s) => {
        nodeText.append('tspan')
          .style('fill', '#585858')
          .attr('x', 0)
          .attr('dy', '1.2em')
          .text(s);

        if (!param) {
          const { width, height } = nodeText.node().getBoundingClientRect();

          this.nodesWrapper.selectAll('.node:not(.infography) > rect')
            .filter((f) => f.index === d.index)
            .attr('x', -(width / scale) / 2 - 10)
            .attr('y', 2)
            .attr('width', (width / scale) + 20)
            .attr('height', (height / scale) + 20);
        }
      });
    });
  }

  static renderNodeStatusText(scale) {
    if (!scale && !this.wrapper.empty()) {
      // eslint-disable-next-line no-param-reassign
      scale = +this.wrapper.attr('data-scale') || 1;
    }

    // this.nodesWrapper.selectAll('.node text').remove();

    this.nodesWrapper.selectAll('.node')
      .filter((d) => {
        if (d.status !== 'draft') {
          return false;
        }
        if (scale >= 0.8) {
          return true;
        }
        if (this.radiusList[d.index] < 11) {
          return false;
        }
        return true;
      })
      .append('text')
      .attr('y', 3)
      .attr('x', 3)
      .attr('class', 'draft')
      .attr('font-size', (d) => 20.5 + (this.radiusList[d.index] - (d.icon ? 4.5 : 0)) / 4)
      .text('draft');
  }

  static renderNodeMatchText(scale) {
    if (!scale && !this.wrapper.empty()) {
      // eslint-disable-next-line no-param-reassign
      scale = +this.wrapper.attr('data-scale') || 1;
    }

    // this.nodesWrapper.selectAll('.node text').remove();

    this.nodesWrapper.selectAll('.node')
      .filter((d) => {
        if (!d.new || !d.match) {
          return false;
        }
        if (scale >= 0.8) {
          return true;
        }
        if (this.radiusList[d.index] < 11) {
          return false;
        }
        return true;
      })
      .append('text')
      .attr('y', 3)
      .attr('x', 45)
      .attr('fill', (d) => {
        if (d.match > 90) { return '#19993D'; }
        if (d.match > 70) { return '#007F24'; }
        return '#00FF48';
      })
      .attr('stroke', (d) => {
        if (d.match > 90) { return '#19993D'; }
        if (d.match > 70) { return '#007F24'; }
        return '#00FF48';
      })
      .attr('class', 'match')
      .attr('font-size', (d) => 20.5 + (this.radiusList[d.index] - (d.icon ? 4.5 : 0)) / 4)
      .text((d) => `${d.match}%`);
  }

  static renderLinkText(links = []) {
    const wrapper = this.svg.select('.linkText');
    const linkIndexes = links.map((d) => d.index);
    const linksData = this.data.links.filter((d) => linkIndexes.includes(d.index) || d.total > 1);
    wrapper.selectAll('text textPath').remove();

    this.linkText = wrapper.selectAll('text')
      .data(linksData.filter((d) => d.hidden !== 1))
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('fill', '#585858')
      .attr('dy', (d) => (ChartUtils.linkTextLeft(d) ? 17 + (d.value || 1) / 2 : (5 + (d.value || 1) / 2) * -1))
      .attr('transform', (d) => (ChartUtils.linkTextLeft(d) ? 'rotate(180)' : undefined));

    this.linkText.append('textPath')
      .attr('startOffset', '50%')
      .attr('href', (d) => `#l${d.index}`)
      .text((d) => {
        if (d.total > 1) {
          return ` ${d.total} `;
        }
        if (d.status === 'draft') {
          return `  DRAFT ( ${d.type} ) `;
        }

        return ` ${d.type} `;
      });
    this.link
      .attr('stroke-width', (d) => (linkIndexes.includes(d.index) ? +d.value + 1.5 : +d.value || 1));

    this.directions
      .attr('stroke-width', (d) => (linkIndexes.includes(d.index) ? 0.8 : undefined))
      .attr('stroke', (d) => (linkIndexes.includes(d.index) ? ChartUtils.linkColor(d) : undefined));
  }

  static renderLinkStatusText() {
    return;
    const links = this.getLinks().filter((d) => d.status === 'draft') || [];
    const wrapper = this.svg.select('.linkText');
    const linkIndexes = links.map((d) => d.index);
    const linksData = this.data.links.filter((d) => linkIndexes.includes(d.index));

    this.linkText = wrapper.selectAll('text')
      .data(linksData.filter((d) => d.hidden !== 1))
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('fill', ChartUtils.linkDraftColor)
      .attr('dy', (d) => (ChartUtils.linkTextLeft(d) ? 17 + d.value / 2 : (5 + d.value / 2) * -1))
      .attr('transform', (d) => (ChartUtils.linkTextLeft(d) ? 'rotate(180)' : undefined));

    this.linkText.append('textPath')
      .attr('startOffset', '50%')
      .attr('href', (d) => `#l${d.index}`)
      .style('text-anchor', 'end')
      .text((d) => (d.status === 'draft' ? 'DRAFT' : ` ${d.type} `))
      .attr('font-size', (d) => 20.5);
  }

  static #calledFunctions = [];

  static isCalled = (fn) => {
    if (this.#calledFunctions.includes(fn)) {
      return true;
    }
    this.#calledFunctions.push(fn);
    return false;
  }

  static nodeFilter() {
    if (this.isCalled('nodeFilter')) {
      return;
    }
    let dragActive = false;
    this.event.on('node.drag', () => {
      if (this.nodesPath) return;
      dragActive = true;
    });

    this.event.on('node.dragend', () => {
      if (this.nodesPath) return;

      dragActive = false;
    });

    this.event.on('node.mouseenter', (ev, d) => {
      if (dragActive || ev.shiftKey) return;
      if (!this.nodesPath) {
        const links = this.getNodeLinks(d.id, 'all');
        links.push({ source: d.id, target: d.id });
        const nodeIds = new Set();
        links.forEach((l) => {
          nodeIds.add(l.source);
          nodeIds.add(l.target);
        });

        const hideNodes = this.node.filter((n) => !nodeIds.has(n.id));
        hideNodes.attr('class', ChartUtils.setClass(() => ({ hidden: true })));

        const hideLinks = this.link.filter((n) => !links.some((l) => l.id === n.id));
        hideLinks.attr('class', ChartUtils.setClass(() => ({ hidden: true })));

        const hideDirections = this.directions.filter((n) => !links.some((l) => l.index === n.index));
        hideDirections.attr('class', ChartUtils.setClass(() => ({ hidden: true })));

        this.renderLinkText(links);
      }
    });

    this.event.on('node.mouseleave', () => {
      if (dragActive) return;
      if (!this.nodesPath) {
        this.node.attr('class', ChartUtils.setClass(() => ({ hidden: false })));
        this.link.attr('class', ChartUtils.setClass(() => ({ hidden: false })));
        this.directions.attr('class', ChartUtils.setClass(() => ({ hidden: false })));
        this.renderLinkText(this.data.links);
        this.renderLinkStatusText();
      }
    });
    this.event.on('link.click', (event, ...params) => {
      if (this.nodesPath) return;

      const currentLink = params[0];

      const isEmbed = currentLink.source.readOnly && currentLink.target.readOnly;

      if (isEmbed) {
        return;
      }

      if (currentLink.linkType !== 'a1' || this.activeButton === 'view') {
        return;
      }

      if (this.wrapper.select('#fcurve').node()) {
        this.wrapper.selectAll('#fcurve, #lcurve').remove();
        return;
      }

      this.curved = false;

      this.renderCurve(currentLink);
    });
  }

  static renderNewLink() {
    if (this.wrapper.empty() || !this.wrapper.select('#addNewLink').empty()) {
      return;
    }
    this.newLink = this.wrapper
      .append('line')
      .attr('id', 'addNewLink')
      .attr('data-source', '')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 0);

    let cancel = false;
    this.event.on('node.dblclick', () => {
      if (this.nodesPath) return;

      cancel = true;
      setTimeout(() => {
        cancel = false;
      }, 300);
    });

    this.event.on('node.click', async (ev, d) => {
      if (ev.shiftKey || d.nodeType === 'image') {
        return;
      }
      if (this.nodesPath) return;
      // d3.select('.controls-group').remove();
      await Utils.sleep(10);
      if (this.activeButton !== 'create') {
        return;
      }
      if (cancel) {
        this.newLink.attr('data-source', '')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', 0);
        return;
      }
      const source = this.newLink.attr('data-source');
      if ((d.fx || d.x) === undefined || (d.fy || d.y) === undefined) {
        return;
      }
      if (!source) {
        this.newLink.attr('data-source', d.id)
          .attr('x1', d.fx || d.x)
          .attr('y1', d.fy || d.y)
          .attr('x2', d.fx || d.x)
          .attr('y2', d.fy || d.y);
      } else {
        const target = d.id;
        this.newLink.attr('data-source', '')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', 0);
        if (source === target) {
          return;
        }
        const sourceNode = ChartUtils.getNodeById(source);
        const targetNode = ChartUtils.getNodeById(target);
        if (sourceNode.sourceId && targetNode.sourceId && sourceNode.labels.some((l) => targetNode.labels.includes(l))) {
          return;
        }
        this.event.emit('link.new', ev, {
          source,
          target: d.id,
        });
      }
    });

    this.event.on('click', (ev) => {
      if (!ev.target.parentNode || ev.target.parentNode.classList.contains('node')) {
        return;
      }
      if (this.nodesPath) return;
      // d3.select('.controls-group').remove();
      if (this.wrapper.select('#fcurve').node() && this.curved) {
        setTimeout(() => {
          this.wrapper.selectAll('#fcurve, #lcurve').remove();
        }, 10);
      } else this.curved = !this.curved;
      if (ev.target.tagName !== 'svg') {
        return;
      }
      setTimeout(() => {
        this.newLink.attr('data-source', '')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', 0);
      }, 10);
    });
    this.event.on('mousemove', (ev) => {
      this.curentTarget = ev.target;

      if (ev.x < 250 || ev.y < 70) {
        this.wrapper.selectAll('#fcurve, #lcurve').remove();
      }
      const source = this.newLink.attr('data-source');
      if (this.activeButton !== 'create' || !source) {
        return;
      }
      const { x, y } = ChartUtils.calcScaledPosition(ev.x, ev.y);
      this.newLink.attr('x2', x).attr('y2', y);
    });
  }

  static getScaledPosition(ev) {
    const { x, y } = ev;
    return ChartUtils.calcScaledPosition(x, y);
  }

  static getNodeLinks(nodeId, type = 'target') {
    const links = this.getLinks();
    return links.filter((d) => (type === 'all' ? d.source === nodeId || d.target === nodeId : d[type] === nodeId));
  }

  static getNodeLinksNested(nodeId) {
    let links = this.getNodeLinks(nodeId);
    if (links.length) {
      links.forEach((d) => {
        links = [...links, ...this.getNodeLinksNested(d.target)];
      });
    }
    return links;
  }

  static setNodeData(nodeId, data, forceRender = false) {
    this.data.nodes = this.getNodes().map((d) => {
      if (d.id === nodeId) {
        d = { ...d, ...data };
      }
      return d;
    });
    this._dataNodes = null;
    if (forceRender) {
      this.render();
    }
    this.event.emit('setNodeData', nodeId, data);
  }

  static getNodes(force = false, defaults = []) {
    if (_.isEmpty(this.data?.nodes)) {
      return defaults;
    }
    if (!this._dataNodes || force) {
      this._dataNodes = this.data.nodes.map((d) => ({
        id: d.id,
        index: d.index,
        fx: d.fx || d.x || 0,
        fy: d.fy || d.y || 0,
        name: d.name || '',
        type: d.type || '',
        status: d.status || 'approved',
        nodeType: d.nodeType || 'square',
        description: d.description || '',
        icon: d.icon || '',
        link: d.link || '',
        hidden: d.hidden,
        keywords: d.keywords || [],
        location: d.location || undefined,
        color: d.color,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        createdUser: d.createdUser,
        updatedUser: d.updatedUser,
        readOnly: !!d.readOnly || undefined,
        sourceId: +d.sourceId || undefined,
        labels: ChartUtils.getNodeLabels(d),
        d: d.d,
        scale: d.scale,
        infographyId: d.infographyId,
        manually_size: +d.manually_size || 1,
        fake: d.fake || undefined,
        customFields: d.customFields || [], // {name, value, subTitle, order,}
      }));
    }
    return this._dataNodes;
  }

  // deprecated
  static getNotesWithLabels() {
    this.detectLabels();
    return this.getNodes();
  }

  static getLinks(force = false, defaults = []) {
    if (_.isEmpty(this.data?.links)) {
      return defaults;
    }
    if (!this._dataLinks || force) {
      this._dataLinks = this.data.links.map((d) => {
        const pd = Object.getPrototypeOf(d);
        return {
          id: d.id || ChartUtils.uniqueId(this.data.links), // todo
          index: d.index,
          sx: d.linkType === 'a1' ? d.sx : undefined,
          sy: d.linkType === 'a1' ? d.sy : undefined,
          tx: d.linkType === 'a1' ? d.tx : undefined,
          ty: d.linkType === 'a1' ? d.ty : undefined,
          source: Chart.getSource(pd) || Chart.getSource(d) || '',
          target: Chart.getTarget(pd) || Chart.getTarget(d) || '',
          _source: d._source,
          _target: d._target,
          value: +pd.value || +d.value || 1,
          linkType: pd.linkType || d.linkType || '',
          type: pd.type || d.type || '',
          direction: pd.direction || d.direction || '',
          hidden: pd.hidden || d.hidden,
          color: ChartUtils.linkColor(d),
          createdAt: pd.createdAt,
          updatedAt: pd.updatedAt,
          createdUser: pd.createdUser,
          updatedUser: pd.updatedUser,
          readOnly: pd.readOnly,
          sourceId: +pd.sourceId || undefined,
          status: d.status || 'approved',
          fake: d.fake,
        };
      });
    }
    return this._dataLinks;
  }

  static getLabels(defaults = []) {
    if (_.isEmpty(this.data?.labels)) {
      return defaults;
    }
    return this.data.labels.map((d) => {
      if (d.type === 'square' || d.type === 'ellipse') {
        return {
          id: d.id,
          name: d.name,
          open: d.open,
          color: ChartUtils.labelColors(d),
          size: d.size,
          type: d.type,
          status: d.status || 'unlock',
          sourceId: d.sourceId,
          readOnly: d.readOnly,
          nodes: d.nodes,
        };
      }

      return {
        id: d.id,
        name: d.name,
        open: d.open,
        color: ChartUtils.labelColors(d),
        d: d.d,
        type: d.type,
        status: d.status || 'unlock',
        sourceId: d.sourceId,
        readOnly: d.readOnly,
        nodes: d.nodes,
      };
    });
  }

  static get activeButton() {
    const graphs = d3.select('#graph');
    return graphs ? graphs.attr('data-active') : '';
  }

  static printMode(svgWidth, svgHeight, crop = false, preventInitial = false) {
    const originalDimensions = {
      scale: this.wrapper.attr('data-scale') || 1,
      x: this.wrapper.attr('data-x') || 0,
      y: this.wrapper.attr('data-y') || 0,
    };
    this.wrapper.attr('transform', undefined)
      .attr('data-scale', 1)
      .attr('data-x', 0)
      .attr('data-y', 0);
    this.svg
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .attr('viewBox', [0, 0, svgWidth, svgHeight]);

    if (!document.querySelector('#graph svg')) {
      console.error('graph error');
      return '';
    }

    if (crop) {
      this.wrapper.selectAll('.unChecked')
        .attr('style', 'display:none');
    }

    const {
      left: svgLeft, top: svgTop,
    } = document.querySelector('#graph svg').getBoundingClientRect();

    const {
      left, top, width, height,
    } = document.querySelector('#graph .nodes').getBoundingClientRect();

    const scaleW = svgWidth / (width + 20);
    const scaleH = svgHeight / (height + 20);
    const scale = Math.min(scaleW, scaleH);

    const x = -1 * (left - svgLeft) * scale + ((svgWidth - width * scale) / 2);
    const y = -1 * (top - svgTop) * scale + ((svgHeight - height * scale) / 2);

    Chart.wrapper.attr('transform', `translate(${x}, ${y}), scale(${scale})`)
      .attr('data-scale', scale)
      .attr('data-x', x)
      .attr('data-y', y);

    this.linksWrapper.selectAll('path')
      .attr('fill', 'transparent');

    // this.nodesWrapper.selectAll('.node text')
    //   .attr('font-family', 'Open Sans')
    //   .attr('dominant-baseline', 'middle')
    //   .attr('stroke', 'white')
    //   .attr('fill', '#0D0905')
    //   .attr('text-anchor', 'middle')
    //   .attr('stroke-width', 0);
    //
    // this.nodesWrapper.selectAll('.node :not(text)')
    //   .attr('stroke', 'white')
    //   .attr('stroke-width', 10);
    //
    // this.nodesWrapper.selectAll('.node.withIcon :not(text)')
    //   .attr('stroke-width', 1.5);

    const html = document.querySelector('#graph svg').outerHTML;

    if (!preventInitial) {
      // reset original styles
      const { x: oX, y: oY, scale: oScale } = originalDimensions;
      this.wrapper.attr('transform', `translate(${oX}, ${oY}), scale(${oScale})`)
        .attr('data-scale', oScale)
        .attr('data-x', oX)
        .attr('data-y', oY);
    }

    this.linksWrapper.selectAll('path')
      .attr('fill', undefined);

    this.wrapper.selectAll('.unChecked')
      .attr('style', undefined);

    // this.nodesWrapper.selectAll('.node text')
    //   .attr('font-family', undefined)
    //   .attr('dominant-baseline', undefined)
    //   .attr('stroke', undefined)
    //   .attr('stroke-width', undefined)
    //   .attr('fill', undefined)
    //   .attr('text-anchor', undefined);
    //
    // this.nodesWrapper.selectAll('.node :not(text)')
    //   .attr('stroke', undefined)
    //   .attr('stroke-width', undefined);

    this.resizeSvg();

    return html;
  }

  static windowEvents() {
    if (this.isCalled('windowEvents')) {
      return;
    }
    window.addEventListener('resize', this.resizeSvg);
    window.addEventListener('keydown', this.handleWindowKeyDown);
    window.addEventListener('keyup', this.handleWindowKeyUp);
    window.addEventListener('mousedown', this.handleWindowMouseDown, { capture: true });
  }

  static handleWindowKeyDown = (ev) => {
    ChartUtils.keyEvent(ev);
    this.event.emit('window.keydown', ev);
  }

  static handleWindowKeyUp = (ev) => {
    ChartUtils.keyEvent(ev);
    this.event.emit('window.keyup', ev);
  }

  static handleWindowMouseDown = (ev) => {
    ChartUtils.keyEvent(ev);
    this.event.emit('window.mousedown', ev);
  }

  static unmount() {
    this.svg.remove();
    this.#calledFunctions = [];
    this.data = {
      nodes: [],
      links: [],
      labels: [],
      embedLabels: [],
    };
    this.event.removeAllListeners();
    this.undoManager.reset();
    ChartUtils.resetColors();
    window.removeEventListener('resize', this.resizeSvg);
    window.removeEventListener('keydown', this.handleWindowKeyDown);
    window.removeEventListener('keyup', this.handleWindowKeyUp);
    window.removeEventListener('mousedown', this.handleWindowMouseDown);
  }

  static getCurrentUserRole() {
    const graph = document.querySelector('#graph');
    return graph.getAttribute('data-role');
  }

  static moveCurveWithLabel(dragLabel, datum, ev) {
    this.link.data().map((d) => {
      if (
        (!d.readOnly && !datum.readOnly)
        || (d.readOnly && datum.readOnly && +d.sourceId === +datum.sourceId)
      ) {
        if (dragLabel.nodes.some((n) => n.index === d.source.index || n.index === d.target.index)) {
          if (this.point) {
            if (d.sx === this.point.sc.x) {
              this.point.sc.x += ev.dx;
              this.point.sc.y += ev.dy;
              this.point.tc.x += ev.dx;
              this.point.tc.y += ev.dy;

              this.wrapper.select('#fcurve').selectAll('circle').attr('cx', this.point.sc.x);
              this.wrapper.select('#fcurve').selectAll('circle').attr('cy', this.point.sc.y);
              this.wrapper.select('#lcurve').selectAll('circle').attr('cx', this.point.tc.x);
              this.wrapper.select('#lcurve').selectAll('circle').attr('cy', this.point.tc.y);
            }
          }

          d.sx += ev.dx;
          d.sy += ev.dy;

          d.tx += ev.dx;
          d.ty += ev.dy;
        }
      }
    });
  }

  static showPath(links, nodes) {
    this.nodesPath = true;

    const hideNodes = this.node.filter((n) => !nodes.includes(n.id));
    hideNodes.attr('class', 'shortestData');

    const hideLinks = this.link.filter((n) => !links.some((l) => l.id === n.id));
    hideLinks.attr('class', 'shortestData');

    const hideDirections = this.directions.filter((n) => !links.some((l) => l.id === n.id));
    hideDirections.attr('class', 'shortestData');

    this.renderLinkShortestPath(links, nodes);
  }

  static renderLinkShortestPath(links = [], nodes = []) {
    const wrapper = this.svg.select('.linkText');
    const backgrondChart = this.svg.select('.borderCircle');
    // const linksData = this.data.links;// .filter((d) => links.filter((z) => z.id === d.id).length);

    wrapper.selectAll('text textPath').remove();
    backgrondChart.selectAll('div').attr('class', 'shortestBackground');

    // this.linkText = wrapper.selectAll('text')
    //   .data(linksData.filter((d) => d.hidden !== 1))
    //   .join('text')
    //   .attr('text-anchor', 'middle')
    //   .attr('startOffset', '50%')
    //   .attr('class', 'shortestLinkPath')
    //   .attr('transform', (d) => (ChartUtils.linkTextLeft(d) ? 'rotate(180)' : undefined));

    // this.linkText.append('textPath')
    //   .attr('class', (d) => (links.filter((z) => z.id === d.id).length
    //     ? 'shortestLinkTPath'
    //     : 'shortestInactiveLinkPath'))
    //   .attr('startOffset', '50%')
    //   .attr('href', (d) => `#l${d.index}`)
    //   .text((d) => (d.status === 'draft'
    //     ? `  DRAFT ( ${d.type} ) `
    //     : (links.filter((z) => z.id === d.id).length
    //       ? ` ${d.type}(${d.value}) `
    //       : ` ${d.value} `)));

    this.nodesWrapper.selectAll('.node text')
      .attr('class', 'nodeTextStyle');

    this.nodesWrapper.selectAll('.shortestData text')
      .attr('class', 'nodeInactiveTextStyle');

    this.link
      .attr('stroke', (d) => (links.filter((x) => x.id === d.id).length ? '#2dc126' : d.color))
      .attr('stroke-width', (d) => (links.filter((x) => x.id === d.id).length ? +d.value + 5 : +d.value || 1))
      .attr('class', (d) => (links.filter((x) => x.id === d.id).length ? 'showLinks' : 'showLinksInactive'));

    this.nodesWrapper.selectAll('.node > :not(text):not(defs)')
      .attr('class', (d) => (nodes.includes(d.id) ? 'nodeStyle' : ''));

    this.directions
      .attr('stroke-width', (d) => (links.filter((x) => x.id === d.id).length ? 0.8 : undefined))
      .attr('stroke', (d) => (links.filter((x) => x.id === d.id).length ? ChartUtils.linkColor(d) : undefined));
  }

  static clearLinkShortestPath() {
    this.nodesWrapper.selectAll('.shortestData > *').remove();
  }

  /**
   * check if given nodes are connected with the given link
   * @param {*} fNodeId
   * @param {*} sNodeId
   * @param {*} link
   * @returns bool
   */
  static ifNodesConnected(fNodeId, sNodeId, link) {
    if (link.source.startsWith('fake')) {
      if (link._source === fNodeId && link._target === sNodeId) {
        return true;
      }
      if (link._source === sNodeId && link._target === fNodeId) {
        return true;
      }
      return false;
    }
    if (link.source === fNodeId && link.target === sNodeId) {
      return true;
    }
    if (link.source === sNodeId && link.target === fNodeId) {
      return true;
    }
    return false;
  }

  /**
   * find all links between given nodes
   * @param {*} node
   * @param {*} links
   * @returns array
   */
  static getLinksBetweenNodes(nodes, chosenNodes, links) {
    const nodeCouples = [];
    for (let j = 0; j < chosenNodes.length; j++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let linkIndex = 0; linkIndex < links?.length; linkIndex++) {
          if (this.ifNodesConnected(chosenNodes[j].id, nodes[i].id, links[linkIndex])) {
            nodeCouples.push(links[linkIndex]);
          }
        }
      }
    }
    return nodeCouples;
  }

  /**
   * create mouse cursor
   * @param {*} fullName
   * @param {*} position
   */
  static mouseMovePositions(fullName, position) {
    const mouseCursorPosition = this.svg.select('.mouseCursorPosition');
    // wrapper.selectAll('text').remove();
    mouseCursorPosition
      .append('g')
      .attr('class', 'mouseCursor')
      .attr('fill', '#000')
      .append('use')
      .attr('fill', ChartUtils.cursorColor(fullName))
      .attr('href', '#mouseCursor')
      .attr('width', 25)
      .attr('height', 25)
      .attr('x', position.x)
      .attr('y', position.y);
    mouseCursorPosition
      .append('text')
      .attr('fill', ChartUtils.cursorColor(fullName))
      .attr('x', position.x)
      .attr('y', position.y + 50)
      .attr('width', 50)
      .attr('height', 50)
      .attr('class', 'mouseCursorText')
      .text(fullName);
  }

  /**
   * Remove List
   */
  static cursorTrackerListRemove = () => {
    Chart.svg.select('.mouseCursorPosition').selectAll('g').remove();
    Chart.svg.select('.mouseCursorPosition').selectAll('text').remove();
  }

  static getDimensionsLabelDatum = (datum) => {
    const arrX = datum.map((p) => p[0]);

    const arrY = datum.map((p) => p[1]);

    const minX = Math.min.apply(Math, arrX);

    const maxX = Math.max.apply(Math, arrX);

    const minY = Math.min.apply(Math, arrY);

    const maxY = Math.max.apply(Math, arrY);

    const width = (minX - maxX) * (-1);

    const height = (minY - maxY) * (-1);

    return {
      height, width, minX, minY,
    };
  }

  static showSpecifiedNodes = (nodes) => {
    this.node.attr('class', ChartUtils.setClass(() => ({ hidden: false })));

    const hideNodes = this.node.filter((n) => !nodes.filter((c) => c.id === n.id).length);
    const notHideNodes = this.node.filter((n) => nodes.filter((c) => c.id === n.id).length);
    hideNodes.attr('class', ChartUtils.setClass(() => ({ hidden: true })));
    notHideNodes.attr('r', '30').attr('stroke-width', '20');

    this.link.attr('class', ChartUtils.setClass(() => ({ hidden: true })));

    this.directions.attr('class', ChartUtils.setClass(() => ({ hidden: true })));
  }

  static showAllNodes = () => {
    this.node.attr('class', ChartUtils.setClass(() => ({ hidden: false })));

    this.link.attr('class', ChartUtils.setClass(() => ({ hidden: false })));

    this.directions.attr('class', ChartUtils.setClass(() => ({ hidden: false })));
  }

  /**
   * item can be open or close
   * open node highlight
   * close remove node highlight
   * second param is node index
   * @param item
   * @param index
   */
  static highlight(item, index) {
    const nodes = Chart.nodesWrapper;

    const node = nodes.select(`[data-i="${index}"]`);

    const rect = node.select('rect');

    if (item === 'open') {
      nodes.selectAll('rect').style('stroke-width', '1px');

      rect.style('stroke-width', '3px');
    } else {
      rect.style('stroke-width', '1px');
    }
  }

  static nodeCenter(source, target) {
    const nodeSource = this.node.filter((n) => n.index === source.index);
    const nodeTarget = this.node.filter((n) => n.index === target.index);

    const heightSource = nodeSource.node().getBBox().height;

    const heightTarget = nodeTarget.node().getBBox().height;

    const centerNodeSource = source.y + (heightSource / 2);
    const centerNodeTarget = target.y + (heightTarget / 2);

    return [centerNodeSource, centerNodeTarget];
  }
}

export default Chart;
