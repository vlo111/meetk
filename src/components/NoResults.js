import React from 'react';
import noResultsSvg from '../assets/images/no_results.svg';

export default function NoResults() {
  return (
    <div className="no-graphs">
      <h1 className="title">No Results ...</h1>
      <img src={noResultsSvg} className="no-graph-img" alt="No Results" />
    </div>
  );
}
