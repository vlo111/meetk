import React, { Component } from 'react';
import AnalysisUtils from '../../helpers/AnalysisUtils';

class AnalyticalPage extends Component {
  render() {
    const { nodes, links, nodeId } = this.props;
    const {
      generalDegree, sideDegree, inDegree, outDegree,
    } = AnalysisUtils.getLocalDegree(nodes, links, nodeId);

    const adjacentNodes = AnalysisUtils.getAdjacentNodes(generalDegree, nodeId);

    let clusterCoefficient;

    const triangles = AnalysisUtils.getTriangles(links, adjacentNodes);

    if (!triangles) {
      clusterCoefficient = 0;
    } else {
      clusterCoefficient = parseFloat(AnalysisUtils.getCluster(triangles, adjacentNodes.length).toFixed(5));
    }

    return (
      <div className="analyticRightPage">
        <div className="container">
          <div>
            <strong>
              {`Node name: ${nodes.filter((p) => p.id === nodeId)[0].name}`}
            </strong>
          </div>
          <div>
            <strong>
              {`Adjacent nodes: ${adjacentNodes.length}`}
            </strong>
          </div>
          <div>
            <strong>
              {`Degree of the node: ${generalDegree.length}`}
            </strong>
          </div>
          <div>
            <strong>
              {`B-Side: ${sideDegree.length}`}
            </strong>
          </div>
          <div>
            <strong>
              {`In degree: ${inDegree.length}`}
            </strong>
          </div>
          <div>
            <strong>
              {`Out degree: ${outDegree.length}`}
            </strong>
          </div>
          <div>
            <strong>
              {`Local Clustering Coefficients: ${clusterCoefficient}`}
            </strong>
          </div>
        </div>
      </div>
    );
  }
}

export default AnalyticalPage;
