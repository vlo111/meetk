import React, { Component } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Input from '../form/Input';
import NodeIcon from '../NodeIcon';
import ChartUtils from '../../helpers/ChartUtils';
import Utils from '../../helpers/Utils';

class SearchInput extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
    };
  }

  handleChange = (search = '') => {
    if (!search.trim().toLowerCase()) {
      this.setState({ nodes: [], search });
      return;
    }
    const nodes = ChartUtils.nodeSearch(search, 7);
    this.setState({ nodes, search });
  }

  formatHtml = (text) => {
    const { search } = this.state;
    return text.replace(new RegExp(Utils.escRegExp(search), 'ig'), '<b>$&</b>');
  }

  findNode = (node) => {
    ChartUtils.findNodeInDom(node);
    const queryObj = queryString.parse(window.location.search);
    queryObj.info = node.name;
    const query = queryString.stringify(queryObj);
    this.props.history.replace(`?${query}`);
    this.setState({ nodes: [] });
  }

  render() {
    const { nodes, search } = this.state;
    return (
      <div className="searchInputWrapper">
        <Input
          placeholder="Search ..."
          autoComplete="off"
          value={search}
          icon="fa-search"
          containerClassName="graphSearch"
          onFocus={() => this.handleChange(search)}
          onChangeText={this.handleChange}
        />
        <ul className="list">
          {nodes.map((d) => (
            <li className="item" key={d.index}>
              <div tabIndex="0" role="button" className="ghButton" onClick={() => this.findNode(d)}>
                <div className="left">
                  <NodeIcon node={d} />
                </div>
                <div className="right">
                  <span className="row">
                    <span
                      className="name"
                      dangerouslySetInnerHTML={{ __html: this.formatHtml(d.name) }}
                    />
                    <span
                      className="type"
                      dangerouslySetInnerHTML={{ __html: this.formatHtml(d.type) }}
                    />
                  </span>
                  {!d.name.toLowerCase().includes(search) && !d.type.toLowerCase().includes(search) ? (
                    <span
                      className="keywords"
                      dangerouslySetInnerHTML={{ __html: d.keywords.map((k) => this.formatHtml(k)).join(', ') }}
                    />
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchInput);

export default withRouter(Container);
