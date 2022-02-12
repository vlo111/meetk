import React, { useState, useEffect } from 'react';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Wrapper from '../components/Wrapper';
import ToolBar from '../components/ToolBar';
import ReactChart from '../components/chart/ReactChart';
import AddNodeModal from '../components/chart/AddNodeModal';
import Crop from '../components/chart/Crop';
import ContextMenu from '../components/contextMenu/ContextMenu';
import DataView from '../components/dataView/DataView';
import DataImport from '../components/import/DataImportModal';
import NodeDescription from '../components/NodeDescription';
import { getActiveButton } from '../store/selectors/app';
import { getMouseMoveTracker, getSingleGraphStatus } from '../store/selectors/graphs';
import { getId } from '../store/selectors/account';
import { socketSetActiveGraph } from '../store/actions/socket';
import { setActiveButton } from '../store/actions/app';
import { clearSingleGraph, getSingleGraphRequest } from '../store/actions/graphs';
import AddLinkModal from '../components/chart/AddLinkModal';
import Zoom from '../components/Zoom';
import SearchModal from '../components/search/SearchModal';
import AutoPlay from '../components/AutoPlay';
import MapsGraph from '../components/maps/MapsGraph';
import Tabs from '../components/tabs';
import AddLabelModal from '../components/chart/AddLabelModal';
import LabelTooltip from '../components/LabelTooltip';
import ToolBarHeader from '../components/ToolBarHeader';
import ToolBarFooter from '../components/ToolBarFooter';
import CreateGraphModal from '../components/CreateGraphModal';
import AutoSave from '../components/AutoSave';
import LabelShare from '../components/share/LabelShare';
import MediaModal from '../components/Media/MediaModal';
import LabelCopy from '../components/labelCopy/LabelCopy';
import FindNode from '../components/FindNode';
import MousePosition from '../components/chart/MousePosition';
import ExitMode from '../components/ExitMode';
import AddLinkedInModal from '../components/chart/AddLinkedInModal';
import MapsModal from '../components/maps/MapsModal';
import ScienceGraphModal from '../components/ScienceSearchToGraph/ScienceGraphModal';
import WikiModal from '../components/wikipedia/WikiModal';
import ChartUtils from '../helpers/ChartUtils';
import DataExport from '../components/dataView/DataExport';

const GraphForm = () => {
  const dispatch = useDispatch();
  const { graphId } = useParams();
  const history = useHistory();
  // useState
  const [scaleStatus, setScaleStatus] = useState(false);
  const [permission, setPermission] = useState('');
  // useSelector
  const activeButton = useSelector(getActiveButton);
  const mouseMoveTracker = useSelector(getMouseMoveTracker);
  const currentUserId = useSelector(getId);
  const singleGraphStatus = useSelector(getSingleGraphStatus);

  useEffect(() => {
    setTimeout(async () => {
      dispatch(setActiveButton('create'));
      if (graphId) {
        const { payload: { data } } = await dispatch(getSingleGraphRequest(graphId));
        setPermission(data.graph.currentUserRole);
      } else {
        await dispatch(clearSingleGraph());
      }
      await dispatch(socketSetActiveGraph(graphId || null));
    }, 500);
  }, [graphId]);

  const getMouseMoveTrackers = async () => mouseMoveTracker && mouseMoveTracker.some(
    (m) => m.userId !== currentUserId && m.tracker === true,
  );
  if (!scaleStatus) {
    if (document.querySelector('.nodes')?.childElementCount) {
      ChartUtils.autoScale();
      setScaleStatus(true);
    }
  }
  const getPermission = () => (singleGraphStatus === 'fail'
    || (singleGraphStatus === 'success'
      && permission && !['admin', 'edit', 'edit_inside'].includes(permission))
  );
  const isPermission = getPermission();
  if (permission === '') {
    <></>;
  }
  if (isPermission) {
    return (<Redirect to="/403" />);
  }
  const isTracker = getMouseMoveTrackers();
  return (
    <Wrapper className="graphsPage" showHeader={false} showFooter={false}>
      <>
        <div className="graphWrapper">
          <ReactChart />
        </div>
        <ToolBarHeader />
        <ToolBar />
        <Crop />
        <AddNodeModal />
        {activeButton === 'data' && <DataView />}
        {activeButton === 'dataexport' && <DataExport />}
        {activeButton === 'search' && <SearchModal history={history} />}
        {activeButton === 'media' && <MediaModal history={history} />}
        {activeButton === 'maps-view' && <MapsGraph />}
        {activeButton === 'maps' && <MapsModal />}
        {activeButton === 'sciGraph' && <ScienceGraphModal />}
        {activeButton === 'wikipedia' && <WikiModal />}
        <AddLinkModal />
        <AddLabelModal />
        <AddLinkedInModal />
        <ContextMenu />
        <DataImport />
        <FindNode />
        <NodeDescription />
        <Tabs editable />
        <AutoPlay />
        <Zoom />
        <LabelTooltip />
        <CreateGraphModal />
        <LabelShare />
        <LabelCopy />
        <AutoSave />
        <ExitMode />
        <ToolBarFooter />
        {isTracker && <MousePosition graphId={graphId} />}
      </>
    </Wrapper>
  );
};

GraphForm.propTypes = {

};

export default GraphForm;
