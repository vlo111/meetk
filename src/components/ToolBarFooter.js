import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { setActiveButton } from '../store/actions/app';
import Chart from '../Chart';
import { ReactComponent as InfoSvg } from '../assets/images/icons/info.svg';
import { ReactComponent as ShowMapSvg } from '../assets/images/icons/show-map.svg';
import { getSingleGraphRequest } from '../store/actions/graphs';

class ToolBarFooter extends Component {
  static propTypes = {
    graphInfo: PropTypes.object.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    graphId: PropTypes.string.isRequired,
    setGraphMode: PropTypes.func.isRequired,
    graphMode: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      totalNodes: 0,
      totalLinks: 0,
      totalLabels: 0,
    };
  }

  componentDidMount() {
    Chart.event.on('expandData', this.expandData);
  }

  componentWillUnmount() {
    Chart.event.on('expandData', this.expandData);
  }

  expandData = (ev) => {
    const nodes = Chart.getNodes(true);
    const links = Chart.getLinks(true);
    const labels = Chart.getLabels();
    this.setState({
      totalNodes: nodes?.length,
      totalLinks: links?.length,
      totalLabels: labels?.length,
    });
  }

  handleClick = (activeButton) => {
    this.props.setActiveButton(activeButton);
  }

  changeElementsDisplay = (selector, param) => {
    const elements = document.querySelectorAll(selector);

    elements.forEach((elem) => {
      elem.style.display = param;
    });
  };

  switchGraphMode = () => {
    const {
      graphId, setGraphMode, graphMode, getSingleGraphRequest,
    } = this.props;

    Chart.loading(true);
    const view = document.querySelector('.cytoscapeBar').innerHTML;
    const viewName = 'Standard view';
    const enriched = 'Enriched view';

    const selector = '.beta, .dashboards, .searchField, #autoPlay, .graphControlPanel, .nodeCreate';

    if (view === enriched) {
      document.querySelector('.cytoscapeBar').innerHTML = viewName;
      this.changeElementsDisplay(selector, 'none');
    } else {
      document.querySelector('.cytoscapeBar').innerHTML = enriched;

      this.changeElementsDisplay(selector, 'flex');

      getSingleGraphRequest(graphId, { viewMode: true });
    }

    setGraphMode(graphMode === 'cytoscape' ? 'd3' : 'cytoscape');

    setTimeout(() => {
      Chart.loading(false);
    }, 200);
  }

  render() {
    const {
      totalNodes, totalLinks, totalLabels,
    } = this.state;
    const {
      graphInfo, graphId, partOf,
    } = this.props;
    const showInMap = Chart.getNodes().some((d) => !_.isEmpty(d?.location));
    const updateLocation = window.location.pathname.startsWith('/graphs/update');

    return (!graphId ? null
      : (
        <>
          <footer id="graphs-data-info" style={updateLocation ? { left: '352px' } : { left: '15px' }}>
            <div
              onClick={() => {
                document.getElementsByClassName('info')[0].style.width = '28';
              }}
              className="info"
            >
              <div
                onClick={() => {
                  const infoElement = document.getElementsByClassName('info')[0];
                  const infoContentElement = infoElement.lastElementChild;

                  if (infoContentElement.style.position === '' || infoContentElement.style.position === 'fixed') {
                    const width = `${infoElement.offsetWidth + infoElement.lastElementChild.offsetWidth + 30}px`;

                    infoContentElement.style.position = 'relative';

                    infoElement.style.width = width;

                    setTimeout(() => {
                      infoContentElement.style.visibility = 'initial';
                    }, 140);
                  } else {
                    infoContentElement.style.position = 'fixed';

                    infoContentElement.style.visibility = 'hidden';

                    infoElement.style.width = '50px';
                  }
                }}
                className="info-icon"
              >
                <InfoSvg />
              </div>
              <div className="info-content">
                <div className="nodesMode">
                  <span>
                    {partOf ? `Nodes (${totalNodes} of ${graphInfo.totalNodes}) ` : `Nodes (${graphInfo.totalNodes || 0})`}
                  </span>
                </div>
                <div className="linksMode">
                  <span>
                    {partOf ? `Links (${totalLinks} of ${graphInfo.totalLinks}) ` : `Links (${graphInfo.totalLinks || 0})`}
                  </span>
                </div>
                <div className="labelsMode">
                  <span>
                    {partOf ? `Labels (${totalLabels} of ${graphInfo.totalLabels}) ` : `Labels (${graphInfo.totalLabels || 0})`}
                  </span>
                </div>
              </div>
            </div>
            {showInMap ? (
              <div onClick={(ev) => this.handleClick('maps-view')} className="mapMode">
                <ShowMapSvg />
                <span>Show on map</span>
              </div>
            ) : null}
            {
              !updateLocation && (
                <>
                  <div
                    onClick={this.switchGraphMode}
                    className="cytoscapeBar"
                  >
                    Enriched view
                  </div>
                  <div className="beta">Beta</div>
                </>
              )
            }
          </footer>
        </>
      )
    );
  }
}

const mapStateToProps = (state) => ({
  graphInfo: state.graphs.graphInfo,
  graphId: state.graphs.singleGraph?.id,
});

const mapDispatchToProps = {
  getSingleGraphRequest,
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToolBarFooter);

export default Container;
