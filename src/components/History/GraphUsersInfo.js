import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';
import moment from 'moment';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import isEmpty from 'lodash/isEmpty';
import Tooltip from 'rc-tooltip';
import {
  List, AutoSizer, CellMeasurer, CellMeasurerCache,
} from 'react-virtualized';
import Button from '../form/Button';
import Chart from '../../Chart';
import { getNodeHistoryRequest } from '../../store/actions/graphsHistory';
import {
  getSingleNodeHistory,
  getSingleNodePositionCount,
  getSingleNodeTabsViewCount,
} from '../../store/selectors/graphsHistory';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Utils from '../../helpers/Utils';

const GraphUsersInfo = ({ graph, closeModal }) => {
  const { info: nodeId } = queryString.parse(window.location.search);
  if (!nodeId) {
    return null;
  }
  const node = Chart.getNodes().find((d) => d.id === nodeId);
  if (!node) return null;

  const afterOpenModal = () => {};
  const dispatch = new useDispatch();
  const cache = React.useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 100,
    }),
  );
  const nodeHistory = useSelector(getSingleNodeHistory);
  const nodePositionCount = useSelector(getSingleNodePositionCount);
  const nodeTabsViewCount = useSelector(getSingleNodeTabsViewCount); console.log(nodeHistory, 'nodeHistory');
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

  return (isEmpty(graph) ? null
    : (
      <Modal
        className="ghModal graphUsersInfo"
        overlayClassName="ghModalOverlay graphUsersInfoOverlay"
        isOpen
        onAfterOpen={afterOpenModal}
        onRequestClose={onClose}
        contentLabel="History"
      >
        <div className="table">
          <div style={{ width: '100%', height: '50vh' }}>
            <div className="row">
              <span className="item node-name ">
                {' '}
                {node.name}
                {' '}
              </span>
            </div>
            <div className="row">
              <span className="item ">
                {' '}
                <h4>
                  Total change actions:
                  {nodeHistory.length}
                </h4>
                {' '}
              </span>
              <span className="item ">
                {' '}
                <h4>
                  Change position count:
                  {nodePositionCount}
                </h4>
                {' '}
              </span>
              <span className="item ">
                {' '}
                <h4>
                  Tabs view count:
                  {nodeTabsViewCount}
                </h4>
                {' '}
              </span>
            </div>
            <div className="row info">
              <span className="item "> Created by: </span>
              <span className="item ">
                {' '}
                <img src={createdUser.avatar} className="avatar" alt="" />
                {' '}
              </span>
              <span className="item ">
                {' '}
                {`${createdUser.firstName} ${createdUser.lastName}`}
                {' '}
              </span>
              <div className="item " />
              <span className="item time">
                {' '}
                {node.createdAt ? moment(node.createdAt * 1000).format('DD/MM/YYYY hh:mm A') : ''}
                {' '}
              </span>
              <div className="" />
            </div>
            <p className="all-count">
              {' '}
              Showing
              {nodeHistory.length}
              {' '}
              changes
              {' '}
            </p>
            <div className="row header">
              <span className="item "> User </span>
              <span className="item ">  </span>
              <span className="item "> Event type </span>
              <span className="item "> Name </span>
              <span className="item "> Type </span>
              <span className="item "> Event date </span>
            </div>
            <AutoSizer>
              {({ width, height }) => (
                <List
                  width={width}
                  height={height}
                  rowHeight={cache.current.rowHeight}
             // deferredMeasurementCache={cache.current}
                  overscanRowCount={3}
                  rowCount={nodeHistory.length}
                  rowRenderer={({ key, style, index }) => {
                    const history = nodeHistory[index];
                    return (
                      <CellMeasurer
                        key={key}
                        cache={cache.current}
                        parent={nodeHistory}
                        columnIndex={0}
                        rowIndex={index}
                      >
                        <div style={style}>
                          <div className="row">
                            <div className="item ">
                              <img src={history?.user?.avatar} className="avatar" alt="" />
                            </div>
                            <span className="item ">
                              {`${history?.user?.firstName} ${history?.user?.lastName}`}
                            </span>
                            <span className="item ">
                              {history.eventType }
                            </span>
                            <span className="item ">
                              <Tooltip overlay={history.name} placement="bottom" className="tooltipList">
                                <span>{Utils.substr(history.name, 18)}</span>
                              </Tooltip>
                            </span>
                            <span className="item ">
                              <Tooltip overlay={history.type} placement="bottom" className="tooltipList">
                                <span>{Utils.substr(history.type, 18)}</span>
                              </Tooltip>
                            </span>
                            <span className="item ">
                              {history.eventDate ? moment(history.eventDate * 1000).format('DD/MM/YYYY hh:mm A') : ''}
                            </span>
                          </div>
                        </div>
                      </CellMeasurer>
                    );
                  }}
                />
              )}
            </AutoSizer>
          </div>
          <Button
            color="transparent"
            className="close"
            icon={<CloseSvg />}
            onClick={onClose}
          />
        </div>
      </Modal>
    )
  );
};

GraphUsersInfo.propTypes = {
  graph: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default GraphUsersInfo;
