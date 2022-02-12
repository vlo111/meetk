// import { Component } from 'react';

class ReactMemoize {
  static #init = false

  static init = () => {
    if (this.#init) {
      return;
    }
    this.#init = true;

    // const { componentDidMount, componentDidUpdate } = Component.prototype;
    // Component.prototype.componentDidMount = (...args) => {
    //   if (Component.prototype.componentDidRender) {
    //     Component.prototype.componentDidRender(...args);
    //   }
    //   componentDidMount(...args);
    // };
    // Component.prototype.componentDidUpdate = (...args) => {
    //   if (Component.prototype.componentDidRender) {
    //     Component.prototype.componentDidRender(...args);
    //   }
    //   componentDidUpdate(...args);
    // };
  }
}

ReactMemoize.init();

export default ReactMemoize;
