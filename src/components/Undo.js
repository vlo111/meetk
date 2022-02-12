import React, { Component } from 'react';
import Button from './form/Button';
import { ReactComponent as UndoSvg } from '../assets/images/icons/Undo_back.svg';
import { ReactComponent as UndoBackSvg } from '../assets/images/icons/Redo.svg';
import Chart from '../Chart';
import ContextMenu from './contextMenu/ContextMenu';
import ChartUtils from '../helpers/ChartUtils';
import { KEY_CODES } from '../data/keyCodes';

class Undo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      undoCount: 0,
      redoCount: 0,
    };
  }

  componentDidMount() {
    Chart.event.on('render', this.handleChartRender);
    ContextMenu.event.on('undo', this.handleUndo);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    Chart.event.removeListener('render', this.handleChartRender);
    ContextMenu.event.removeListener('undo', this.handleUndo);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (ev) => {
    ChartUtils.keyEvent(ev);
    if (ev.chartEvent && ev.ctrlPress && (ev.keyCode === KEY_CODES.undo_code || ev.keyCode === KEY_CODES.redo_code) && !ev.altKey) {
      if (ev.shiftKey) {
        Chart.undoManager.redo();
      } else if (ev.keyCode === KEY_CODES.redo_code) {
        Chart.undoManager.redo();
      } else {
        Chart.undoManager.undo();
      }
    }
  }

  handleUndo = () => {
    Chart.undoManager.undo();
  }

  handleChartRender = () => {
    this.setState({
      undoCount: Chart.undoManager.undoCount(),
      redoCount: Chart.undoManager.redoCount(),
    });
  }

  render() {
    const { undoCount, redoCount } = this.state;
    return (
      <div className="undoWrapper" id="undoWrapper">
        <div className="info-content">
          <Button
            onClick={() => Chart.undoManager.undo()}
            className="undo"
            icon={<UndoSvg />}
            disabled={!undoCount}
          >
            {undoCount}
          </Button>
          <Button
            onClick={() => Chart.undoManager.redo()}
            className="undoBack"
            icon={<UndoBackSvg />}
            disabled={!redoCount}
          >
            {redoCount}
          </Button>
        </div>

      </div>
    );
  }
}

export default Undo;
