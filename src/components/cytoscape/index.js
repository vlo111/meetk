import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import ChartUtils from '../../helpers/ChartUtils';
import Layout from './Layout';
import Render from './render';

const Cytoscape = ({ nodes, links, history }) => {
  const [cLayout, setLayout] = useState('circle');
  const [row, setRow] = useState(10);
  const [column, setColumn] = useState(10);
  const [openGrid, setOpenGrid] = useState(false);
  const [cNodes, setCNodes] = useState([]);
  const [cLinks, setCLinks] = useState([]);

  const layout = {
    name: cLayout,
    quality: 'default',
    concentric(node) {
      return node.degree();
    },
    initialEnergyOnIncremental: 0.5,
    idealEdgeLength: 50,
    refresh: 30,
    rows: row,
    columns: column,
    fit: cLayout !== 'layout',
    padding: 100,
    boundingBox: undefined,
    animate: 'end',
    animationDuration: 1500,
    animationEasing: undefined,
    animationThreshold: 250,
    animateFilter(node, i) { return true; },
    ready: undefined,
    stop: undefined,
    transform(node, position) { return position; },
    nodeDimensionsIncludeLabels: false,
    randomize: false,
    componentSpacing: 40,
    nodeRepulsion(node) {
      return 2048;
    },
    nodeOverlap: 4,
    edgeElasticity(edge) {
      return 32;
    },
    nestingFactor: 1.2,
    gravity: 1,
    numIter: 1000,
    initialTemp: 1000,
    coolingFactor: 0.99,
    minTemp: 1.0,
    tile: true,
    tilingPaddingVertical: 10,
    tilingPaddingHorizontal: 10,
    gravityRangeCompound: 1.5,
    gravityCompound: 1.0,
    gravityRange: 3.8,
  };

  const normalize = () => {
    const node = [];
    const link = [];
    nodes.forEach((n) => {
      const color = ChartUtils.nodeColorObj[n.type] || 'red';
      node.push({
        data: { id: n.id, label: n.name, color },
        position: { x: n.fx, y: n.fy },
      });
    });

    links.forEach((l) => {
      if (nodes.filter((p) => ((p.id === l.source) || (p.id === l.target)))[0]) {
        const color = ChartUtils.linkColorObj[l.type] || 'red';
        link.push({
          data: {
            source: l.source,
            target: l.target,
            label: l.type,
            color,
          },
        });
      }
    });

    setCNodes(node);
    setCLinks(link);
  };

  useEffect(() => {
    const queryObj = queryString.parse(window.location.search);

    const query = queryString.stringify(queryObj);

    if (query && query.includes('info=')) {
      const layoutElement = document.querySelector('.layoutBar');

      if (layoutElement) layoutElement.style.right = '300px';
    }

    normalize();
  },
  []);

  return (
    <div className="cytoscape">
      <Layout
        cLayout={cLayout}
        column={column}
        row={row}
        setRow={setRow}
        setColumn={setColumn}
        setLayoutOption={(layoutOption, grid = false) => {
          setLayout(layoutOption);
          setOpenGrid(grid);
        }}
        openGrid={openGrid}
      />
      {nodes.length
        && (
        <Render
          chartNodes={nodes}
          chartLinks={links}
          nodes={cNodes}
          edges={cLinks}
          layout={layout}
          history={history}
          setLayout={setLayout}
        />
        )}
    </div>
  );
};

Cytoscape.defaultProps = {
  nodes: [],
  links: [],
};

Cytoscape.propTypes = {
  nodes: PropTypes.array,
  links: PropTypes.array,
  history: PropTypes.object.isRequired,
};

export default withRouter(Cytoscape);
