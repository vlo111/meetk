import React, { Component } from 'react';

class Checkbox extends Component {
    static id = 0;

    constructor(props) {
      super(props);
      this.constructor.id += 1;
      this.id = this.constructor.id;
    }

    render() {
      const { id, label, ...props } = this.props;

      const inputId = id || `checkbox_${this.id}`;

      if (label) {
        return (
          <div className="checkWithLabel">
            <div className="check-box">
              <input id={inputId} className="input-check" style={{ display: 'none' }} type="checkbox" {...props} />
              <label htmlFor={inputId} />
            </div>
            <label className="check-label" htmlFor={inputId}>{label}</label>
          </div>
        );
      }

      return (
        <div className="check-box">
          <input id={inputId} className="input-check" style={{ display: 'none' }} type="checkbox" {...props} />
          <label htmlFor={inputId} />
        </div>
      );
    }
}

export default Checkbox;
