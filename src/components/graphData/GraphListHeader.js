import React, {
  useState, useCallback, useEffect,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import Popover from '../form/Popover';
import {
  deleteGraphRequest, getGraphsListRequest, getActionsCountRequest,
} from '../../store/actions/graphs';
import { deleteGraphRequest as DeleteShareGraphRequest } from '../../store/actions/shareGraphs';
import { ReactComponent as EllipsisVSvg } from '../../assets/images/icons/ellipsis.svg';
import ShareModal from '../ShareModal';
import EditGraphModal from '../chart/EditGraphModal';
import { getId } from '../../store/selectors/account';
import EmbedModal from '../embed/EmbedModal';

const GraphListHeader = ({
  graph, headerTools, updateGraph, outOver,
}) => {
  const dispatch = useDispatch();
  const userId = useSelector(getId);
  // const [openEditModal, setOpenEditModal] = useState(false);
  const [openEditGraphModal, setOpenEditGraphModal] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [openEmbedModal, setOpenEmbedModal] = useState(false);
  const history = useHistory();
  const { page = 1, s: searchParam } = queryString.parse(window.location.search);
  const notification = false;

  useEffect(() => {
    if (graph.id) {
      dispatch(getActionsCountRequest(graph.id));
    }
  }, [dispatch, graph.id]);

  async function deleteGraph(graphId) {
    //  select data from localStorage
    const order = JSON.parse(localStorage.getItem('/')) || 'newest';
    try {
      if (graphId) {
        await dispatch(deleteGraphRequest(graph.id));
        // use selector

        await dispatch(getGraphsListRequest(page, { s: searchParam }));
      } else if (window.confirm('Are you sure?')) {
        await dispatch(deleteGraphRequest(graph.id));
        // use selector
        toast.info('Successfully deleted');
        await dispatch(getGraphsListRequest(page, { s: searchParam, filter: order }));

        history.push('/');
      }
    } catch (e) {
      console.log(e);
    }
  }

  const handleDeleteShareGraph = useCallback((shareGraphId) => {
    if (window.confirm('Are you sure?')) {
      // delete
      dispatch(DeleteShareGraphRequest(shareGraphId, notification));
      history.push('/');
      toast.info('Successfully deleted');
    }
  }, [dispatch]);

  return (
    <div className="graphListHeader">
      <div>
        {(graph?.userId === userId || headerTools === 'shared') ? (
          <Popover
            showArrow
            triggerNode={<div className="ar-popover-trigger"><EllipsisVSvg /></div>}
            trigger="click"
          >
            <div className="ar-popover-list">
              {headerTools === 'shared' ? (
                <div
                  onClick={() => handleDeleteShareGraph(graph?.share.id)}
                  className="child dashboard-delete"
                >
                  <span className="dashboard-delete">
                    Delete
                  </span>
                </div>
              ) : (
                <>
                  <div
                    className="child "
                    onClick={() => setOpenEditGraphModal(true)}
                  >
                    <span>
                      Edit
                    </span>
                  </div>
                  <div
                    className="child "
                    onClick={() => setOpenShareModal(true)}
                  >
                    <span>
                      Share
                    </span>
                  </div>
                  <div
                    className="child "
                    onClick={() => setOpenEmbedModal(true)}
                  >
                    <span>
                      Embed
                    </span>
                  </div>
                  <div
                    onClick={() => deleteGraph(false)}
                    className="child dashboard-delete"
                  >
                    <span className="dashboard-delete">
                      Delete
                    </span>
                  </div>
                </>
              )}
            </div>
          </Popover>
        ) : null}
      </div>
      {openShareModal && (
        <ShareModal
          closeModal={() => {
            outOver();
            setOpenShareModal(false);
          }}
          graph={graph}
          outOver={outOver}
          setButton
        />
      )}
      {openEditGraphModal && (
        <EditGraphModal
          toggleModal={(value) => setOpenEditGraphModal(value)}
          graph={graph}
          outOver={outOver}
          updateGraph={updateGraph}
        />
      )}
      {openEmbedModal && (
      <EmbedModal
        onClose={(value) => setOpenEmbedModal(value)}
        graph={graph}
        outOver={outOver}
      />
      )}
    </div>
  );
};

GraphListHeader.propTypes = {
  graph: PropTypes.object.isRequired,
  updateGraph: PropTypes.func.isRequired,
  headerTools: PropTypes.string.isRequired,
  outOver: PropTypes.func.isRequired,
};

export default React.memo(GraphListHeader);
