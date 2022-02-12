import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Chart from '../../Chart';
import { getNodeHistoryRequest } from '../../store/actions/graphsHistory';
import {
  getSingleNodeHistory,
  getSingleNodePositionCount,
  getSingleNodeTabsViewCount,
} from '../../store/selectors/graphsHistory';

const NodeInfo = ({ graph, closeModal }) => {
  const { info: nodeId } = queryString.parse(window.location.search);
  if (!nodeId) {
    return null;
  }
  const node = Chart.getNodes().find((d) => d.id === nodeId);
  if (!node) return null;

  const afterOpenModal = () => {};
  const dispatch = new useDispatch();
  const nodeHistory = useSelector(getSingleNodeHistory);
  const nodePositionCount = useSelector(getSingleNodePositionCount);
  const nodeTabsViewCount = useSelector(getSingleNodeTabsViewCount);
  console.log(nodePositionCount, 'nodeHistory');
  useEffect(() => {
    dispatch(getNodeHistoryRequest(graph.id, nodeId));
  }, []);

  const onClose = () => {
    closeModal();
  };
  const createdUser = graph.users.find((u) => u.id === (node.createdUser || graph.userId)) || {
    firstName: '',
    lastName: '',
  };
  return (
    <div className="history">
      <div className="text-block">
        <p>Total change acctions:</p>
        <p>Change position count:</p>
        <p>Tabs view count:</p>
        <p>Created by:</p>
      </div>
      <div className="data-block">
        <p>{nodeHistory.length}</p>
        <p>{ nodePositionCount }</p>
        <p>{ nodeTabsViewCount }</p>
        <p>{`${createdUser.firstName} ${createdUser.lastName}`}</p>
      </div>
    </div>
  );
};

NodeInfo.propTypes = {
  graph: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default NodeInfo;
