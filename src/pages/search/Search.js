import React, { Component } from 'react';
import PropTypes from 'prop-types';
import VerticalTabs from '../../components/PageTabs';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import ScrollButton from '../../components/ScrollButton';
import SearchResult from './SearchResult';
import SearchSharedGraphs from './SearchSharedGraphs';
import SearchPeople from './SearchUsers';
import SearchGraphs from './SearchGraphs';
// import SearchPictures from './SearchPictures';
// import SearchDocuments from './SearchDocuments';

class Search extends Component {
  handleRouteChange = (tab) => { 
     this.props.history.push(tab.to + window.location.search)
  }

  render() {
    return (
      <>
      <Wrapper className="homePage">
        <Header />
        <VerticalTabs
          className="searchPageTabs"
          direction="horizontal"
          handleRouteChange={this.handleRouteChange}
          tabs={[
            { to: '/search', name: 'Search', component: <SearchResult /> },
            { to: '/search-graph', name: 'Graphs', component:<div className='graphsCard'><SearchGraphs /> </div>},
            { to: '/search-shared-graph', name: 'Shared Graphs', component: <div className='graphsCard'> <SearchSharedGraphs /></div> },
            { to: '/search-people', name: 'People', component:<div className='graphsCard'><SearchPeople /></div> },
            // { to: '/search-pictures', name: 'Pictures', component:<div className='graphsCard'> <SearchPictures /></div> },
            // { to: '/search-documents', name: 'Documents', component:<div className='graphsCard'><SearchDocuments /> </div>},
          ]}
        />
        <ScrollButton />
      </Wrapper> 
      </>
    );
  }
}

export default Search;
