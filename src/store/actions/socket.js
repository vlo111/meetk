import io from 'socket.io-client';
import Chart from '../../Chart';
import Api from '../../Api';
import Account from '../../helpers/Account';
import { getSingleGraphRequest, updateSingleGraph } from './graphs';
import { graphUsersRequest } from './shareGraphs';
import { addNotification } from './notifications';
import { addMyFriends } from './userFriends';
import Utils from '../../helpers/Utils';
import ChartUtils from '../../helpers/ChartUtils';
import ChartUpdate from '../../helpers/ChartUpdate';

let socket;
const notPushedEmits = [];

export function socketEmit(...params) {
  if (socket?.init) {
    socket.emit(...params);
  } else {
    notPushedEmits.push(params);
  }
}

export const SOCKET_LABEL_EMBED_COPY = 'SOCKET_LABEL_EMBED_COPY';
export const GENERATE_THUMBNAIL_WORKER = 'GENERATE_THUMBNAIL_WORKER';
export const ONLINE_USERS = 'ONLINE_USERS';
export const GRAPH_SHARED_USERS = 'GRAPH_SHARED_USERS';
export const ACTIVE_MOUSE_TRACKER = 'ACTIVE_MOUSE_TRACKER';
export const MOUSE_POSITION_TRACKER = 'MOUSE_POSITION_TRACKER';
export const SOCKET_ACTIVE_MOUSE_TRACKER = 'SOCKET_ACTIVE_MOUSE_TRACKER ';

export function socketInit() {
  return (dispatch, getState) => {
    if (socket) {
      return;
    }
    const {
      graphs: { singleGraph },
      account: { myAccount: { id: userId } },
    } = getState();
    const token = Account.getToken();

    socket = io.connect(Api.url, {
      query: `token=${token}`,
    });

    socket.on('connect', () => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId) {
        dispatch(socketSetActiveGraph(graphId));
      }
      setTimeout(() => {
        socket.init = true;
        notPushedEmits.forEach((params) => {
          socket.emit(...params);
        });
      }, 500);
    });

    socket.on('graphChange', async (data) => {
      const { account: { myAccount } } = getState();
      if (data.id === singleGraph.id && myAccount.id !== data.userId) {
        Chart.setAutoSave(false);
        await dispatch(getSingleGraphRequest(data.id, {}, true));
        setTimeout(() => {
          Chart.setAutoSave(true);
        }, 1000);
      }
    });

    socket.on(`graphUpdate-${singleGraph.id}`, (data) => (
      (data.id === singleGraph.id)
        && dispatch(updateSingleGraph(data))
    ));

    socket.on(`notificationsListGraphShared-${userId}`, (data) => {
      dispatch(addNotification(data));
    });

    socket.on(`updateUserfriend-${userId}`, (data) => {
      dispatch(addMyFriends(data));
    });

    socket.on('generateThumbnailWorker', (data) => {
      dispatch({
        type: GENERATE_THUMBNAIL_WORKER,
        payload: { data },
      });
    });

    socket.on('node.update-positions', (data) => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId === data.graphId) {
        ChartUpdate.nodePositionsChange(data);
      }
    });

    socket.on('graph.update-positions', (data) => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId === data.graphId) {
        ChartUpdate.graphPositionsChange(data);
      }
    });

    socket.on('node.update-fields', (data) => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId === data.graphId) {
        // ChartUpdate.nodeCustomFieldsChange(data.nodes);
      }
    });

    socket.on('node.create', (data) => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId === data.graphId) {
        ChartUpdate.nodesCrate(data);
      }
    });

    socket.on('node.delete', (data) => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId === data.graphId) {
        ChartUpdate.nodesDelete(data);
      }
    });

    socket.on('node.update', (data) => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId === data.graphId) {
        ChartUpdate.nodesUpdate(data);
      }
    });

    socket.on('link.create', (data) => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId === data.graphId) {
        ChartUpdate.linkCreate(data);
      }
    });

    socket.on('link.update', (data) => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId === data.graphId) {
        ChartUpdate.linkUpdate(data);
      }
    });

    socket.on('link.delete', (data) => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId === data.graphId) {
        ChartUpdate.linkDelete(data);
      }
    });

    socket.on('label.create', (data) => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId === data.graphId) {
        ChartUpdate.labelCreate(data);
      }
    });

    socket.on('label.update', (data) => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId === data.graphId) {
        ChartUpdate.labelUpdate(data);
      }
    });
    socket.on('label.toggle', (data) => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId === data.graphId) {
        ChartUpdate.labelToggle(data);
      }
    });

    socket.on('label.update-positions', (data) => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId === data.graphId) {
        ChartUpdate.labelUpdatePosition(data);
      }
    });

    socket.on('label.delete', (data) => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId === data.graphId) {
        ChartUpdate.labelDelete(data);
      }
    });

    socket.on('labelEmbedCopy', (labelEmbed) => {
      Chart.data.labels = Chart.data.labels.map((l) => {
        if (l.id === labelEmbed.id) {
          l.hasInEmbed = true;
        }
        return l;
      });
      dispatch({
        type: SOCKET_LABEL_EMBED_COPY,
        payload: {
          labelEmbed,
        },
      });
    });

    socket.on('online', (data) => {
      const onlineUsers = JSON.parse(data);
      // const { account: { myAccount: { id: userId } } } = getState();
      dispatch({
        type: ONLINE_USERS,
        payload: { onlineUsers },
      });
      dispatch({
        type: ACTIVE_MOUSE_TRACKER,
        payload: { userId },
      });
    });

    /**
     * Call share graphs user list
     */
    socket.on('shareList', async (result) => {
      // const { graphs: { singleGraph } } = getState();
      // const graphId = +result.graphId;
      // if (graphId === +singleGraph.id) {
      //   await dispatch(graphUsersRequest(result));
      // }
      await dispatch(graphUsersRequest(result));
    });

    socket.on('embedLabelDataChange', (data) => {
      const { labels } = Chart;

      let embededLabel = labels.data().filter((p) => p.readOnly && p.id === data.label?.id);

      if (embededLabel.length) {
        embededLabel = embededLabel[0].id;
        if (labels._groups[0]) {
          const curentEmbed = [...labels._groups[0]].filter((p) => p.__data__.id === embededLabel)[0];
          const { x: lx, y: ly } = curentEmbed.getBoundingClientRect();

          const { x: posX, y: posY } = ChartUtils.calcScaledPosition(lx, ly);

          const minX = Math.min(...data.label.d.map((l) => l[0]));
          const minY = Math.min(...data.label.d.map((l) => l[1]));

          data.links = data.links.map((l) => {
            if (l.sx && l.linkType === 'a1') {
              l.sx = l.sx - minX + posX;
              l.sy = l.sy - minY + posY;
              l.tx = l.tx - minX + posX;
              l.ty = l.ty - minY + posY;
            } else {
              l.sx = undefined;
            }
            return l;
          });
        }
      }

      const graphId = Utils.getGraphIdFormUrl();
      const { app: { filters } } = getState();
      if (data.sourceId === graphId) {
        return;
      }
      if (!Chart.getLabels().some((l) => l.id === data.label?.id)) {
        return;
      }
      let changed = false;
      const embedLabels = Chart.data.embedLabels.map((l) => {
        if (+l.labelId === +data.labelId) {
          changed = true;
          return data;
        }
        return l;
      });
      if (!changed) {
        embedLabels.push(data);
      }
      Chart.render({ embedLabels }, { filters, embeded: true, ignoreAutoSave: true });
    });

    socket.on('mousemoving', (data) => {
      const { graphs: { mouseMoveTracker } } = getState();
      const isTracker = mouseMoveTracker && mouseMoveTracker.some(
        (m) => m.userId === userId && m.tracker === true,
      );
      if (!mouseMoveTracker || !isTracker) return;
      const graphId = Utils.getGraphIdFormUrl();
      const cursors = JSON.parse(data);
      ChartUpdate.mouseMovePositions(graphId, userId, cursors);
    });
    socket.on('mouseMoveTracker', (data) => {
      const mouseMoveTracker = JSON.parse(data);

      dispatch({
        type: SOCKET_ACTIVE_MOUSE_TRACKER,
        payload: { mouseMoveTracker },
      });
    });
  };
}

export const SOCKET_LABEL_DATA_CHANGE = 'SOCKET_LABEL_DATA_CHANGE';

export function socketLabelDataChange(graph) {
  socketEmit('labelDataChange', graph);
  return {
    type: SOCKET_LABEL_DATA_CHANGE,
    payload: {
      graph,
    },
  };
}

export const SOCKET_SET_ACTIVE_GRAPH = 'SOCKET_SET_ACTIVE_GRAPH';

export function socketSetActiveGraph(graphId) {
  socketEmit('setActiveGraph', { graphId });
  return {
    type: SOCKET_SET_ACTIVE_GRAPH,
    payload: {
      graphId,
    },
  };
}

export const SOCKET_MOUSE_POSITION = 'SOCKET_MOUSE_POSITION';

export function socketMousePosition(graphId, userId, mousePosition) {
  if (graphId === undefined || userId === undefined) {
    return {
      type: SOCKET_MOUSE_POSITION,
      payload: {
        graphId,
        userId,
        mousePosition,
      },
    };
  }

  socketEmit('mousemove', { graphId, userId, mousePosition });
  return {
    type: SOCKET_MOUSE_POSITION,
    payload: {
      graphId,
      userId,
      mousePosition,
    },
  };
}

export const SOCKET_MOUSE_POSITION_TRACKER = 'SOCKET_MOUSE_POSITION_TRACKER';

export function socketMousePositionTracker(graphId, tracker, userId) {
  socketEmit('mouseMoveTracker', { graphId, tracker, userId });
  return {
    type: SOCKET_MOUSE_POSITION_TRACKER,
    payload: {
      graphId, tracker, userId,
    },
  };
}
