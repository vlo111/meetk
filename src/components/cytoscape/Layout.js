import React from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as CircleSvg } from '../../assets/images/icons/layout-circle.svg';
import { ReactComponent as ConcentricSvg } from '../../assets/images/icons/layout-concentric.svg';
import { ReactComponent as RandomSvg } from '../../assets/images/icons/layout-random.svg';
import { ReactComponent as CoseSvg } from '../../assets/images/icons/layout-cose.svg';
import { ReactComponent as BreadthSvg } from '../../assets/images/icons/layout-breadth.svg';
import { ReactComponent as GridSvg } from '../../assets/images/icons/layout-grid.svg';

const Layout = ({
  cLayout, openGrid, setLayoutOption, row, column, setColumn, setRow,
}) => (
  <div className="layoutBar">
    <div className="layoutWrapper">
      <button
        type="submit"
        className={`layout-btn ${cLayout === 'circle' ? 'selected_circle' : ''}`}
        onClick={() => setLayoutOption('circle')}
      >
        <CircleSvg />
        Circle
      </button>
      <button
        type="submit"
        className={`layout-btn ${cLayout === 'concentric' ? 'selected_circle' : ''}`}
        onClick={() => setLayoutOption('concentric')}
      >
        <ConcentricSvg />
        Concentric
      </button>
      <button
        type="submit"
        className={`layout-btn ${cLayout === 'breadthfirst' ? 'selected-breadth' : ''}`}
        onClick={() => setLayoutOption('breadthfirst')}
      >
        <BreadthSvg />
        Breadthfirst
      </button>
      <button
        type="submit"
        className={`layout-btn ${cLayout === 'cose' ? 'selected' : ''}`}
        onClick={() => setLayoutOption('cose')}
      >
        <CoseSvg />
        Cose
      </button>
      <button
        type="submit"
        className={`layout-btn ${cLayout === 'random' ? 'selected' : ''}`}
        onClick={() => setLayoutOption('random')}
      >
        <RandomSvg />
        Random
      </button>
    </div>
    <div className="gridWrapper">
      <button
        type="submit"
        className={`grid-btn layout-btn ${cLayout === 'grid' ? 'selected' : ''}`}
        onClick={() => setLayoutOption('grid', !openGrid)}
      >
        <GridSvg />
        Grid
      </button>
      {openGrid
          && (
            <div className="grid-settings">
              <button type="submit" className="layout-btn" onClick={() => setRow(row + 1)}>+ 1 row</button>
              <button type="submit" className="layout-btn" onClick={() => setRow(row - 1)}>- 1 row</button>

              <button type="submit" className="layout-btn" onClick={() => setColumn(column + 1)}>+ 1 column</button>
              <button type="submit" className="layout-btn" onClick={() => setColumn(column - 1)}>- 1 column</button>
            </div>
          )}
    </div>
  </div>
);

Layout.propTypes = {
  cLayout: PropTypes.string.isRequired,
  openGrid: PropTypes.bool.isRequired,
  row: PropTypes.number.isRequired,
  column: PropTypes.number.isRequired,
  setLayoutOption: PropTypes.func.isRequired,
  setRow: PropTypes.func.isRequired,
  setColumn: PropTypes.func.isRequired,
};

export default Layout;
