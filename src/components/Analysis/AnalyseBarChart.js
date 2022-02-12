import React, { Component } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList,
} from 'recharts';
import Chart from '../../Chart';

class AnalyticalPage extends Component {
    showAllNodes = () => {
      Chart.showAllNodes();
    }

    render() {
      const { degreeDistribution } = this.props;

      const showDegree = [];

      if (degreeDistribution) {
        Object.keys(degreeDistribution).forEach((p) => {
          showDegree.push({
            degree: p,
            count: degreeDistribution[p].length,
          });
        });
      }

      const CustomTooltip = ({ active, label }) => {
        if (!degreeDistribution) return <div />;
        if (active) {
          const textDegree = [];

          const nodes = degreeDistribution[label]?.length;

          Object.keys(degreeDistribution).forEach((p) => {
            if (p === label) {
              Chart.showSpecifiedNodes(degreeDistribution[p]);
              degreeDistribution[p].map((l) => textDegree.push({
                name: l.name,
                color: l.color,
              }));
            }
          });
          return (
            <div className="custom-tooltip">
              <div>
                <span>
                  {nodes}
                  {' '}
                  Nodes of
                  {' '}
                  {label}
                  {' '}
                  Degrees
                </span>
              </div>
            </div>
          );
        }

        return null;
      };

      const renderCustomizedLabel = (props) => {
        const {
          x, y, width, value,
        } = props;
        const radius = 10;

        return (
          <g>
            <circle cx={x + width / 2} cy={y - radius} r={radius + 4} fill="white" />
            <text x={x + width / 2} y={y - radius} fill="#8884d8" textAnchor="middle" dominantBaseline="middle">
              {value}
            </text>
          </g>
        );
      };

      return (
        <div className="containerBarChart" onMouseLeave={this.showAllNodes}>
          <div className="headerTextDegreeBlock">
            <h4>Degree Distribution</h4>
          </div>
          <div className="barContainer">
            <div className="leftTextDegreeBlock">
              <h4>Count</h4>
            </div>
            <ResponsiveContainer>
              <BarChart
                width={500}
                height={300}
                data={showDegree}
                margin={{
                  top: 50, right: 30, left: 20, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="degree" />
                <YAxis dataKey="count" />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  isAnimationActive={false}
                  dataKey="count"
                  barSize={20}
                  fill="#8884d8"
                >
                  <LabelList dataKey="count" content={renderCustomizedLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bottomTextDegreeBlock">
            <h4>Degree</h4>
          </div>
        </div>
      );
    }
}

export default AnalyticalPage;
