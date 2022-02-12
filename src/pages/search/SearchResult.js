import React, { Component } from 'react';
import SearchGraphs from './SearchGraphs';
import SearchSharedGraphs from './SearchSharedGraphs';
import SearchUsers from './SearchUsers';
// import SearchPictures from './SearchPictures';
// import SearchDocuments from './SearchDocuments';

class SearchResult extends Component {
  render() {
    return (
      <div className="graphsCard">
        <SearchGraphs setLimit />
        <SearchSharedGraphs setLimit />
        <SearchUsers setLimit />
        {/* <SearchPictures setLimit />
        <SearchDocuments setLimit /> */}
      </div>
    );
  }
}

export default SearchResult;
