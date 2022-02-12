import axios from 'axios';
import fileDownload from 'js-file-download';
import { serialize } from 'object-to-formdata';
import Account from './helpers/Account';

const { REACT_APP_ARXIV_URL } = process.env;
const { REACT_APP_CORE_URL } = process.env;
const { REACT_APP_API_URL } = process.env;

const api = axios.create({
  baseURL: REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Account.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

class Api {
  static url = REACT_APP_API_URL;

  static REACT_APP_ARXIV_URL = REACT_APP_ARXIV_URL;

  static REACT_APP_CORE_URL = REACT_APP_CORE_URL;

  static #cancelSource = [];

  static #cancel = (key) => {
    if (this.#cancelSource[key]) {
      this.#cancelSource[key].cancel('Operation canceled by the user.');
    }
    const source = axios.CancelToken.source();
    this.#cancelSource[key] = source;
    return source.token;
  }

  static toFormData(data) {
    return serialize({ ...data });
  }

  static singIn(email, password) {
    return api.post('/users/sign-in', { email, password });
  }

  static forgotPassword(email, callback) {
    return api.post('/users/forgot-password', { email, callback });
  }

  static resetPassword(token, password) {
    return api.post('/users/reset-password', { token, password });
  }

  static getMyAccount() {
    return api.get('/users/me');
  }

  static getUser(userId) {
    return api.get('/users/profile', { params: { userId } });
  }

  static updateMyAccount(data) {
    return api.post('/users/update', this.toFormData(data));
  }

  static updateMyAccountPassword(data) {
    return api.post('/users/update-password', data);
  }

  static async download(type, requestData) {
    const { data, headers } = await api.post(`/convert/graph/to/${type}`, requestData, {
      responseType: 'arraybuffer',
    });
    const [, fileName] = headers['content-disposition'].match(/\sfilename=([^;]+)/i);
    fileDownload(data, fileName);
  }

  static convertToGraph(type, requestData) {
    return api.post(`/convert/${type}/to/graph`, this.toFormData(requestData));
  }

  static convertToNode(type, requestData) {
    return api.post(`/convert/${type}/to/node`, this.toFormData(requestData));
  }

  static createGraph(requestData) {
    return api.post('/graphs/create', requestData);
  }

  static updateGraph(id, requestData) {
    return api.put(`/graphs/update/${id}`, requestData, {
      cancelToken: this.#cancel('updateGraph'),
    });
  }

  static updateGraphData(id, requestData) {
    return api.put(`/graphs/update-data/${id}`, requestData, {
      cancelToken: this.#cancel('updateGraphData'),
    });
  }

  static getActionsCount(id) {
    return api.get(`/graphs/actions-count/${id}`);
  }

  static deleteGraph(id) {
    return api.delete(`/graphs/delete/${id}`);
  }

  static updateGraphThumbnail(id, image, size, byUser) {
    return api.patch(`/graphs/thumbnail/${id}`, this.toFormData({ image, size, byUser }), {
      cancelToken: this.#cancel('updateGraphThumbnail'),
    });
  }

  static getCountGraphs(id) {
    return api.get(`/graphs/graphDataByUser/${id}`);
  }

  static getGraphsList(page, requestData = {}) {
    const params = { page, ...requestData };
    return api.get('/graphs', {
      params,
      cancelToken: this.#cancel('getGraphsList'),
    });
  }

  static getGraphNodes(page, requestData = {}) {
    const params = { page, ...requestData };
    return api.get('/graphs/nodes', {
      params,
      cancelToken: this.#cancel('getContentType'),
    });
  }

  static getGraphNodesData(requestData = {}) {
    const params = { ...requestData };
    return api.get('/graphs/nodes-data', {
      params,
      cancelToken: this.#cancel('getGraphNodesData'),
    });
  }

  static getSingleGraph(graphId, params = {}) {
    return api.get(`/graphs/single/${graphId}`, {
      params,
    });
  }

  static getAllTabs(graphId, params = {}) {
    return api.get(`/graphs/getAllTabs/${graphId}`, {
      params,
    });
  }

  static getGraphInfo(graphId, params = {}) {
    return api.get(`/graphs/info/${graphId}`, {
      params,
    });
  }

  static getNodeCustomFields(graphId, nodeId, params) {
    return api.get(`/nodes/get-fields/${graphId}/${nodeId}`, { params });
  }

  static getSingleGraphWithAccessToken(graphId, userId, token) {
    return api.get(`/graphs/single/token/${graphId}`, {
      params: {
        userId,
        token,
      },
    });
  }

  static getSingleEmbedGraph(graphId, token) {
    return api.get(`/graphs/embed/${graphId}/${token}`);
  }

  static oAuth(type, params) {
    const version = type === 'twitter' ? 'v1' : 'v2';
    return api.get(`/users/oauth/${version}/redirect/${type}`, { params });
  }

  static getTwitterToken(params) {
    return api.get('/users/oauth/v1/token/twitter', { params });
  }

  static getContentType(url) {
    return api.get('/helpers/content-type', {
      params: { url },
      cancelToken: this.#cancel('getContentType'),
    });
  }

  static getUsersByText(text) {
    return api.get('/users/get-by-text', { params: { text } });
  }

  static getDocumentsByTag(tag) {
    return api.get('/document/get-documents-by-tag', { params: { tag } });
  }

  static getDocuments(graphId) {
    return api.get('/document/get-documents', { params: { graphId } });
  }

  static copyDocumentForGraph(requestData) {
    return api.post('/document/copy-documents', requestData);
  }

  static createDocument(graphId, nodeId, tabName, fileData, file) {
    return api.post(`/document/create-documents/${graphId}`,
      this.toFormData({
        nodeId,
        tabName,
        file,
        fileData: JSON.stringify(fileData),
      }));
  }

  static updateDocument(graphId, nodeId, tabName, updateFile, file) {
    return api.post(`/document/update-documents/${graphId}`,
      this.toFormData({
        nodeId,
        tabName,
        file,
        updateFile: JSON.stringify(updateFile),
      }));
  }

  static documentPath(graphId, fileId) {
    return api.get(`/document/get-documentPath/${graphId}/${fileId}`);
  }

  static createShareGraph(requestData) {
    return api.post('/share-graphs/create', requestData);
  }

  static graphUsers(requestData) {
    return api.post('/share-graphs/graph-users', requestData);
  }

  static updateShareGraph(id, requestData) {
    return api.put(`/share-graphs/update/${id}`, requestData);
  }

  static deleteShareGraph(id, notification = true) {
    return api.delete(`/share-graphs/delete/${id}`, {
      params: {
        notification,
      },
    });
  }

  static listShareGraph(requestData) {
    return api.post('/share-graphs/list/', requestData);
  }

  static updateShareGraphStatus(requestData) {
    return api.post('/share/update-status/', requestData);
  }

  static singUp(data) {
    return api.post('/users/sign-up', data);
  }

  static searchGraphsList(page, requestData = {}) {
    const params = { page, ...requestData };
    return api.get('/share-graphs/search', {
      params,
      cancelToken: this.#cancel('searchGraphsList'),
    });
  }

  static createCommentGraph(requestData) {
    return api.post('/comment-graphs/create', requestData);
  }

  static graphComments(requestData) {
    return api.get('/comment-graphs/comments', { params: requestData });
  }

  static deleteGraphComment(id) {
    return api.delete(`comment-graphs/delete/${id}`);
  }

  static userGraph() {
    return api.get('/share-graphs/user-graphs');
  }

  static listNotifications(requestData) {
    return api.get('/notifications/list', requestData);
  }

  static notificationsUpdate() {
    return api.get('/notifications/update');
  }

  static getWikipediaInfo(search) {
    return api.get('/helpers/wikipedia', {
      params: { search },
    });
  }

  static getFriends(userId) {
    return api.get('/user-friends', { params: { userId } });
  }

  static addFriend(requestData) {
    return api.post('/user-friends/add', requestData);
  }

  static cancelFriend(requestData, id) {
    return api.put(`/user-friends/cancel/${id}`, requestData);
  }

  static acceptFriend(requestData, id) {
    return api.put(`/user-friends/accept/${id}`, requestData);
  }

  static rejectFriend(requestData) {
    return api.put('/user-friends/reject', requestData);
  }

  static removeFriend(id) {
    return api.put(`/user-friends/remove/${id}`);
  }

  static myFriends() {
    return api.get('/user-friends/my-friends');
  }

  static labelShare(sourceId, labelId, graphId) {
    return api.post('/graph-labels-embed/create', { sourceId, labelId, graphId });
  }

  static labelDelete(sourceId, labelId, graphId) {
    return api.delete('/graph-labels-embed/delete', {
      params: {
        sourceId, labelId, graphId,
      },
    });
  }

  static createCommentNode(requestData) {
    return api.post('/comment-nodes/create', requestData);
  }

  static nodeComments(requestData) {
    return api.get('/comment-nodes/comments', { params: requestData });
  }

  static deleteNodeComment(id) {
    return api.delete(`comment-nodes/delete/${id}`);
  }

  static getActionsNodeCount(id, nodeId) {
    return api.get(`/comment-nodes/actions-count/${id}/${nodeId}`);
  }

  static searchUsers(s, page) {
    return api.get('/users/search', {
      params: { s, page },
    });
  }

  static getSharedWithUsers(graphId, type, objectId) {
    return api.get('/share/users', {
      params: {
        graphId, type, objectId,
      },
    });
  }

  static shareGraphWithUsers(params) {
    return api.post('/share/create', params);
  }

  static updateShareGraphWithUsers(shareId, params) {
    return api.put(`/share/update/${shareId}`, params);
  }

  static deleteShareGraphWithUsers(shareId) {
    return api.delete(`/share/delete/${shareId}`);
  }

  static shareLabelDelete(labelId, graphId) {
    return api.delete('/share/label-delete', {
      params: {
        labelId, graphId,
      },
    });
  }

  static getShareGraphsList(page, requestData) {
    const params = { page, ...requestData };
    return api.get('/share', { params });
  }

  static createNodes(graphId, nodes) {
    return api.post(`/nodes/create/${graphId}`, { nodes });
  }

  static updateNodes(graphId, nodes) {
    return api.put(`/nodes/update/${graphId}`, { nodes });
  }

  static updateNodePositions(graphId, nodes) {
    return api.put(`/nodes/update-positions/${graphId}`, { nodes });
  }

  static updateNodeCustomFields(graphId, nodes) {
    return api.put(`/nodes/update-fields/${graphId}`, { nodes });
  }

  static uploadNodeIcon(graphId, nodeId, nodeIcon) {
    return api.post(`/nodes/upload/icon/${graphId}`, this.toFormData({
      id: nodeId,
      icon: nodeIcon,
    }));
  }

  static deleteNodes(graphId, nodes) {
    return api.delete(`/nodes/delete/${graphId}`, {
      data: { nodes },
    });
  }

  static createLinks(graphId, links) {
    return api.post(`/links/create/${graphId}`, { links });
  }

  static updateLinks(graphId, links) {
    return api.put(`/links/update/${graphId}`, { links });
  }

  static deleteLinks(graphId, links) {
    return api.delete(`/links/delete/${graphId}`, {
      data: { links },
    });
  }

  static createLabels(graphId, labels) {
    return api.post(`/labels/create/${graphId}`, { labels });
  }

  static updateLabels(graphId, labels) {
    return api.put(`/labels/update/${graphId}`, { labels });
  }

  static toggleFolder(graphId, label) {
    return api.put(`/labels/toggle/${graphId}`, { label });
  }

  static deleteLabels(graphId, labels) {
    return api.delete(`/labels/delete/${graphId}`, {
      data: { labels },
    });
  }

  static updateGraphPositions(graphId, nodes, labels) {
    return api.put(`/graphs/update-positions/${graphId}`, { nodes, labels });
  }

  static updateLabelPositions(graphId, labels) {
    return api.put(`/labels/update-positions/${graphId}`, { labels });
  }

  static labelCopy(sourceId, labelId) {
    return api.get(`/labels/copy/${sourceId}/${labelId}`);
  }

  static dataCopy(sourceId, square) {
    return api.post(`/graphs/data/copy/${sourceId}`, { square });
  }

  static dataPastCompare(graphId, nodes) {
    return api.post(`/graphs/data/past-compare/${graphId}`, {
      nodes,
    });
  }

  static labelPast(graphId, sourceId, position = [0, 0], action, data) {
    return api.post(`/labels/past/${graphId}`, {
      sourceId, position, action, ...data,
    });
  }

  static dataPast(graphId, sourceId, position = [0, 0], action, data) {
    return api.post(`/graphs/data/past/${graphId}`, {
      sourceId, position, action, ...data,
    });
  }

  static labelData(graphId, labelId) {
    return api.get(`/labels/${graphId}/${labelId}`);
  }

  static updateCustomFieldsLabels(graphId, customFields) {
    // nodeType, fieldName, order = 0, nodeId,
    return api.delete(`/custom-fields/update/${graphId}`, {
      data: { customFields },
    });
  }

  // History

  static getNodeHistory(graphId, nodeId) {
    return api.get(`/graph-history/node-history/${graphId}/${nodeId}`);
  }

  static getGraphHistory(graphId) {
    return api.get(`/graph-history/graph-history/${graphId}`);
  }

  static confirmEmail(token) {
    return api.get(`/users/confirmation/${token}`);
  }

  static getGraphQuery(graphId) {
    return api.get(`/query/${graphId}`);
  }

  static getGraphQueryData(id, graphId) {
    return api.get(`/query/data/${id}/${graphId}`);
  }

  static createGraphQuery(requestData) {
    return api.post('/query/create', requestData);
  }

  static deleteGraphQuery(id) {
    return api.delete(`/query/delete/${id}`);
  }

  static updateGraphQuery(id, title, description) {
    return api.put(`/query/update/${id}`, { title, description });
  }

  static getLikeOrDislike(graphId, liked) {
    return api.put(`/like-graphs/likes/${graphId}`, { liked });
  }

  static getLikeGraphsList(graphId) {
    return api.get(`/like-graphs/${graphId}`);
  }
}

export default Api;
