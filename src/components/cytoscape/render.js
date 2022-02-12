import React, { useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Chart from '../../Chart';
import { Style } from './Style';
import ChartUtils from '../../helpers/ChartUtils';

const Render = ({
  nodes, edges, layout, history, setLayout,
}) => {
  const cyRef = useRef();

  const cyClick = (evt) => {
    // runs many times
    // myCyRef.add({
    //   group: 'nodes',
    //   data: { weight: 75 },
    //   position: {
    //     x: evt.position.x,
    //     y: evt.position.y,
    //   },
    //   style: { shape: nodeShape },
    // });
  };

  const clearRefs = (...refs) => refs.forEach(
    (ref) => ref.current && ref.current.destroy(),
  );

  useEffect(() => {
    if (cyRef.current) {
      const cy = cyRef.current;

      // cy.on('click', (evt) => {
      //   cyClick(evt);
      //   console.log('Hello');
      // });

      // cy.on('tap', 'node', (evt) => {
      //   const node = evt.target;
      //   // console.log("EVT", evt);
      //   // console.log("TARGET", node.data());
      //   // console.log("TARGET TYPE", typeof node[0]);
      //   console.log('TARGET ID', node.id());
      // });

      let tappedBefore;
      let tappedTimeout;
      cy.on('tap', (event) => {
        const tappedNow = event.target;
        if (tappedTimeout && tappedBefore) {
          clearTimeout(tappedTimeout);
        }
        if (tappedBefore === tappedNow) {
          tappedNow.trigger('doubleTap');
          tappedBefore = null;
        } else {
          tappedTimeout = setTimeout(() => { tappedBefore = null; }, 300);
          tappedBefore = tappedNow;
        }
      });

      cy.on('doubleTap', 'node', (event) => {
        const node = event.target;
        if (node.selected()) {
          setLayout('local');

          const queryObj = queryString.parse(window.location.search);
          queryObj.info = node.id();
          const query = queryString.stringify(queryObj);
          history.replace(`?${query}`);
        }
      });

      // REMOVING
      // cy.on('cxttap', 'node', (evt) => {
      //   const tgt = evt.target || evt.cyTarget; // 3.x || 2.x
      //
      //   tgt.remove();
      // });
      //
      // cy.on('cxttap', 'edge', (evt) => {
      //   const tgt = evt.target || evt.cyTarget; // 3.x || 2.x
      //
      //   tgt.remove();
      // });

      // add new node
      // cy.on('mouseover', 'node', function (evt) {
      //   myCyRef.update()
      //
      //   document.body.style.cursor = 'pointer';
      // } );
      //
      // cy.on('mouseout', 'node', function (evt) {
      //   document.body.style.cursor = 'auto';
      // });

      cy.on('mouseover', 'node', (e) => {
        document.body.style.cursor = 'pointer';

        const sel = e.target;
        cyRef.current.elements().difference(sel.outgoers()).not(sel).addClass('semitransp');
        sel.addClass('highlight');
      });

      cy.on('mouseout', 'node', (e) => {
        document.body.style.cursor = 'auto';

        const sel = e.target;
        cyRef.current.elements().removeClass('semitransp');
        sel.removeClass('highlight');
      });
    }

    return () => {
      clearRefs(cyRef);
    };
  },
  []);

  return (
    <CytoscapeComponent
      stylesheet={Style}
      elements={CytoscapeComponent.normalizeElements({
        nodes,
        edges,
      })}
      style={{
        position: 'absolute', width: window.innerWidth, height: window.innerHeight - 50, top: 50,
      }}
      cy={(cy) => {
        cyRef.current = cy;
        let cyLayout;

        if (layout.name !== 'local') {
          cyLayout = cy.layout(layout);

          cyLayout.run();
        }
      }}
    />
  );
};

Render.defaultProps = {
  nodes: [],
  edges: [],
};

Render.propTypes = {
  nodes: PropTypes.array,
  edges: PropTypes.array,
  layout: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default Render;
