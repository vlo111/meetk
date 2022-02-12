import React from 'react';
import Utils from '../../helpers/Utils';

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = (props) => {
  const {
    cx,
    cy,
    midAngle,
    outerRadius,
    fill,
    payload,
    percent,
    type,
    value,
    centerText,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 30;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';
  return (
    <g>
      <text x={cx} y={cy} textAnchor="middle" fill={fill}>
        {centerText.title}
      </text>
      <text x={cx} y={cy} dy={20} textAnchor="middle" fill={fill}>
        {centerText.value}
      </text>
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        style={{ fontWeight: 'bold' }}
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill={fill}
      >
        {payload.name}
      </text>
      <text
        className="pieChartLabelText"
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill={fill}
        fontSize="14px"
        xlinkTitle={type}
      >
        {`${Utils.substr(type, 6)}, ${value}, ${parseFloat(percent * 100).toFixed(2)}%`}
      </text>
    </g>
  );
};

const CustomPieChartLabel = React.memo(renderCustomizedLabel);

export default CustomPieChartLabel;
