import React, { Component } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Sector,
} from 'recharts';
import CustomPieChartLabel from './CustomPieChartLabel';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';

class AnalyticalPage extends Component {
  constructor() {
    super();

    this.setState({
      effectPie: null,
    });
  }

  onShowPartPie = (data, index) => {
    const {
      color, type, value, percent,
    } = data;

    this.setState({
      effectPie: index,
    });

    const footerPie = document.getElementsByClassName('selectedText')[0];
    const footerPieCircle = document.getElementsByClassName('dot')[0];

    const resultPie = footerPie.getElementsByTagName('span');

    footerPie.innerHTML = `
                           <p>Type:    </p><span> ${type} </span>
                           <p>Count:   </p><span> ${value} </span>
                           <p>Percent: </p><span> ${parseFloat(percent * 100).toFixed(2)}%</span>`;

    for (let i = 0; i < resultPie.length; i++) {
      resultPie[i].style.color = color;
    }

    footerPieCircle.style.display = 'inline-block';
    footerPieCircle.style.backgroundColor = color;

    const piePart = document.getElementsByClassName(`partPie_${index}`)[0];

    if (piePart) piePart.style.transition = 'all 0.4s ease-in-out 0s';
  }

  onClosePartPie = () => {
    this.setState({
      effectPie: null,
    });

    Chart.showAllNodes();

    document.getElementsByClassName('selectedText')[0].innerHTML = '';

    document.getElementsByClassName('dot')[0].style.display = 'none';
  }

  renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      midAngle,
      type,
      color,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius - 80) * cos;
    const sy = cy + (outerRadius - 80) * sin;
    Chart.showSpecifiedNodes(Chart.getNodes().filter((p) => p.type === type));
    return (
      <Sector
        cx={sx}
        cy={sy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={color || ChartUtils.nodeColorObj[type]}
      />
    );
  };

  render() {
    const { nodes } = this.props;

    const typeData = nodes.map((p) => ({
      name: p.name,
      type: p.type,
      color: p.color,
    }));

    const groupTypes = _.groupBy(typeData, 'type');

    const types = [];

    Object.keys(groupTypes).forEach((l) => {
      const currentType = groupTypes[l];
      types.push({ type: currentType[0].type, count: currentType.length, color: currentType[0].color });
    });

    return (
      <div className="pieChart">
        <div className="headerPie">
          <h4>Node types</h4>
        </div>
        <div className="piePanel" onMouseLeave={this.onClosePartPie}>
          <ResponsiveContainer>

            <PieChart
              margin={{
                top: 0,
              }}
            >
              <Pie
                isAnimationActive={false}
                data={types}
                className="pie_part"
                activeIndex={this.state?.effectPie}
                dataKey="count"
                cx="50%"
                cy="50%"
                labelLine
                label={<CustomPieChartLabel centerText={500} />}
                outerRadius={100}
                activeShape={this.renderActiveShape}
                onClick={this.onShowPartPie}
              >
                {types.map((entry, index) => (
                  <Cell
                    className={`partPie_${index}`}
                    key={`cell-${index}`}
                    fill={entry.color || ChartUtils.nodeColorObj[entry.type]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="footerPie">
          <span className="dot" />
          <span className="selectedText" />
        </div>
      </div>
    );
  }
}

export default AnalyticalPage;
