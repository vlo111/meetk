import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import Chart from '../../Chart';
import { getCustomField, getSingleGraph } from '../../store/selectors/graphs';
import { getNodeCustomFieldsRequest } from '../../store/actions/graphs';
import SwitchTab from './switch/SwitchTab';
import AddTabModal from './modal/AddTabModal';
import Utils from '../../helpers/Utils';
import Api from '../../Api';
import { updateNodesCustomFieldsRequest } from '../../store/actions/nodes';
import '../../assets/styles/tabs.scss';
import TabHeader from './header/TabHeader';
import NodeInfoHeader from './header/NodeInfoHeader';
import General from './content/General';
import Tab from './content/Tab';
import Comment from './content/Comment';

const getElement = (name) => document.querySelector(name);

const getGroupedConnections = memoizeOne((nodeId) => {
  const nodes = Chart.getNodes();
  const nodeLinks = Chart.getNodeLinks(nodeId, 'all');
  const connectedNodes = nodeLinks && nodeLinks.map((l) => {
    let connected;
    if (l.source === nodeId) {
      connected = nodes.find((d) => d.id === l.target);
    } else {
      connected = nodes.find((d) => d.id === l.source);
    }
    return {
      linkType: l.type,
      node: connected,
    };
  });
  // connectedNodes.length.open = true;
  const connectedNodesGroup = Object.values(_.groupBy(connectedNodes, 'linkType'));
  return {
    connectedNodes: _.orderBy(connectedNodesGroup, (d) => d.length && d.length, 'desc'),
    length: connectedNodes.length,
  };
});

const Tabs = ({ history, editable, viewPermisson }) => {
  const { info: nodeId } = queryString.parse(window.location.search);

  const node = Chart.getNodes().find((n) => n.id === nodeId);

  if (!nodeId || !node) {
    return null;
  }

  const dispatch = useDispatch();

  const singleGraph = useSelector(getSingleGraph);

  const nodeCustomFields = useSelector(getCustomField);

  const [mode, setMode] = useState('general');

  const [prevMode, setPrevMode] = useState('');

  const [activeTab, setActiveTab] = useState('_description');

  const [nodeIdMemo, setNodeIdMemo] = useState('');

  const [openAddTab, setOpenAddTab] = useState(null);

  const [singleExpand, setSingleExpand] = useState(false);

  const [tabsExpand, setTabsExpand] = useState(false);

  const { connectedNodes } = getGroupedConnections(node.id);

  const { id: graphId, title } = singleGraph;

  useEffect(() => {
    if (activeTab !== '_description') updateTabWithFile();

    Chart.highlight('open', node.index);
  }, []);

  const moveAutoPlay = () => {
    let left;

    if (mode !== 'tabs') {
      left = '360px';
    } else left = '460px';

    // move autoplay right
    getElement('#autoPlay').style.right = left;
    if (getElement('.layoutBar')) getElement('.layoutBar').style.right = '300px';
    getElement('.graphControlPanel').style.right = left;
  };

  const updateTabWithFile = async (prevName) => {
    for (let i = 0; i < nodeCustomFields.length; i++) {
      const tab = nodeCustomFields[i];

      if (tab.value?.includes('blob')) {
        const { documentElement } = Utils.tabHtmlFile(tab.value);

        for (let j = 0; j < documentElement.length; j++) {
          const media = documentElement[j];

          const documentPath = media.querySelector('img')?.src ?? media.querySelector('a')?.href;

          if (documentPath) {
            const path = await Api.documentPath(graphId, media.querySelector('#docId').innerText).catch((d) => d);

            nodeCustomFields[i].value = nodeCustomFields[i].value.replace(documentPath, path.data?.path);
          }
        }
      }
    }

    dispatch(updateNodesCustomFieldsRequest(graphId, [{
      id: nodeId,
      customFields: nodeCustomFields,
      fieldName: activeTab,
      prevName,
    }]));
  };

  if (nodeId !== nodeIdMemo) {
    setNodeIdMemo(nodeId);
    setActiveTab('_description');
  }

  useEffect(() => {
    dispatch(getNodeCustomFieldsRequest(graphId, nodeId, {}));
    // dispatch(getNodeCommentsRequest({ graphId, nodeId: node.id }));
  }, [nodeIdMemo]);

  useEffect(() => {
    moveAutoPlay();
  }, [mode]);

  return (
    <>
      <div className={`tab-wrapper ${tabsExpand ? 'tabs_expand' : ''}`}>
        <NodeInfoHeader
          singleExpand={singleExpand}
          title={title}
          tabs={nodeCustomFields}
          node={node}
          viewPermisson={viewPermisson}
          history={history}
          setSingleExpand={setSingleExpand}
          setTabsExpand={(tab) => {
            if (tab) {
              if (mode === 'general') {
                setMode('tabs');
              }
              setPrevMode(mode);
            } else {
              setMode(prevMode);
            }
            setTabsExpand(tab);
          }}
          tabsExpand={tabsExpand}
          connectedNodes={connectedNodes}
        />
        {mode === 'tabs'
        && (
        <SwitchTab
          mode={mode}
          moveAutoPlay={moveAutoPlay}
          graphId={graphId}
          nodeId={nodeId}
          node={node}
          editable={editable}
          activeTab={activeTab}
          tabsExpand={tabsExpand}
          setActiveTab={(tabName) => setActiveTab(tabName)}
          nodeCustomFields={nodeCustomFields}
          setOpenAddTab={(tab) => setOpenAddTab(tab)}
        />
        )}
        <div className="tab">
          <TabHeader
            mode={mode}
            setMode={setMode}
            tabsExpand={tabsExpand}
          />
          <div className="tab-container">
            {(mode === 'general' || tabsExpand)
            && (
            <General
              title={title}
              editable={editable}
              node={node}
              tabs={nodeCustomFields}
              connectedNodes={connectedNodes}
              tabsExpand={tabsExpand}
            />
            )}
            {mode === 'tabs'
            && (
            <Tab
              setSingleExpand={setSingleExpand}
              singleExpand={singleExpand}
              tabsExpand={tabsExpand}
              node={node}
              graphId={graphId}
              customFields={nodeCustomFields}
              name={activeTab}
              setOpenAddTab={(tab) => setOpenAddTab(tab)}
              setActiveTab={(tabName) => setActiveTab(tabName)}
              editable={editable}
            />
            )}
            {mode === 'comments'
            && (
            <Comment graph={singleGraph} node={node} tabsExpand={tabsExpand} />
            )}
          </div>
        </div>
      </div>
      {!_.isNull(openAddTab) && (
        <AddTabModal
          node={node}
          fieldName={openAddTab}
          customFields={nodeCustomFields}
          onClose={(ev, prevName) => {
            updateTabWithFile(prevName);
            setOpenAddTab(null);
          }}
          setActiveTab={(tabName) => setActiveTab(tabName)}
        />
      )}
    </>
  );
};

Tabs.propTypes = {
  history: PropTypes.object.isRequired,
  editable: PropTypes.bool.isRequired,
  viewPermisson: PropTypes.string,
};

Tabs.defaultProps = {
  viewPermisson: '',
};

export default withRouter(Tabs);
