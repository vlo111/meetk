import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import Sortable from './Sortable';
import { updateNodesCustomFieldsRequest } from '../../../store/actions/nodes';
import Utils from '../../../helpers/Utils';

const SwitchTab = ({
  nodeCustomFields, setActiveTab, activeTab, setOpenAddTab, node, editable, graphId, tabsExpand,
}) => {
  const dispatch = useDispatch();
  const handleOrderChange = (customFields) => {
    dispatch(updateNodesCustomFieldsRequest(graphId, [{
      id: node.id,
      customFields,
    }]));
  };

  return (
    <>
      <div className="tab_list">
        <div className="tab_list-header">
          <div className="tab_list-header-text">{`Tabs (${nodeCustomFields.length + 1})`}</div>
          {editable && <div className="tab_list-header-add" onClick={() => setOpenAddTab('')}>+ add tab</div>}
        </div>
        {(activeTab === '_description')
          ? (
            <div
              className="description description_active"
              onClick={() => setActiveTab('_description')}
            >
              Description
            </div>
          ) : (
            <div
              className="description"
              onClick={() => setActiveTab('_description')}
            >
              Description
            </div>
          )}
        <Sortable
          tabsExpand={tabsExpand}
          onChange={handleOrderChange}
          items={nodeCustomFields.filter((p) => p.name !== '_description')}
          keyExtractor={(v) => v.name}
          editable={editable}
          node={node}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          renderItem={(p) => (
            <>
              <div
                key={p.value.name}
                className={`tab_list-content-item ${activeTab === p.value.name ? 'tab_list-content-active' : ''}`}
                onMouseDown={() => setActiveTab(p.value.name)}
              >
                {Utils.substr(p.value.name, 12)}
              </div>
            </>
          )}
        />
      </div>
    </>
  );
};

SwitchTab.propTypes = {
  nodeCustomFields: PropTypes.object.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
  setOpenAddTab: PropTypes.func.isRequired,
  activeTab: PropTypes.object.isRequired,
  graphId: PropTypes.string.isRequired,
  editable: PropTypes.bool.isRequired,
  tabsExpand: PropTypes.bool.isRequired,
};

export default SwitchTab;
