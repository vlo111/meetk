import React from 'react';
import PropTypes from 'prop-types';
import Wrapper from './Wrapper';
import Header from './Header';

const PageConatiner = React.memo(({ children }) => (
  <Wrapper>
    <Header />
    { children }
  </Wrapper>
));

PageConatiner.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PageConatiner;
