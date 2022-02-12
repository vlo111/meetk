import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip/es';
import { GRAPH_SHARE_TYPES } from '../../../data/graph';
import Select from '../../form/Select';
import {
  listGraphRequest, updateGraphRequest, deleteGraphRequest,
} from '../../../store/actions/shareGraphs';
import { shareGraphs } from '../../../store/selectors/shareGraphs';
import { getId } from '../../../store/selectors/account';
import Button from '../../form/Button';
import { ReactComponent as TrashSvg } from '../../../assets/images/icons/trash.svg';

const Collaborators = ({ select, graph }) => {
  const dispatch = useDispatch();
  const { id } = graph;
  const shareGraphsList = useSelector(shareGraphs);
  const userId = useSelector(getId);
  useEffect(() => {
    dispatch(listGraphRequest({ graphId: id }));
  }, [dispatch, id]);

  const handleSelectChange = useCallback((newValue, shareGraphId) => {
    dispatch(updateGraphRequest(shareGraphId, { role: newValue.value, confirm: false }));
  }, [dispatch]);

  const handledelete = useCallback((shareGraphId) => {
    if (window.confirm('Are you sure?')) {
      dispatch(deleteGraphRequest(shareGraphId));
    }
  }, [dispatch]);

  return shareGraphsList ? shareGraphsList.map(
    (item) => (item.userId !== userId ? (
      <div className="share-modal__collaborators" key={item.user.email} >
        <div className="share-modal__search--selected">
          <img
            className="avatar circle share-modal__owner-logo"
            src={item.user.avatar}
            alt={`${item.user.firstName} ${item.user.lastName}`}
          />
          <span>{`${item.user.firstName} ${item.user.lastName}`}</span>
        </div>
        <div className="share-modal__collaborators--status">
          {item.status === 'new' && 'Not Saved'}
        </div>
        <div className="share-modal__search--selected-action">
          <Select
            defaultValue={GRAPH_SHARE_TYPES.find((i) => i.value === item.role)}
            options={GRAPH_SHARE_TYPES}
            onChange={(newValue) => handleSelectChange(newValue, item.id)}
          />
          <Tooltip overlay="Delete">
            <Button
              icon={<TrashSvg style={{ height: 30 }} />}
              onClick={() => handledelete(item.id)}
              className="transparent delete"
            />
          </Tooltip>
        </div>

      </div>
    ) : null),
  ) : null;
};

Collaborators.propTypes = {
  select: PropTypes.array.isRequired,
  graph: PropTypes.object.isRequired,
};

export default Collaborators;
