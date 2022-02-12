import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { useSelector, useDispatch } from 'react-redux';
import { createGraphRequest } from '../../../store/actions/shareGraphs';
import { shareGraphs } from '../../../store/selectors/shareGraphs';

const SearchData = ({
  setSelect, select, option, user, singleGraph,
}) => {
  const dispatch = useDispatch();
  const shareGraphsList = useSelector(shareGraphs);
  const graph = singleGraph;

  const optionSelected = () => {
    if (option.id !== user.id && shareGraphsList.findIndex((item) => item.userId === option.id) === -1) {
      dispatch(createGraphRequest({ graphId: graph.id, userId: option.id }));
    }
  };
  return (
    <div className="share-modal__search-data" onClick={() => optionSelected(option)}>
      <img
        alt={`${option.firstName} ${option.lastName}`}
        src={option.avatar}
        style={{
          height: '24px',
          marginRight: '10px',
          width: '24px',
          borderRadius: '50%',
        }}
      />
      <span>
        {' '}
        {`${option.firstName} ${option.lastName}`}
      </span>
    </div>
  );
};

SearchData.propTypes = {
  select: PropTypes.array.isRequired,
  setSelect: PropTypes.func.isRequired,
  option: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  singleGraph: PropTypes.object.isRequired,
};

export default SearchData;
