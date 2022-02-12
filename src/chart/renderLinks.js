import ChartUtils from '../helpers/ChartUtils';

export default function renderLinks(wrapper, linksData) {
  let links = wrapper.select('.links');
  if (links.empty()) {
    links = wrapper.append('g')
      .attr('class', 'links');
  }
  const link = links.selectAll('line')
    .data(linksData)
    .join('line')
    .attr('data-i', (d) => d.index)
    .attr('stroke-dasharray', (d) => ChartUtils.dashType(d.linkType, d.value || 1))
    .attr('stroke-linecap', (d) => ChartUtils.dashLinecap(d.linkType))
    .attr('stroke', ChartUtils.color())
    .attr('marker-end', (d) => `url(#m${d.index})`)
    .attr('stroke-width', (d) => d.value || 1)
    .on('click', (d) => this.event.emit('link.click', d));

  return link;
}
