import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';

class FlexTabs extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      marginLeft: 0,
    };
  }

  componentDidMount() {
    this.reduceMargin();
  }

  componentDidUpdate() {
    this.reduceMargin();
  }

  reduceMargin = () => {
    const { marginLeft } = this.state;
    if (this.hasScroll() && marginLeft > -120) {
      //  this.setState({ marginLeft: marginLeft - 5 });
    }
  }

  hasScroll = () => this.ref.scrollLeft + this.ref.clientWidth < this.ref.scrollWidth

  render() {
    const { marginLeft } = this.state;
    return (
      <div className="container-tabs">
        <div className="grid-wrapper" ref={(ref) => this.ref = ref}>
          {Children.map(this.props.children, (child) => (
            child ? (
              <span
                key={child?.key}
                style={{ marginLeft: child?.props.className !== 'empty' ? marginLeft : undefined }}
                title={child?.key}
                className="grid-item"
              >
                {child}
              </span>
            ) : null
          ))}
        </div>

      </div>

    );
  }
}

export default FlexTabs;
