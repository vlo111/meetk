import React, { useState } from 'react';
import _ from 'lodash';
import Outside from '../Outside';

const GraphOrder = ({
  showFilterModal, toggleDropDown, currentTab, filter,
}) => {
  const localOrder = JSON.parse(localStorage.getItem(currentTab)) || 'newest';

  const [order, setOrder] = useState(localOrder);

  function setFilter(value) {
    localStorage.setItem(currentTab, JSON.stringify(value));

    filter(value);

    setOrder(value);
  }

  return (
    showFilterModal && (
    <div className="filter">
      <Outside onClick={toggleDropDown} exclude=".filter">
        <div className="filter-container">
          <p className="sort-text"> Sort by </p>
          <div className="sortName">
            <p className={localOrder === 'ascending' ? localOrder : ''} onClick={() => setFilter('ascending')}>A to Z</p>
            <p className={localOrder === 'descending' ? localOrder : ''} onClick={() => setFilter('descending')}>Z to A</p>
          </div>
          <div className="sortNewest">
            <p className={localOrder === 'newest' ? localOrder : ''} onClick={() => setFilter('newest')}>Newest First</p>
            <p className={localOrder === 'oldest' ? localOrder : ''} onClick={() => setFilter('oldest')}>Oldest First</p>
          </div>
        </div>
      </Outside>
    </div>
    )
  );
};

export default GraphOrder;
