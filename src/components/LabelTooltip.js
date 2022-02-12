import React, { Component } from 'react';
import Chart from '../Chart';
import ContextMenu from './contextMenu/ContextMenu';

class LabelTooltip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: 0,
      label: null,
    };
  }

  componentDidMount() {
    Chart.event.on('label.mouseenter', this.handleMouseEnter);
    Chart.event.on('label.mousemove', this.handleMouseMove);
    Chart.event.on('label.mouseleave', this.handleMouseLeave);
    Chart.event.on('label.drag', this.handleDrag);
    ContextMenu.event.on('label.delete', this.handleLabelDelete);
  }

  componentWillUnmount() {
    Chart.event.removeListener('label.mouseenter', this.handleMouseEnter);
    Chart.event.removeListener('label.mousemove', this.handleMouseMove);
    Chart.event.removeListener('label.mouseleave', this.handleMouseLeave);
    Chart.event.removeListener('label.drag', this.handleDrag);
    ContextMenu.event.removeListener('label.delete', this.handleLabelDelete);
  }

  handleMouseEnter = (ev, d) => {
    const { x, y } = ev;
    this.setState({ label: d, x, y });
  }

  handleMouseMove = (ev) => {
    const { x, y } = ev;
    this.setState({ x, y });
  }

  handleMouseLeave = () => {
    this.setState({ label: null });
  }

  handleLabelDelete = () => {
    this.setState({ label: null });
  }

  handleDrag = () => {
    this.setState({ label: null });
  }

  render() {
    const { label, x, y } = this.state;
    if (!label) {
      return null;
    }
    return (
      <div id="labelTooltip" style={{ backgroundColor: label.color, left: x, top: y }}>
        {label.sourceId ? `Embed: ${label.name}` : label.name}
      </div>
    );
  }
}

export default LabelTooltip;
