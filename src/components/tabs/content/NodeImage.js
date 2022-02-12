import React, { Component } from 'react';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import Chart from '../../../Chart';
import bgImage from '../../../assets/images/tabDefault.jpg';
import ChartUtils from '../../../helpers/ChartUtils';

class NodeImage extends Component {
    static propTypes = {
      node: PropTypes.object.isRequired,
    }

    constructor(props) {
      super(props);
      this.state = {
        x: -256,
        y: -192,
        clipPath: '',
        width: 0,
        height: 0,
        transform: [],
        fill: [],
      };
    }

    setSvgParams = memoizeOne((node) => {
      if (!Chart.nodesWrapper) {
        return;
      }
      const s = Chart.nodesWrapper.select(`[data-i="${node.index}"] rect`);
      if (s.empty() || !this.wrapper) {
        return;
      }
      const x = +s.attr('x');
      const y = +s.attr('y');
      const clipPath = s.attr('clip-path');
      const fill = s.attr('fill');
      const width = s.attr('width');
      const height = s.attr('height');
      const svgRect = this.wrapper.getBoundingClientRect();

      let scale = 1;
      if (svgRect.width < width) {
        scale = svgRect.width / width + 0.04;
      }
      const transform = `translate(${svgRect.width / 2} ${svgRect.height / 2}) scale(${scale})`;
      this.setState({
        x, y, clipPath, fill, transform, width, height,
      });
    })

    componentDidMount() {
      const { node } = this.props;
      this.setSvgParams(node);
    }

    handleImageError = (ev) => {
      const { node } = this.props;
      if (ev.target.src !== node.icon) {
        ev.target.src = node.icon;
        return;
      } if (ev.target.src !== bgImage) {
        ev.target.src = bgImage;
        return;
      }

      if (this.props.onError) {
        this.props.onError(ev);
      }
    }

    render() {
      const { node, ...props } = this.props;
      const {
        x, y, clipPath, fill, transform, width, height,
      } = this.state;
      const iconSize = props.width !== 50;
      if ((node.nodeType !== 'infography' || !node.d)
          || window.location.pathname.includes('/graphs/update/')) {
        return (
          <img
            src={node.icon ? ChartUtils.normalizeIcon(node.icon, iconSize) : bgImage}
            onError={this.handleImageError}
            alt="node"
            {...props}
          />
        );
      }
      if (this.wrapper) {
        this.setSvgParams(node);
      }
      return (
        <svg
          style={{ width: '100%', backgroundColor: '#F2F4FF' }}
          ref={(ref) => this.wrapper = ref}
          {...props}
        >
          <g>
            <rect width={width} height={height} x={x} y={y} clipPath={clipPath} transform={transform} fill={fill} />
          </g>
        </svg>
      );
    }
}

export default NodeImage;
