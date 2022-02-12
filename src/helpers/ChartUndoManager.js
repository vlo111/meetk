import _ from 'lodash';
import Chart from '../Chart';
import ChartUtils from './ChartUtils';

const MAX_COUNT = 10;

class ChartUndoManager {
  constructor() {
    this.pointer = 0;
    this.data = [];
  }

  reset() {
    this.pointer = 0;
    this.data = [];
  }

  async push(datum, eventId) {
    if (_.isEmpty(datum?.nodes) && _.isEmpty(datum?.links)) {
      return;
    }
    if (_.isEqual(_.last(this.data), datum)) {
      return;
    }
    if (this.data.length > MAX_COUNT - 1) {
      this.data.shift();
    }
    const i = eventId ? this.data.findIndex((d) => d.eventId === eventId) : -1;
    if (i > -1) {
      this.data[i] = _.cloneDeep({ ...datum, eventId });
    } else {
      this.data.push(_.cloneDeep({ ...datum, eventId }));
    }
  }

  undoCount() {
    const count = this.data.length - this.pointer - 1;
    return count < 1 ? 0 : count;
  }

  redoCount() {
    const count = this.pointer;
    return count < 1 ? 0 : count;
  }

  async undo() {
    if (this.pointer + 1 < this.data.length) {
      this.pointer += 1;
    }
    const datum = this.data[this.data.length - this.pointer - 1];
    if (datum) {
      Chart.render(datum, { dontRemember: true });
    }
  }

  async redo() {
    if (this.pointer > 0) {
      this.pointer -= 1;
    }
    const datum = this.data[this.data.length - this.pointer - 1];
    if (datum) {
      Chart.render(datum, { dontRemember: true });
    }
  }
}

export default ChartUndoManager;
