import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import ReactChart from '../components/chart/ReactChart';
import { getSingleGraphPreviewRequest } from '../store/actions/graphs';
import Chart from '../Chart';

class GraphThumbnail extends Component {
  static propTypes = {
    getSingleGraphPreviewRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
  }

  async componentDidMount() {
    const { match: { params: { graphId, userId } } } = this.props;
    const { token } = queryString.parse(window.location.search);
    await this.props.getSingleGraphPreviewRequest(graphId, userId, token);
    setTimeout(() => {
      Chart.printMode(1092, 480, true, true);
    }, 0);
  }

  render() {
    return (
      <div className="graphView">
        <div className="graphWrapper">
          <ReactChart />
        </div>
      </div>
    );
  }
}

const mapStateToProps = () => ({});
const mapDispatchToProps = {
  getSingleGraphPreviewRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphThumbnail);

export default Container;
