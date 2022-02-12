import _ from 'lodash';
import Chart from '../Chart';

class Convert {
  static nodeDataToCsv(nodes) {
    const nodesArr = nodes.map((d) => ([
      d.name, d.value, d.description, d.files, d.links, d.icon,
    ]));
    nodesArr.unshift(['Name', 'Value', 'Description', 'files', 'Links', 'Icon', 'Color', 'Link']);
    const csv = nodesArr.map((v) => v.map((d) => `"${d}"`).join(',')).join('\n');
    return csv;
  }

  static linkDataToCsv(links) {
    const linksArr = links.map((d) => ([
      d.source, d.target, d.value,
    ]));
    linksArr.unshift(['Source', 'Target', 'Value']);
    const csv = linksArr.map((v) => v.map((d) => `"${d}"`).join(',')).join('\n');
    return csv;
  }

  static chartDataToGridData(data) {
    return data.map((d) => {
      const arr = [];
      _.forEach(d, (value, key) => {
        arr.push({ value, key });
      });
      return arr;
    });
  }

  static nodeDataToGrid(nodes) {
    return nodes.map((d) => ([
      { value: d.index, key: 'index' },
      { value: d.name, key: 'name' },
      { value: d.type, key: 'type' },
      { value: d.description, key: 'description' },
      { value: d.status, key: 'status' },
      { value: d.nodeType, key: 'nodeType' },
      { value: d.icon, key: 'icon' },
      { value: d.link, key: 'link' },
      { value: d.keywords, key: 'keywords' },
      { value: d.location, key: 'location' },
    ]));
  }

  static linkDataToGrid(links) {
    return links.map((d) => ([
      { value: d.index, key: 'index' },
      { value: d.type, key: 'type' },
      { value: d.source, key: 'source' },
      { value: d.target, key: 'target' },
      { value: d.value, key: 'value' },
      { value: d.linkType, key: 'linkType' },
      { value: d.direction, key: 'direction' },
      { value: d.status, key: 'status' },
    ]));
  }

  static gridDataToChartData(data) {
    return data.map((d) => {
      const obj = {};
      d.forEach((item) => {
        obj[item.key] = item.orginalValue ? item.orginalValue : item.value;
      });
      return obj;
    });
  }

  static gridDataToNode(grid, nodes = Chart.getNodes()) {
    const gridObj = this.gridDataToChartData(grid);
    return gridObj.map((g) => ({
      ...nodes.find((d) => +d.index === +g.index),
      ...g,
    }));
  }

  static gridDataToLink(grid, links = Chart.getLinks()) {
    const gridObj = this.gridDataToChartData(grid);
    return gridObj.map((g) => ({
      ...links.find((d) => +d.index === +g.index),
      ...g,
    }));
  }
}

export default Convert;
