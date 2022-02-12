import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const GET_DOCUMENTS_BY_TAG = define('GET_DOCUMENTS_BY_TAG');

export function getDocumentsByTagRequest(tag) {
  return GET_DOCUMENTS_BY_TAG.request(() => Api.getDocumentsByTag(tag), {});
}

export const GET_DOCUMENTS = define('GET_DOCUMENTS');

export function getDocumentsRequest(graphId) {
  return GET_DOCUMENTS.request(() => Api.getDocuments(graphId), {});
}

export const COPY_DOCUMENT = define('COPY_DOCUMENT');

export function copyDocumentForGraphRequest(requestData) {
  return COPY_DOCUMENT.request(() => Api.copyDocumentForGraph(requestData));
}
