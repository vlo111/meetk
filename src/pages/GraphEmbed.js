import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Wrapper from '../components/Wrapper';
import ReactChart from '../components/chart/ReactChart';
import Tabs from '../components/tabs';
import LabelTooltip from '../components/LabelTooltip';
import Chart from '../Chart';
import ChartUtils from '../helpers/ChartUtils';
import AutoPlay from '../components/AutoPlay';
import Zoom from '../components/Zoom';
import Filters from '../components/filters/Filters';
import { getSingleEmbedGraphRequest } from '../store/actions/graphs';
import { setActiveButton } from '../store/actions/app';

class GraphEmbed extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    getSingleEmbedGraphRequest: PropTypes.func.isRequired,
  }

  async componentDidMount() {
    const { match: { params: { graphId, token } } } = this.props;
    this.props.setActiveButton('view');
    const { payload } = await this.props.getSingleEmbedGraphRequest(graphId, token);
    ChartUtils.autoScale();
    if (payload?.status === 404) {
      this.props.history.push('/404');
    }
  }

  render() {
    return (
      <Wrapper auth={false} className="graphView" showFooter={false}>
        <div className="graphWrapper">
          <ReactChart />
        </div>
        <div className="embedTab">
          <Tabs editable={false} />
        </div>
        <LabelTooltip />
        <Filters />
        <AutoPlay />
        <Zoom />
      </Wrapper>
    );
  }
}

const mapStateToProps = () => ({});
const mapDispatchToProps = {
  getSingleEmbedGraphRequest,
  setActiveButton,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphEmbed);

export default Container;
