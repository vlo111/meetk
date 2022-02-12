import _ from 'lodash';
import { toast } from 'react-toastify';
import {
  CLEAR_SINGLE_GRAPH,
  UPDATE_SINGLE_GRAPH,
  CONVERT_GRAPH,
  GET_GRAPHS_LIST,
  GET_GRAPHS_SHAREGRAPHS_COUNT,
  GET_NODES_LIST,
  GET_SINGLE_GRAPH,
  GET_ALL_TABS,
  SET_NODE_CUSTOM_FIELD,
  ADD_NODE_CUSTOM_FIELD_KEY,
  REMOVE_NODE_CUSTOM_FIELD_KEY,
  ACTIONS_COUNT,
  GET_SINGLE_EMBED_GRAPH,
  SET_GRAPH_CUSTOM_FIELDS,
  GET_SINGLE_GRAPH_PREVIEW,
  UPDATE_GRAPH,
  REMOVE_NODE_FROM_CUSTOM_FIELD,
  RENAME_NODE_CUSTOM_FIELD_KEY,
  SET_ACTIVE_TAB,
  GET_NODE_CUSTOM_FIELDS,
  GET_GRAPH_INFO,
  ACTIVE_MOUSE_TRACKER,
  UPDATE_GRAPH_THUMBNAIL,
  GET_NODES_LIST_DATA,
} from '../actions/graphs';
import CustomFields from '../../helpers/CustomFields';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';
import { SOCKET_ACTIVE_MOUSE_TRACKER } from '../actions/socket';
import { UPDATE_NODES_CUSTOM_FIELDS } from '../actions/nodes';
import { ONLINE_USERS } from '../actions/app';
import { GET_GRAPH_QUERY, UPDATE_GRAPH_QUERY, DELETE_GRAPH_QUERY } from '../actions/query';

const { REACT_APP_MAX_NODE_AND_LINK } = process.env;

export const initialState = {
  importData: {},
  graphsList: [],
  graphNodes: [],
  graphsListStatus: '',
  singleGraphStatus: '',
  singleGraph: {},
  graphInfo: {},
  graphFilterInfo: {},
  embedLabels: [],
  graphsListInfo: {
    totalPages: 0,
  },
  allGraghsCount: {
    totalGraphs: 0,
    totalShareGraphs: 0,
  },
  nodesListInfo: {
    totalPages: 0,
  },
  actionsCount: {},
  nodeCustomFields: [],
  activeTab: '_description',
  graphTabs: [],
  graphTabsStatus: '',
  mouseTracker: false,
  mouseMoveTracker: [],
  onlineUsers: [],
  trackers: [],
  query: [],
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_GRAPH.REQUEST:
    case UPDATE_GRAPH.FAIL: {
      return {
        ...state,
        customFields: [],
      };
    }
    case UPDATE_GRAPH.SUCCESS: {
      const { customFields } = action.payload.data;
      state.singleGraph.customFields = customFields;
      return {
        ...state,
        customFields,
      };
    }
    case UPDATE_GRAPH_THUMBNAIL.SUCCESS: {
      const { thumbUrl } = action.payload.data;
      state.singleGraph.thumbnail = thumbUrl;
      return {
        ...state,
      };
    }
    case CONVERT_GRAPH.REQUEST: {
      return {
        ...state,
        importData: {},
      };
    }
    case CONVERT_GRAPH.SUCCESS: {
      const { data: importData } = action.payload;
      return {
        ...state,
        importData,
      };
    }

    case GET_GRAPHS_SHAREGRAPHS_COUNT.SUCCESS: {
      const { ...allGraghsCount } = action.payload.data;
      return {
        ...state,
        allGraghsCount,
      };
    }

    case GET_GRAPHS_LIST.REQUEST: {
      return {
        ...state,
        graphsListStatus: 'request',
        graphsList: [],
        // singleGraph: {
        //   ...state.singleGraph,
        //   nodes: [],
        //   links: [],
        //   labels: [],
        //   nodesPartial: [],
        //   linksPartial: [],
        //   customFields: [],
        //   nodeCustomFields: [],
        //   graphFilterInfo: {}
        // },
      };
    }
    case GET_GRAPHS_LIST.SUCCESS: {
      const { graphs: graphsList, ...graphsListInfo } = action.payload.data;
      return {
        ...state,
        graphsListStatus: 'success',
        graphsList,
        graphsListInfo,
        // singleGraph: {
        //   ...state.singleGraph,
        //   nodes: [],
        //   links: [],
        //   labels: [],
        //   nodesPartial: [],
        //   linksPartial: [],
        //   customFields: [],
        //   nodeCustomFields: [],
        //   graphFilterInfo: {}
        // },
      };
    }
    // case GENERATE_THUMBNAIL_WORKER: {
    //   const { graph } = action.payload.data;
    //
    //   const graphsList = [...state.graphsList].map((g) => {
    //     if (g.id === graph.id) {
    //       g.updatedAt = graph.updatedAt;
    //     }
    //     return g;
    //   });
    //
    //   return {
    //     ...state,
    //     graphsList,
    //   };
    // }
    case GET_GRAPHS_LIST.FAIL: {
      return {
        ...state,
        graphsListStatus: 'fail',
      };
    }
    case GET_NODES_LIST.REQUEST: {
      return {
        ...state,
        graphsListStatus: 'request',
        graphNodes: [],
      };
    }
    case GET_NODES_LIST.SUCCESS: {
      const { graphs: graphNodes, ...nodesListInfo } = action.payload.data;
      return {
        ...state,
        nodesListStatus: 'success',
        graphNodes,
        nodesListInfo,
      };
    }
    case GET_NODES_LIST.FAIL: {
      return {
        ...state,
        nodesListStatus: 'fail',
      };
    }
    case GET_SINGLE_GRAPH.REQUEST: {
      return {
        ...state,
        singleGraph: {
          ...state.singleGraph,
          nodes: [],
          links: [],
          labels: [],
        },
        singleGraphStatus: 'request',
      };
    }
    case GET_SINGLE_EMBED_GRAPH.SUCCESS:
    case GET_SINGLE_GRAPH.SUCCESS: {
      const {
        graph: singleGraph, embedLabels, info, rendering,
      } = action.payload.data;
      const {
        nodes, links, labels, lastUid,
      } = singleGraph;

      if (rendering === true) {
        Chart.render({
          nodes,
          links: ChartUtils.cleanLinks(links, nodes),
          labels,
          embedLabels,
          lastUid,
        });
      }
      Chart.loading(false);
      return {
        ...state,
        singleGraph,
        embedLabels,
        graphInfo: info,
        singleGraphStatus: 'success',
      };
    }

    case GET_GRAPH_INFO.SUCCESS: {
      const { filter, info } = action.payload.data;
      return {
        ...state,
        graphFilterInfo: filter,
        graphInfo: info,
      };
    }

    case GET_SINGLE_GRAPH.FAIL: {
      Chart.loading(false);
      return {
        ...state,
        singleGraphStatus: 'fail',
      };
    }

    case GET_SINGLE_GRAPH_PREVIEW.SUCCESS: {
      const { graph: singleGraph } = action.payload.data;
      const { nodes, labels } = singleGraph;
      let { links } = singleGraph;
      if (_.isEmpty(nodes)) {
        nodes.push({
          id: '0',
          name: '',
          fx: 0,
          fy: 0,
          hidden: -1,
        });
      }
      // nodes = nodes.map((d) => {
      //   delete d.lx;
      //   delete d.ly;
      //   return d;
      // });
      links = ChartUtils.cleanLinks(links, nodes);
      // labels = labels.map((d) => {
      //   delete d.open;
      //   return d;
      // });
      Chart.render({
        nodes, links, labels,
      });
      return {
        ...state,
        singleGraph,
      };
    }
    case GET_SINGLE_GRAPH_PREVIEW.FAIL: {
      const nodes = [{
        id: '0',
        name: '',
        fx: 0,
        fy: 0,
        hidden: -1,
      }];
      Chart.render({
        nodes,
      });
      return null;
    }
    case CLEAR_SINGLE_GRAPH: {
      return {
        ...state,
        singleGraph: {},
        embedLabels: [],
      };
    }
    case SET_GRAPH_CUSTOM_FIELDS: {
      const { customFields } = action.payload;
      const singleGraph = { ...state.singleGraph, customFields };
      return {
        ...state,
        singleGraph,
      };
    }
    case SET_NODE_CUSTOM_FIELD: {
      const singleGraph = { ...state.singleGraph };
      const {
        type, nodeId, customField, tabData, append,
      } = action.payload;
      const res = CustomFields.setValue(singleGraph.customFields, type, nodeId, customField, append);
      singleGraph.customFields = res.customFields;
      if (!res.success) {
        toast.warn('Some tabs are not imported');
      }
      if (tabData) {
        if (tabData.documents?.length) {
          singleGraph.file = null;
          singleGraph.documents = tabData.documents;
          singleGraph.currentTabName = tabData.name;
        }
        _.set(singleGraph.customFields, [type, tabData.name, 'subtitle'], tabData.subtitle);
      }
      return {
        ...state,
        singleGraph,
      };
    }
    case ADD_NODE_CUSTOM_FIELD_KEY: {
      const singleGraph = { ...state.singleGraph };
      const { type, key, subtitle } = action.payload;
      singleGraph.customFields = CustomFields.setKey(singleGraph.customFields, type, key, subtitle);
      return {
        ...state,
        singleGraph,
      };
    }
    case RENAME_NODE_CUSTOM_FIELD_KEY: {
      const singleGraph = { ...state.singleGraph };
      const { type, name, oldName } = action.payload;
      singleGraph.customFields = CustomFields.customFieldRename(singleGraph.customFields, type, oldName, name);
      return {
        ...state,
        singleGraph: { ...singleGraph },
      };
    }
    case GET_NODE_CUSTOM_FIELDS.REQUEST: {
      return {
        ...state,
        nodeCustomFields: [],
      };
    }
    case GET_NODE_CUSTOM_FIELDS.SUCCESS: {
      const { customFields: nodeCustomFields } = action.payload.data;
      return {
        ...state,
        nodeCustomFields,
      };
    }
    case UPDATE_NODES_CUSTOM_FIELDS.REQUEST: {
      const { nodes } = action.payload;
      return {
        ...state,
        nodeCustomFields: nodes[0].customFields || [],
      };
    }
    case REMOVE_NODE_CUSTOM_FIELD_KEY: {
      const singleGraph = { ...state.singleGraph };
      const { type, key, nodeId } = action.payload;
      singleGraph.currentTabName = key;

      if (!singleGraph.dismissFiles) {
        const deleteTabDocument = [];

        deleteTabDocument.push({
          tabName: key,
          nodeId,
          nodeType: type,
        });
        singleGraph.dismissFiles = deleteTabDocument;
      } else if (!singleGraph.dismissFiles.some((e) => e.tabName === key && e.nodeId === nodeId)) {
        singleGraph.dismissFiles.push({
          tabName: key,
          nodeId,
          nodeType: type,
        });
      }
      singleGraph.customFields = CustomFields.removeKey(singleGraph.customFields, type, key);
      return {
        ...state,
        singleGraph,
      };
    }
    case REMOVE_NODE_FROM_CUSTOM_FIELD: {
      const singleGraph = { ...state.singleGraph };
      const { nodeId } = action.payload;
      singleGraph.customFields = CustomFields.removeNode(singleGraph.customFields, nodeId);
      return {
        ...state,
        customFields: singleGraph.customFields,
      };
    }
    case UPDATE_SINGLE_GRAPH: {
      const { merge, graph } = action.payload;
      const singleGraph = merge ? { ...state.singleGraph, ...graph } : graph;
      return {
        ...state,
        singleGraph: _.cloneDeep(singleGraph),
      };
    }
    case ACTIONS_COUNT.SUCCESS: {
      return {
        ...state,
        actionsCount: {
          ...state.actionsCount,
          ...action.payload.data.result,
        },
        singleGraph: {
          ...state.singleGraph,
          nodes: [],
          links: [],
          labels: [],
          nodesPartial: [],
          linksPartial: [],
          customFields: [],
          nodeCustomFields: [],
          graphFilterInfo: {},
        },
      };
    }
    case SET_ACTIVE_TAB: {
      if (state.activeTab === action.payload.tabName) {
        return state;
      }
      return {
        ...state,
        activeTab: action.payload.tabName,
      };
    }
    case GET_ALL_TABS.REQUEST: {
      return {
        ...state,
        graphTabs: [],
        graphTabsStatus: 'request',
      };
    }
    case GET_ALL_TABS.SUCCESS: {
      const { graphTabs } = action.payload.data;

      return {
        ...state,
        graphTabs,
        graphTabsStatus: 'success',
      };
    }
    case GET_ALL_TABS.FAIL: {
      return {
        ...state,
        graphTabsStatus: 'fail',
      };
    }
    case ONLINE_USERS: {
      const singleGraph = { ...state.singleGraph };
      const { onlineUsers } = action.payload;
      const online = onlineUsers && onlineUsers.filter((d) => d.activeGraphId === singleGraph?.id);
      return {
        ...state,
        onlineUsers: online,
      };
    }

    case ACTIVE_MOUSE_TRACKER: {
      const { onlineUsers, singleGraph: { id } } = state;
      const { userId, tracker: mouseTracker } = action.payload;
      const trackers = onlineUsers.filter((d) => d.activeGraphId === id && d.userId !== userId);
      return {
        ...state,
        trackers,
        mouseTracker,
      };
    }
    case SOCKET_ACTIVE_MOUSE_TRACKER: {
      const { mouseMoveTracker } = action.payload;
      const { singleGraph: { id } } = state;
      const trackers = mouseMoveTracker && mouseMoveTracker.filter((d) => d.graphId === id);
      return {
        ...state,
        mouseMoveTracker: trackers,
      };
    }
    case GET_GRAPH_QUERY.REQUEST: {
      return {
        ...state,
        query: [],
      };
    }
    case GET_GRAPH_QUERY.SUCCESS: {
      const { query, total } = action.payload.data;
      return {
        ...state,
        query: { queryList: query, total },
      };
    }
    case UPDATE_GRAPH_QUERY.SUCCESS:
    case DELETE_GRAPH_QUERY.SUCCESS: {
      const { query } = action.payload.data;
      return {
        ...state,
        query: { queryList: query },
      };
    }
    case GET_NODES_LIST_DATA: {
      return {
        ...state,
      };
    }
    default: {
      return state;
    }
  }
}
