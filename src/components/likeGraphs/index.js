import React, { Suspense, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip/es';
import Button from '../form/Button';
import LikeGraphsTooltip from './LikeGraphsTooltip';
import { getLikeOrDislikeRequest, getLikeGraphsListRequest } from '../../store/actions/likeGraphs';
import { getActionsCountRequest } from '../../store/actions/graphs';

import { ReactComponent as HeartSvg } from '../../assets/images/icons/heart.svg';
import { ReactComponent as HeartUnCheckSvg } from '../../assets/images/icons/heart_uncheck.svg';

const TooltipContent = ({ graphId }) => (
  <Suspense fallback={<div> Loading...</div>}>
    <LikeGraphsTooltip graphId={graphId} />
  </Suspense>
);
TooltipContent.propTypes = {
  graphId: PropTypes.string.isRequired,
};

const Likes = React.memo(({ graphId, actionsCount }) => {
  const dispatch = useDispatch();
  const likeOrDislike = useCallback(async (liked) => {
    await dispatch(getLikeOrDislikeRequest(graphId, liked));
    await dispatch(getActionsCountRequest(graphId));
  }, [dispatch, graphId]);
  const onMouseEnter = () => {
    if (graphId) {
      dispatch(getActionsCountRequest(graphId));
    }
    dispatch(getLikeGraphsListRequest(graphId));
  };
  return (
    actionsCount?.liked > 0
      ? (
        <Tooltip overlay={<TooltipContent graphId={graphId} />} trigger={['hover']} placement={['top']}>
          <Button
            onMouseEnter={onMouseEnter}
            icon={<HeartSvg />}
            className="transparent footer-icon"
            onClick={() => likeOrDislike(false)}
          >
            <span className="graphListFooter__count">
              {actionsCount?.likes}
            </span>
          </Button>
        </Tooltip>

      )
      : (
        actionsCount?.likes
          ? (
            <Tooltip overlay={<TooltipContent graphId={graphId} />} trigger={['hover']} placement={['top']}>
              <Button
                onMouseEnter={onMouseEnter}
                icon={<HeartUnCheckSvg />}
                className="transparent footer-icon-transparent "
                onClick={() => likeOrDislike(true)}
              >
                <span className="graphListFooter__count">
                  {actionsCount?.likes}
                </span>
              </Button>
            </Tooltip>
          )
          : (
            <Button
              onMouseEnter={onMouseEnter}
              icon={<HeartUnCheckSvg />}
              className="transparent footer-icon-transparent "
              onClick={() => likeOrDislike(true)}
            >
              <span className="graphListFooter__count">
                {actionsCount?.likes}
              </span>
            </Button>
          )

      )
  );
});
Likes.propTypes = {
  graphId: PropTypes.string.isRequired,
};
export default Likes;
