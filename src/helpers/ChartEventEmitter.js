import EventEmitter from 'events';

const emitter = new EventEmitter();

class ChartEventEmitter {
  static on = (name, fn) => {
    emitter.on(name, fn);
    return this._remove(name, fn);
  }

  static emit = (name, ...args) => {
    emitter.emit(name, ...args);
  }

  static _remove = (name, fn) => () => {
    emitter.removeListener(name, fn);
  }

  static remove = (name, fn) => {
    emitter.removeListener(name, fn);
  }

  static removeAll = () => {
    emitter.removeAllListeners();
  }
}

export default ChartEventEmitter;
