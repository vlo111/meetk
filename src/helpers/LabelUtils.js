import _ from 'lodash';
import { toast } from 'react-toastify';
import Chart from '../Chart';
import ChartUtils from './ChartUtils';
import store from '../store';
import CustomFields from './CustomFields';
import { setNodeCustomField } from '../store/actions/graphs';
import Api from '../Api';
import { socketLabelDataChange } from '../store/actions/socket';
import { LABEL_STATUS } from '../data/node';

class LabelUtils {
  static async copy(sourceId, labelId) {
    localStorage.removeItem('label.copy');
    const { data } = await Api.labelCopy(sourceId, labelId);
    localStorage.setItem('label.copy', JSON.stringify(data.data));
    return data;
  }

  static getData() {
    let data;
    try {
      data = JSON.parse(localStorage.getItem('label.copy'));
    } catch (e) {
      //
    }
    return data || {};
  }

  static async past(data, position, isEmbed, graphId) {
    if (!data || !data.label) {
      return {};
    }
    const { x: posX, y: posY } = ChartUtils.calcScaledPosition(position[0], position[1]);

    // label past
    const labels = Chart.getLabels();
    const labelOriginalId = data.label.id;
    let labelId = data.label.id;

    if (isEmbed) {
      if (labels.some((l) => l.id === data.label.id)) {
        toast.info('Label already pasted');
        return {};
      }
      data.label.readOnly = true;
      data.label.sourceId = data.sourceId;
    } else {
      // eslint-disable-next-line no-lonely-if
      if (labels.some((l) => l.color === data.label.color)) {
        delete data.label.color;
        data.label.color = ChartUtils.labelColors(data.label);
      }
      labelId = ChartUtils.uniqueId(labels);
      if (data.label.type === 'folder') {
        labelId = `f_${labelId}`;
      }
      data.label.id = labelId;
    }
    labels.push(data.label);

    let minX = Math.min(...data.label.d.map((l) => l[0]));
    let minY = Math.min(...data.label.d.map((l) => l[1]));

    if (data.label.type === 'folder') {
      minX = data.label.d[0][0];
      minY = data.label.d[0][1];
      data.label.d[0][0] = posX;
      data.label.d[0][1] = posY;
    } else {
      data.label.d = data.label.d.map((i) => {
        i[0] = i[0] - minX + posX;
        i[1] = i[1] - minY + posY;
        return i;
      });
    }

    // nodes past
    let nodes = Chart.getNodes();
    const createNodes = [];
    const updateNodes = [];
    const deleteNodes = [];

    data.nodes.forEach((d) => {
      d.fx = d.fx - minX + posX;
      d.fy = d.fy - minY + posY;
      let id;
      if (d.replace) {
        id = d.id;
      } else if (d.merge) {
        id = nodes.find((n) => n.name === d.name).id;
      } else {
        id = ChartUtils.uniqueId(nodes);
      }

      if (isEmbed) {
        d.readOnly = true;
        d.sourceId = data.sourceId;
        data.links = data.links.map((l) => {
          if (l.source === d.id) {
            l.sx = l.sx - minX + posX;
            l.sy = l.sy - minY + posY;
          } else if (l.target === d.id) {
            l.tx = l.tx - minX + posX;
            l.ty = l.ty - minY + posY;
          }
          return l;
        });
      } else {
        d.labels = d.labels.map((l) => {
          if (l === labelOriginalId) {
            return labelId;
          }
          return l;
        });
        data.links = data.links.map((l) => {
          if (l.source === d.id) {
            l.source = id;
            l.sx = l.sx - minX + posX;
            l.sy = l.sy - minY + posY;
          } else if (l.target === d.id) {
            l.target = id;
            l.tx = l.tx - minX + posX;
            l.ty = l.ty - minY + posY;
          }
          return l;
        });
        d.originalId = d.id;
        d.id = id;
      }

      d.name = (d.replace || d.merge || isEmbed) ? d.name : ChartUtils.nodeUniqueName(d);
      d.labels = [labelId];

      const customField = CustomFields.get(data.customFields, d.type, d.originalId || d.id);
      if (!_.isEmpty(customField)) {
        store.dispatch(setNodeCustomField(d.type, d.id, customField, undefined, d.merge));
      }

      if (d.replace) {
        nodes = nodes.map((n) => {
          if (n.id === d.id) {
            return d;
          }
          return n;
        });
        updateNodes.push(d);
      } else if (d.merge) {
        nodes = nodes.map((n) => {
          if (n.id === d.id) {
            return ChartUtils.merge(d, n);
          }
          return n;
        });
        updateNodes.push(d);
      } else {
        createNodes.push(d);
        nodes.push(d);
      }
    });

    // links past
    let links = Chart.getLinks();
    data.links = data.links.map((d) => {
      if (isEmbed) {
        d.readOnly = true;
        d.sourceId = data.sourceId;
      }
      return d;
    });

    links.push(...data.links);

    if (isEmbed) {
      const { data: res } = await Api.labelShare(data.sourceId, data.label.id, graphId).catch((e) => e.response);
      if (res.status !== 'ok') {
        toast.error(res.message);
        return {};
      }
      const { labelEmbed } = res;
      const embedLabels = _.uniqBy([...Chart.data.embedLabels, labelEmbed], 'id');
      Chart.render({
        links, nodes, labels, embedLabels,
      }, 'past');
      return {
        updateNodes,
        createNodes,
        createLabel: data.label,
        createLinks: data.links,
      };
    }

    links = ChartUtils.cleanLinks(links, nodes);
    links = ChartUtils.uniqueLinks(links);

    Chart.render({ links, nodes, labels }, 'past');
    return {
      updateNodes,
      createNodes,
      createLabel: data.label,
      createLinks: data.links,
    };
  }

  static labelDataChange = (graphId, labelId, force = false) => {
    const label = ChartUtils.getLabelById(labelId);
    if ((label.hasInEmbed && !label.sourceId) || force) {
      const { nodes, links } = ChartUtils.getFilteredGraphByLabel(labelId);
      const graph = {
        nodes, links, sourceId: graphId, label, labelId: label.id, customFields: {},
      };
      store.dispatch(socketLabelDataChange(graph));
    }
  }

  /**
   * Return label status name for label status
   * @param {*} status
   */
  static lableStatusNane = (status = null) => {
    const labelStatus = LABEL_STATUS.filter((c) => c.value === status);
    return labelStatus.length ? labelStatus[0].label : null;
  }
}

export default LabelUtils;
