import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import Checkbox from '../form/Checkbox';
import NodeIcon from '../NodeIcon';
import Utils from '../../helpers/Utils';
import ChartUtils from '../../helpers/ChartUtils';
import Chart from '../../Chart';
import SelectSearchList from './SelectSearchList';
import { getGraphNodesDataRequest } from '../../store/actions/graphs';
import {
  getPublicState, getSingleGraphOwner, getTotalNodes, getLinksPartial, getNodesPartial, getSingleGraphStatus,
} from '../../store/selectors/graphs';
import { getId } from '../../store/selectors/account';
import { ReactComponent as DownSvg } from '../../assets/images/icons/down.svg';

const SearchModal = ({ graphId }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState([]);
  const [matched, setMatched] = useState({
    type: false,
    name: false,
    keywords: false,
    tab: false,
  });
  const [allNodesSelected, setAllNodesSelected] = useState(false);
  const [checkBoxAll, setCheckBoxAll] = useState(true);
  const [toggleFilterBox, setToggleFilterBox] = useState(false);
  const [chosenNodes, setChosenNodes] = useState([]);
  const [searchQueryList, setSearchQueryList] = useState([]);
  const [filterList, setFilterList] = useState({
    type: true,
    name: true,
    tab: true,
    tag: true,
    keywords: true,
  });
  const chartNodes = Chart.getNodes();
  const publicState = useSelector(getPublicState);
  const userId = useSelector(getSingleGraphOwner);
  const currentUserId = useSelector(getId);
  const totalNodes = useSelector(getTotalNodes);
  const linksPartial = useSelector(getLinksPartial);
  const nodesPartial = useSelector(getNodesPartial);
  const singleGraphStatus = useSelector(getNodesPartial);

  const toggleFilter = () => {
    setToggleFilterBox(!toggleFilterBox);
    let searchNodes = document.getElementsByClassName('searchNodes');
    searchNodes = searchNodes.length ? searchNodes[0] : undefined;
    searchNodes.addEventListener('click', listenToFilterClick);
  };
  const listenToFilterClick = (ev) => {
    if (ev
      && typeof (ev?.target?.className) === 'string'
      && (ev.target.className.includes('checkBox')
        || ev.target.className.includes('chooseSearchFields'))
    ) {
      return;
    }

    if (!toggleFilterBox) {
      setToggleFilterBox(toggleFilterBox);
      let searchNodes = document.getElementsByClassName('searchNodes');
      searchNodes = searchNodes.length ? searchNodes[0] : undefined;
      searchNodes.removeEventListener('click', listenToFilterClick);
    }
  };
  const handleFilterChange = (value) => {
    if (value === 'all') {
      const checkedFilterList = Object.values(filterList).filter((n) => n === true);
      // if (checkedFilterList && checkedFilterList.length === Object.values(filterList).length) {
      // }
      setCheckBoxAll(!checkBoxAll);
      setFilterList({
        type: !checkBoxAll,
        name: !checkBoxAll,
        tab: !checkBoxAll,
        tag: !checkBoxAll,
        keywords: !checkBoxAll,
      });
    }

    if (value !== 'all') {
      setFilterList({ ...filterList, [value]: !filterList[value] });
    }
  };
  const closeModal = () => {
    setSearch('');
    clearState();
  };
  const clearState = () => {
    setResult([]);
    setChosenNodes([]);
    setAllNodesSelected(false);
  };
  const handleSearch = async (value) => {
    let nodes = [];
    setSearch(value);
    clearState();
    if (!value) {
      return;
    }
    setIsLoading(true);
    const argument = {
      s: value,
      graphId,
      findNode: false,
      searchParameters: filterList,
      isOwner: publicState || currentUserId === userId,
    };
    try {
      const {
        payload: { data },
      } = await dispatch(getGraphNodesDataRequest(argument));
      const nodeListId = ChartUtils.getNodeIdListByObj(searchQueryList);
      if (nodeListId) {
        nodes = data.nodes ? data.nodes.filter((n) => nodeListId.includes(n.id)) : [];
      } else {
        nodes = data.nodes;
      }

      setMatched(data.matched || {});
    } catch (e) {
      if (e.message === 'Operation canceled by the user.') return;
      toast.error('Error accrued while searching');
    }
    setResult(nodes || []);
    setIsLoading(false);
  };
  const handleNodesCheckBoxChange = async (items, name) => {
    const checkItems = chosenNodes && chosenNodes.filter((n) => n.id === items.id);
    if (name) {
      const chosenCheckBox = document.getElementsByName(name)[0];
      chosenCheckBox.checked = !chosenCheckBox.checked;
    }

    if (checkItems.length === 0) {
      setChosenNodes((prevChose) => [
        ...prevChose,
        items,
      ]);
    } else {
      const newItems = chosenNodes && chosenNodes.filter((n) => n.id !== items.id);
      setChosenNodes(newItems);
    }
  };
  const handleTypeCheckBoxChange = async (items, name) => {
    if (name) {
      const chosenCheckBox = document.getElementsByName(name)[0];
      chosenCheckBox.checked = !chosenCheckBox.checked;
    }
    _.forEach(items, (item) => {
      const checkItemsTypes = chosenNodes && chosenNodes.filter((n) => n.id === item.id);

      if (checkItemsTypes.length === 0) {
        setIsLoading(true);
        setChosenNodes((prevChose) => [
          ...prevChose,
          item,
        ]);
        setIsLoading(true);
      } else {
        const newItems = chosenNodes && chosenNodes.filter((n) => !items.some((s) => s.id === n.id));
        setChosenNodes(newItems);
        setIsLoading(true);
      }
    });
  };

  const selectAllNodes = () => {
    const listClass = document.getElementsByClassName('list')[0];
    const allCheckboxes = Array.from(listClass.children);
    const allNodesSelect = !allCheckboxes.find((el) => el.firstChild.firstChild.checked === false);
    setAllNodesSelected(!allNodesSelected);
    if (allNodesSelect) {
      setChosenNodes([]);
      allCheckboxes.forEach((el) => {
        el.firstChild.firstChild.checked = false;
      });
    } else {
      setChosenNodes(result);
      allCheckboxes.forEach((el) => {
        el.firstChild.firstChild.checked = true;
      });
    }
  };
  const showSelectedNodes = (keep = false) => {
    const oldNodes = Chart.getNodes();
    const oldLinks = Chart.getLinks();
    let nodes = chosenNodes;

    if (keep) {
      nodes = chosenNodes.concat(oldNodes);
      setSearchQueryList([]);
    }
    nodes = nodesPartial.filter((node) => {
      if (Object.prototype.hasOwnProperty.call(node, 'x')) {
        node.fx = node.x;
        node.fy = node.y;
      }
      if (keep && oldNodes?.some((nd) => nd.id === node.id)) {
        node.new = false;
        return true;
      } if (nodes?.some((nd) => nd.id === node.id)) {
        node.new = true;
        return true;
      }
      return false;
    });
    let links = ChartUtils.cleanLinks(linksPartial, chosenNodes);
    if (keep) {
      links = links.concat(oldLinks);
    }
    links = linksPartial.filter((link) => links.some((oldLink) => oldLink.id === link.id));
    // if links are in folder they have fake source and target
    links = links.filter((link) => {
      if (link.source.startsWith('fake')) {
        link.source = link._source;
        link.target = link._target;
      }
      if (!keep) {
        link.new = true;
        return true;
      } if (keep && oldLinks.some((l) => l.id === link.id)) {
        link.new = false;
        return true;
      } if (!oldLinks.some((l) => l.id === link.id)) {
        link.new = true;
        return true;
      }
      return false;
    });
    Chart.render({ nodes, links, labels: [] }, { ignoreAutoSave: true, isAutoPosition: true });
    ChartUtils.autoScaleTimeOut();
    ChartUtils.autoScaleTimeOut(200);
    ChartUtils.autoScaleTimeOut(400);
    closeModal();
    ChartUtils.startAutoPosition();
    const chartNodesId = ChartUtils.getNodeIdList();
    const list = searchQueryList.concat({ search, chartNodesId });
    setSearchQueryList(list);
  };
  const deleteSelectSearchItem = (item) => {
    const list = searchQueryList && searchQueryList.filter((result, index) => {
      if (index !== item) {
        return true;
      }

      return false;
    });
    setSearchQueryList(list);
  };
  const handleClickOutside = (e) => {
    let searchNodes = document.getElementsByClassName('searchNodes');
    searchNodes = searchNodes.length ? searchNodes[0] : undefined;
    if (searchNodes && !searchNodes.contains(e.target)) {
      setSearch('');
      clearState();
      setToggleFilterBox(false);
    }
  };
  const formatHtml = (text) => text.replace(new RegExp(Utils.escRegExp(search), 'ig'), '<b>$&</b>');
  // useEffect
  useEffect(() => {
    if (chosenNodes.length > 0 && chosenNodes.length === result.length) {
      setAllNodesSelected(true);
    }
  }, [chosenNodes, graphId]);
  useEffect(() => {
    const checkedFilterList = Object.values(filterList).filter((n) => n === false);
    if (checkedFilterList.length === Object.values(filterList).length) {
      setResult([]);
    }
  }, [filterList, graphId]);
  useEffect(() => {
    setSearchQueryList([]);
  }, [singleGraphStatus, graphId]);
  useEffect(() => {
    Chart.event.on('window.mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showNodeData = !!(matched.name === true || matched.keywords === true || matched.tab === true || matched.tag === true);
  const showTypeData = !!(matched.type === true);
  const types = ChartUtils.getNodeTypeListByObj(result, search);
  return (

    <>
      <Modal
        isOpen
        className="ghModal ghModalSearch searchNodes"
        overlayClassName="ghModalOverlay searchOverlay"
      >
        <div className="searchField">
          <div className="searchBox">
            <div className="searchBoxInside">
              <div className="searchFieldCheckBox">
                <div className="chooseSearchFields" onClick={toggleFilter}>
                  Filters
                  <DownSvg className="dropDownSvg" />
                </div>
                {toggleFilterBox
                  && (
                    <div className="searchFieldCheckBoxList">
                      <div
                        onClick={() => handleFilterChange('all')}
                        className="checkBox checkBoxAll"
                        style={{ color: checkBoxAll ? '#7166F8' : '#BEBEBE' }}
                      >
                        All
                      </div>
                      {Object.keys(filterList).map((field) => (
                        <div
                          onClick={() => handleFilterChange(field)}
                          className={`checkBox checkBox${field}`}
                          style={{ color: filterList[field] ? '#7166F8' : '#BEBEBE' }}
                        >
                          {field}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
              <input
                autoComplete="off"
                value={search}
                className="nodeSearch"
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

        </div>
        <div className="search-content">

          {result.length > 0 ? (
            <div className="selectedNodesCheckBox">
              <div>
                <Checkbox
                  label={allNodesSelected ? 'Unselect all' : 'Select all'}
                  checked={allNodesSelected}
                  onChange={selectAllNodes}
                />
              </div>
              <p className="selectedItemsAmount">
                Selected Nodes
                {` ${chosenNodes.length}`}
              </p>
            </div>
          ) : ''}

          <ul className="list">
            {showTypeData && types.map((d) => (
              <li
                className="item nodeItem types"
                key={`types_${d}`}
              >

                <Checkbox
                  name={`types_${d}`}
                  checked={d.checked}
                  onChange={() => handleTypeCheckBoxChange(ChartUtils.getTotalNodesByType(result, d))}
                />
                <div
                  tabIndex={d}
                  role="button"
                  className="ghButton searchItem"
                  onClick={() => handleTypeCheckBoxChange(ChartUtils.getTotalNodesByType(result, d), `types_${d}`)}
                >
                  <div className="right">
                    <span className="row">
                      <span
                        className="name"
                      >
                        {d}
                      </span>
                      <span
                        className="type"
                      >
                        {ChartUtils.getTotalNodesByType(result, d).length}
                      </span>
                    </span>

                  </div>
                </div>
              </li>
            ))}
            {showNodeData && result.map((item) => {
              const tabValues = item.customFields && item.customFields.length > 0
                ? item.customFields.map((tab) => tab.value).join(', ')
                : false;
              if (item.name.toLowerCase().includes(search.toLowerCase()) || item.keywords.join(', ').toLowerCase().includes(search.toLowerCase())) {
                return (
                  <li
                    className="item nodeItem"
                    key={`name_${item.id}`}
                  >

                    <Checkbox
                      name={`name_${item.id}`}
                      checked={item.checked}
                      onChange={() => handleNodesCheckBoxChange(item)}
                    />
                    <div
                      tabIndex={item.id}
                      role="button"
                      className="ghButton searchItem"
                      onClick={() => handleNodesCheckBoxChange(item, `name_${item.id}`)}
                    >
                      <div className="left">
                        <NodeIcon node={item} searchIcon />
                      </div>
                      <div className="right">
                        <span className="row">
                          <span
                            className="name"
                            title={item.name}
                            dangerouslySetInnerHTML={{
                              __html: formatHtml(item.name),
                            }}
                          />
                          <span
                            className="type"
                            dangerouslySetInnerHTML={{
                              __html: formatHtml(item.type),
                            }}
                          />
                          {item.keywords.join(',').toLowerCase().includes(search.toLowerCase()) ? (
                            <span
                              className="keywords"
                              dangerouslySetInnerHTML={{
                                __html: item.keywords
                                  .map((k) => formatHtml(k))
                                  .join(', '),
                              }}
                            />
                          ) : null}
                          {/* {tabValues
                        && tabValues.toLowerCase().includes(search.toLowerCase()) ? (
                        <span
                          className="nodeTabs"
                          dangerouslySetInnerHTML={{
                            __html: item.customFields.map((tab) => tab.value).join(', '),
                          }}
                        />
                      ) : null} */}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              }
            })}
          </ul>
        </div>
        {chosenNodes.length ? (
          <div className="acceptCheckedItems">
            <button
              onClick={() => showSelectedNodes()}
              className="btn-classic"
              type="button"
            >
              Show
            </button>
            {chartNodes.length < totalNodes ? (
              <button
                onClick={() => showSelectedNodes(true)}
                className="btn-classic btn-existing"
                type="button"
              >
                Add to existing
              </button>
            ) : ''}
          </div>
        ) : (
          ''
        )}
      </Modal>
      <div className="select-search">
        {searchQueryList && searchQueryList.map((searchList, index) => (
          <SelectSearchList search={searchList} key={index} deleteSelectSearchItem={() => deleteSelectSearchItem(index)} />
        ))}
      </div>
    </>
  );
};
SearchModal.propTypes = {
  graphId: PropTypes.string.isRequired,
};

export default SearchModal;
