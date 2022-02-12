import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import Button from '../form/Button';
import {
  deleteGraphQueryRequest,
  getGraphQueryDataRequest,
  getGraphQueryRequest,
  updateGraphQueryRequest,
} from '../../store/actions/query';
import { graphQueryLIst } from '../../store/selectors/query';
import ChartUtils from '../../helpers/ChartUtils';
import ModalConfirmation from '../../helpers/ModalConfirmation';
import Chart from '../../Chart';
import { ReactComponent as DeleteSvg } from '../../assets/images/icons/delete.svg';
import { ReactComponent as QuerySvg } from '../../assets/images/icons/query.svg';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Utils from '../../helpers/Utils';

const Queries = ({ graphId, closeModal }) => {
  const dispatch = useDispatch();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteId, setdeleteId] = useState(null);
  const afterOpenModal = () => {
  };
  const queryLIst = useSelector(graphQueryLIst);
  useEffect(() => {
    if (graphId) {
      dispatch(getGraphQueryRequest(graphId));
    }
  }, [dispatch, graphId]);
  const handleDelete = useCallback((id) => {
    setdeleteId(id);
    setShowConfirmModal(true);
  }, [dispatch]);
  const showQueryData = async (id) => {
    let nodes = [];
    let links = [];
    const { payload: { data } } = await dispatch(getGraphQueryDataRequest(id, graphId));
    if (data.status === 'ok') {
      nodes = data.nodes;
      links = data.links;
      links = ChartUtils.cleanLinks(links, nodes);
    }
    Chart.render({ nodes, links }, { ignoreAutoSave: true, isAutoPosition: true });
    ChartUtils.autoScaleTimeOut();
    ChartUtils.autoScaleTimeOut(100);
    ChartUtils.autoScaleTimeOut(200);
    ChartUtils.startAutoPosition();
  };
  const handleEdit = useCallback((id, title, description) => {
    if (title.trim() === '') {
      return;
    }
    dispatch(updateGraphQueryRequest(id, title, description));
  }, [dispatch]);

  return (isEmpty(graphId) ? null
    : (
      <div className="query-modal">
        <div className="query-modal__title">
          <p className="name">Fragment</p>
          <Button
            icon={<CloseSvg style={{ height: 30 }} />}
            onClick={() => closeModal()}
            className="transparent"
          />
        </div>
        <div className="query-modal__list">
          {queryLIst && queryLIst.map((item, index) => (
            <div className="query-modal__item" key={index}>
              <div className="item-setting">
                <Button
                  icon={<QuerySvg style={{ height: 30 }} />}
                  className="transparent"
                  onClick={() => showQueryData(item.id)}
                />
                <div title={item.title} className="name" onClick={() => showQueryData(item.id)}>
                  {Utils.substr(item.title, 16)}
                </div>
              </div>

              {/* <EditableLabel */}
              {/*    labelClass="labelClass" */}
              {/*    inputClass="inputClass " */}
              {/*    heading={item.title} */}
              {/*    initialValue={item.title} */}
              {/*    save={(title) => handleEdit(item.id, title, item.description)} */}
              {/* /> */}
              {/* <EditableLabel */}
              {/*    labelClass="labelClass" */}
              {/*    inputClass="inputClass " */}
              {/*    heading={item.description} */}
              {/*    initialValue={item.description} */}
              {/*    save={(description) => handleEdit(item.id, item.title, description)} */}
              {/* /> */}
              <div className="item-setting">
                <Button
                  icon={<DeleteSvg style={{ height: 30 }} />}
                  className="transparent remove-query"
                  onClick={() => handleDelete(item.id)}
                  title="Delete"
                />
              </div>
              <div className="description" onClick={() => showQueryData(item.id)}>{item.description}</div>
            </div>
          ))}
        </div>
        {showConfirmModal
          && (
            <ModalConfirmation
              title="Are you sure ?"
              description="Are you want to delete this query"
              yes="Delete"
              no="Cancel"
              onCancel={() => setShowConfirmModal(false)}
              onAccept={() => {
                dispatch(deleteGraphQueryRequest(deleteId));
                setShowConfirmModal(false);
              }}
            />
          )}
      </div>
    )
  );
};

Queries.propTypes = {
  graphId: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default Queries;
