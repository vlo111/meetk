import React, { Component } from 'react';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Input from '../form/Input';

class SearchGraphs extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  }

  constructor(props) {
    const { s } = queryString.parse(window.location.search);
    super(props);
    this.state = {
      nodes: [],
      text: s || '',
    };
  }

  handleChange = (s = '') => {
    if (!s) {
      this.setState({ text: '' });
      return;
    }
    this.setState({ text: s });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.text) {
      const query = queryString.stringify({ s: this.state.text });
      this.props.history.replace(`/search?${query}`);
    }
  }
 

  render() {
    return (
      <div className="searchInputWrapper">
        <form onSubmit={this.handleSubmit}>
          <Input
            placeholder="Search ..."
            autoComplete="off"
            value={this.state.text}
            icon="fa-search"
            containerClassName="graphSearch"
            onChangeText={this.handleChange}
          />
        </form>
      </div>
    );
  }
}

export default withRouter(SearchGraphs);
