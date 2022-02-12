import ChartUtils from '../helpers/ChartUtils';

export default function renderDefs(wrapper, linksData) {
  let directions = wrapper.select('.directions');

  if (directions.empty()) {
    directions = wrapper.append('g')
      .attr('class', 'directions')
      .attr('stroke-opacity', 1);
  }
  const defs = directions.selectAll('defs')
    .data(linksData.filter((d) => d.direction))
    .join('defs');

  defs.selectAll('marker').remove();
  defs.append('marker')
    .attr('id', (d) => `m${d.index}`)
    .attr('orient', 'auto')
    .attr('markerWidth', 5)
    .attr('markerHeight', 5)
    .attr('refY', 2.5)
    .append('path')
    .attr('stroke-width', 0)
    .attr('stroke-opacity', 1)
    .attr('fill', ChartUtils.color())
    .attr('stroke', ChartUtils.color())
    .attr('transform-origin', 'top left')
    .attr('d', 'M 4.980469 2.421875 C 4.964844 2.386719 4.9375 2.359375 4.902344 2.339844 L 0.257812 0.0195312 C 0.171875 -0.0234375 0.0625 0.0117188 0.0195312 0.0976562 C 0.0078125 0.125 0 0.152344 0 0.179688 L 0 4.820312 C 0 4.921875 0.078125 5 0.179688 5 C 0.207031 5 0.234375 4.992188 0.257812 4.980469 L 4.902344 2.660156 C 4.988281 2.617188 5.023438 2.507812 4.980469 2.421875 Z M 4.980469 2.421875');

  return defs;
}
