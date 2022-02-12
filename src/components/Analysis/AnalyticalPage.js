import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Tooltip from 'rc-tooltip';
import ChartUtils from '../../helpers/ChartUtils';
import Outside from '../Outside';
import AnalysisUtils from '../../helpers/AnalysisUtils';
import AnalyseBarChart from './AnalyseBarChart';
import AnalysePieChart from './AnalysePieChart';
import Chart from '../../Chart';
import LocalNodeAnalyse from './LocalNodeAnalyse';
import AutoPlay from '../AutoPlay';
import Zoom from '../Zoom';
import Button from '../form/Button';
import { ReactComponent as BackSvg } from '../../assets/images/icons/back-arrow.svg';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';

class AnalyticalPage extends Component {
  static propTypes = {
    nodes: PropTypes.object.isRequired,
    links: PropTypes.object.isRequired,
    graphId: PropTypes.string.isRequired,
  }

  constructor() {
    super();
    this.setState({
      localNodeId: null,
    });
  }

  handleNodeClick = (ev, node) => {
    this.setState({
      localNodeId: node.id,
    });

    setTimeout(() => {
      document.getElementsByClassName('analyticRightPage')[0].style.transform = 'scaleY(1)';
    }, 500);

    setTimeout(() => {
      document.getElementsByClassName('close')[0].style.display = 'block';
    }, 700);
  };

  componentDidMount() {
    Chart.event.on('node.click', this.handleNodeClick);

    const graphElement = document.getElementById('graph');
    if (graphElement) {
      graphElement.style.height = '10%';
      graphElement.querySelector('svg').style.height = '100vh';
      graphElement.querySelector('svg').style.width = '55%';
    }
  }

  closeLocalHandle = () => {
    document.getElementsByClassName('analyticRightPage')[0].style.transform = 'scaleY(0)';

    setTimeout(() => {
      this.setState({
        localNodeId: null,
      });
      document.getElementsByClassName('close')[0].style.display = 'none';
    }, 500);
  }

  render() {
    const { nodes, links, graphId } = this.props;

    if (!(nodes && nodes.length && links && links.length)) {
      return <div />;
    }
    ChartUtils.autoScale();
    const {
      min, max, mean, degreeDistribution,
    } = AnalysisUtils.degree(nodes, links);

    // get components
    const { components } = AnalysisUtils.getComponent(nodes, links);

    const clusterCoefficient = AnalysisUtils.getGlobalCluster(nodes, links);

    // const closenessCentrality = AnalysisUtils.getClosenessCentrality(nodes, links);

    return (
      <Outside exclude=".ghModalOverlay,.contextmenuOverlay,.jodit">
        <div className="analyticBottomPage">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeLocalHandle} />
          <Link to={`/graphs/update/${graphId}`} className="analitycBack">
            <Tooltip overlay="Back">
              <Button icon={<BackSvg style={{ height: 30 }} />} className="transparent edit" />
            </Tooltip>
          </Link>

          <div className="analyticContainer">
            <AnalysePieChart nodes={nodes} />
            <AnalyseBarChart degreeDistribution={degreeDistribution} />
            <div className="localAnalyse">
              <div>
                <strong>Number of nodes</strong>
                <h3>{nodes.length}</h3>
                <strong>Number of links</strong>
                <h3>{links.length}</h3>
                <strong>Global clustering coefficient</strong>
                <h3>{clusterCoefficient}</h3>
              </div>
              <div>
                <strong>Min Degree</strong>
                <h3>{min}</h3>
                <strong>Max Degree</strong>
                <h3>{max}</h3>
                <strong>Mean Degree</strong>
                <h3>{mean}</h3>
              </div>
              <div className="componentContainer">
                <strong> Components :</strong>
                <strong>
                  {` ${components.length}`}
                </strong>
                <div className="componentsData" style={{ marginLeft: '25px', marginTop: '10px' }}>
                  {components.map((component, index) => (
                    <h3>
                      {`${index + 1}: Nodes(${component.length})`}
                    </h3>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bottomTool">
            <Zoom />
            <AutoPlay />
          </div>
        </div>
        {this.state?.localNodeId && <LocalNodeAnalyse nodes={nodes} links={links} nodeId={this.state.localNodeId} />}
      </Outside>
    );
  }
}

export default AnalyticalPage;
