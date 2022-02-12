import React, { useEffect, Suspense, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip/es';
import { getActionsCount } from '../../store/selectors/graphs';
import { getActionsCountRequest } from '../../store/actions/graphs';
import Button from '../form/Button';
import ShareTooltip from '../Contributors/ShareTooltip';
import CommentModal from '../CommentModal';
import LikeGraphs from '../likeGraphs';
import Outside from '../Outside';
import { ReactComponent as ShareSvg } from '../../assets/images/icons/shareGraph.svg';
import { ReactComponent as CommentSvg } from '../../assets/images/icons/commentGraph.svg';
import { ReactComponent as Description } from '../../assets/images/icons/description.svg';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { getId } from '../../store/selectors/account';

const TooltipContent = ({ graphId, graphOwner }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <ShareTooltip graphId={graphId} graphOwner={graphOwner} />
  </Suspense>
);
TooltipContent.propTypes = {
  graphId: PropTypes.string.isRequired,
  graphOwner: PropTypes.string.isRequired,
};

const GraphListFooter = ({ graph }) => {
  const actionsCountAll = useSelector(getActionsCount);
  const actionsCount = actionsCountAll[graph.id];
  const dispatch = useDispatch();
  const [openCommentModal, setOpenCommentModal] = useState(false);
  const [opendesc, setOpenDesc] = useState(false);
  const history = useHistory();
  const userId = useSelector(getId);

  useEffect(() => {
    if (graph.id) {
      dispatch(getActionsCountRequest(graph.id));
    }
  }, [dispatch, graph.id]);
  return (
    <div className="graphListFooter">
      <LikeGraphs graphId={graph.id} actionsCount={actionsCount} key={graph.id} />
      <Button
        icon={<CommentSvg />}
        className="transparent footer-icon"
        onClick={() => setOpenCommentModal(true)}
      >
        <span className="graphListFooter__count">{actionsCount?.comments}</span>
      </Button>
      {actionsCount?.shares
        ? (
          (((history.location.pathname !== '/public') || (userId === graph.userId))) && (
            <Tooltip overlay={<TooltipContent graphId={graph.id} graphOwner={graph.user} />} trigger={['click']} placement={['top']}>
              <Button icon={<ShareSvg />} className="transparent footer-icon">
                <span className="graphListFooter__count">{actionsCount?.shares}</span>
              </Button>
            </Tooltip>
          )
        )
        : (
          (((history.location.pathname !== '/public') || (userId === graph.userId))) && (
            <Button icon={<ShareSvg />} className="transparent footer-icon">
              <span className="graphListFooter__count">{actionsCount?.shares}</span>
            </Button>
          )
        )}
      {openCommentModal && (
        <CommentModal
          closeModal={() => setOpenCommentModal(false)}
          graph={graph}
        />
      )}
      <Button
        icon={<Description />}
        className="transparent footer-icon description"
        onClick={() => setOpenDesc(true)}
      />
      {opendesc ? (
        <Outside onClick={() => setOpenDesc(false)} exclude=".descriptionModal">
          <div
            className="descriptionRezalt"
          >
            <div className="descriptionText">
              <span>Description</span>
              <Button
                color="transparent"
                className="close "
                icon={<CloseSvg />}
                onClick={() => setOpenDesc(false)}
              />
            </div>
            <div className="descriptionResult">
              <p>{graph.description}</p>
            </div>
          </div>
        </Outside>
      ) : null}
    </div>
  );
};

GraphListFooter.propTypes = {
  graph: PropTypes.object.isRequired,
};

export default React.memo(GraphListFooter);
