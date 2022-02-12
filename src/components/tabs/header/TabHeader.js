import React from 'react';
import PropTypes from 'prop-types';

const TabHeader = ({ mode, setMode, tabsExpand }) => {

  return (
    <div className="tab-header">
      <button
        type="submit"
        className={`general ${(mode === 'general' || tabsExpand) ? 'tab-header-active' : 'tab-header-in-active'}`}
        onClick={() => {
          if (tabsExpand) return;
          setMode('general');
        }}
      >
        General
      </button>
      <button
        type="submit"
        className={`tab ${mode === 'tabs' ? 'tab-header-active' : 'tab-header-in-active'}`}
        onClick={() => setMode('tabs')}
      >
        Tabs
      </button>
      <button
        type="submit"
        className={`comment ${mode === 'comments' ? 'tab-header-active' : 'tab-header-in-active'}`}
        onClick={() => setMode('comments')}
      >
        Comments
      </button>
    </div>
  );
};

TabHeader.propTypes = {
  mode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
  tabsExpand: PropTypes.bool.isRequired,
};

export default TabHeader;
