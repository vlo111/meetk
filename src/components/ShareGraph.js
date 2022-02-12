import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip/es';
import Button from './form/Button';
import { ReactComponent as ShareSvg } from '../assets/images/icons/share.svg';
import ShareModal from './ShareModal';
import { userGraphs as userShareGraphs } from '../store/selectors/shareGraphs';
import { userGraphRequest } from '../store/actions/shareGraphs';
import { getSingleGraph } from '../store/selectors/graphs';

const ShareGraph = ({ graphId, setButton }) => {
  const dispatch = useDispatch();
  const [openShareModal, setOpenShareModal] = useState(false);
  const userGraphs = useSelector(userShareGraphs);
  const singleGraph = useSelector(getSingleGraph);
  const userGraph = userGraphs && userGraphs.find((item) => item.graphId === graphId);

  const shareGraph = async () => {
    if (window.confirm('Are you sure?')) {
      setOpenShareModal(true);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    setButton && dispatch(userGraphRequest());
  }, [dispatch, setButton]);

  return (
    <>
      {(!userGraph || userGraph.role === 'admin')
            && (
              setButton
                ? (
                  <Button
                    icon={<ShareSvg />}
                    onClick={shareGraph}
                  >
                    Share data
                  </Button>
                )
                : (
                  <Tooltip overlay="Share">
                    <Button
                      icon={<ShareSvg style={{ height: 30 }} />}
                      onClick={shareGraph}
                      className="transparent share"
                    />
                  </Tooltip>
                )
            )}
      {openShareModal && singleGraph
    && <ShareModal closeModal={() => setOpenShareModal(false)} graph={singleGraph} />}
    </>

  );
};

ShareGraph.propTypes = {
  graphId: PropTypes.string.isRequired,
  setButton: PropTypes.bool,
};

ShareGraph.defaultProps = {
  setButton: false,
};

export default ShareGraph;
