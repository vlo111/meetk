import React, { Component } from 'react';
import ReactPaginate from 'react-paginate';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

class Pagination extends Component {
  static propTypes = {
    onPageChange: PropTypes.func,
    history: PropTypes.object.isRequired,
    currentPage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    totalPages: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }

  static defaultProps = {
    onPageChange: undefined,
    currentPage: undefined,
  }

  handleChange = (page) => {
    if (this.props.onPageChange) {
      this.props.onPageChange(page.selected + 1);
      return;
    }
    const queryObj = queryString.parse(window.location.search);
    queryObj.page = page.selected + 1;
    const query = queryString.stringify(queryObj);
    this.props.history.push(`?${query}`);
  }

  render() {
    const { currentPage, totalPages } = this.props;
    const queryObj = queryString.parse(window.location.search);
    if (totalPages < 2) {
      return null;
    }
    return (
      <ReactPaginate
        containerClassName="pagination"
        forcePage={(currentPage || queryObj.page || 1) - 1}
        pageCount={totalPages || 1}
        previousLabel={<i className="fa fa-angle-left" />}
        nextLabel={<i className="fa fa-angle-right" />}
        onPageChange={this.handleChange}
      />
    );
  }
}

export default withRouter(Pagination);
