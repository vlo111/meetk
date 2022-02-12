import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { toast } from 'react-toastify';
import Button from '../form/Button';
import { setActiveButton, toggleGraphMap } from '../../store/actions/app';
import NodeIcon from '../NodeIcon';
import ChartUtils from '../../helpers/ChartUtils';
import Utils from '../../helpers/Utils';
import { setActiveTab, getGraphNodesRequest } from '../../store/actions/graphs';
import Chart from '../../Chart';
import { ReactComponent as DownSvg } from '../../assets/images/icons/down.svg';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Outside from '../Outside';
import Icon from '../form/Icon';

class SearchModal extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    toggleGraphMap: PropTypes.func.isRequired,
    getGraphNodesRequest: PropTypes.func.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    graphId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      tabs: [],
      search: '',
      docs: [],
      keywords: [],
      checkBoxValues: {
        name: true,
        tab: true,
        tag: true,
        keyword: true,
      },
      tabsContentVisibility: {},
    };
  }

  closeModal = () => {
    this.props.setActiveButton('create');

    this.handleChange('');
  };

  /**
   * If search query have more then one symbol search it in back end
   * @param {string} search
   * @returns
   */
  handleChange = async (search = '') => {
    this.setState({
      nodes: [], search, tabs: [], docs: [], keywords: [],
    });
    if (!search) {
      this.props.toggleGraphMap(false);
    }
    if (search.length > 1) {
      this.displaySearchResultList(search);
    }
  };

  /**
   * Send search string to back end
   * @returns
   */
  searchResults = async (search) => {
    const { graphId } = this.props;
    const { checkBoxValues } = this.state;
    const argument = {
      s: search,
      graphId,
      findNode: false,
      searchParameters: checkBoxValues,
    };
    const searchResults = await this.props.getGraphNodesRequest(1, argument);
    return searchResults.payload.data;
  };

  /**
   * Search query in nodes, media tags, and node tabs and display result as a list
   * @param {string} search
   */
  displaySearchResultList = async (search) => {
    const tabs = [];
    let tabArray = [];
    let keywords = [];
    let docs = [];
    let nodes = [];

    const foundNodes = await this.searchResults(search);
    const ifNodeExists = (node) => {
      const frontNodes = Chart.getNodes();
      if (frontNodes.filter((nd) => nd.id === node.id).length) {
        return true;
      }

      const labels = Chart.getLabels();
      if (labels.filter((label) => label.nodes.includes(node.id)).length) {
        return true;
      }
      return false;
    };

    if (foundNodes.tags && foundNodes.tags.length > 0) {
      docs = foundNodes.tags ? foundNodes.tags : [];
      docs = docs.filter((nd) => ifNodeExists(nd));
    }
    nodes = foundNodes.nodes ? foundNodes.nodes : [];
    keywords = foundNodes.keywords ? foundNodes.keywords : [];

    try {
      if (foundNodes?.tabs?.length > 0) {
        const tabsList = foundNodes.tabs;
        if (tabsList.length > 0) {
          const tabsContentVisibility = {};
          tabsList.forEach((node) => {
            // set all tabs content visibility false
            tabsContentVisibility[`content_${node.id.replace('.', '_')}`] = false;
            if (node.customFields?.length) {
              node.customFields.forEach((tab) => {
                if (tab.value === undefined) {
                  return;
                }
                const tabContent = tab.value;
                const html = document.createElement('div');
                html.innerHTML = tabContent;
                const tagsElement = html.getElementsByClassName('tags');
                if (tagsElement.length) {
                  tagsElement[0].remove();
                }
                const cleanedText = html.innerText;
                if (cleanedText.toLowerCase().includes(search.toLowerCase())) {
                  const tabName = tab.name;
                  const tabContentHtml = document.createElement('div');
                  tabContentHtml.innerHTML = tabContent;
                  const tabSearchValue = tabContentHtml.textContent;
                  tabs.push({
                    nodeId: node.id,
                    node,
                    tabName,
                    tabContent,
                    tabSearchValue,
                  });
                }
              });
            }
          });
        }
        const groupBy = (array, key) => array.reduce((result, obj) => {
          (result[obj[key]] = result[obj[key]] || []).push(obj);
          if (obj.node.name.length > 40) {
            obj.node.name = `${obj.node.name.slice(0, 40)}...`;
          }
          result[obj[key]].node = obj.node;
          return result;
        }, {});
        tabArray = groupBy(tabs, 'nodeId') ?? [];
      }
    } catch (e) {
      toast.error('Error accrued while searching');
    }
    this.setState({
      nodes, tabs: tabArray, docs, keywords,
    });
    this.props.toggleGraphMap(true);
  };

  /**
   * Find search string in text and make it bold
   * @param {string} text
   * @returns
   */
  formatHtml = (text) => {
    const { search } = this.state;
    return text.replace(new RegExp(Utils.escRegExp(search), 'ig'), '<b>$&</b>');
  };

  /**
   * Toggle folder and bring nodes inside it
   * @param {object} e
   * @param {object} label
   * @param {object} node
   * @param {string} tabName
   */
  openFolder = (e, label, node, tabName = false) => {
    label.open = true;
    Chart.event.emit('folder.open', e, label);
    const lbs = Chart.getLabels().map((lb) => {
      if (lb.id === label.id) {
        lb.open = true;
      }
      return lb;
    });
    Chart.render({ labels: lbs });
    this.closeModal();

    setTimeout(() => {
      const nodes = Chart.getNodes();
      const theNode = nodes.find((n) => n.id === node.id);
      if (theNode) {
        ChartUtils.findNodeInDom(node);
      }
      if (tabName) {
        this.props.setActiveTab(tabName);
      }
      this.props.history.replace(`${window.location.pathname}?info=${node.id}`);
    }, 500);
  };

  /**
   * Open node which contains searched tags if it's inside folder call openFolder
   * @param {object} e
   * @param {object} tagNode
   */
  openNodeByTag = async (e, tagNode) => {
    const availableNodes = Chart.getNodes();
    const labels = Chart.getLabels();
    const isNodeAvailable = availableNodes.find((nd) => nd.id === tagNode.id);
    if (isNodeAvailable) {
      this.closeModal();
      ChartUtils.findNodeInDom(isNodeAvailable);
      if (tagNode.tabName) {
        this.props.setActiveTab(tagNode.tabName);
      }
      this.props.history.replace(
        `${window.location.pathname}?info=${isNodeAvailable.id}`,
      );
    } else {
      const label = labels.find((lbl) => lbl.nodes.includes(tagNode.id));
      if (tagNode.tabName) {
        this.openFolder(e, label, tagNode, tagNode.tabName);
      } else {
        this.openFolder(e, label, tagNode);
      }
    }
  };

  /**
   * Open chosen node if it's inside folder call openFolder
   * @param {object} e
   * @param {object} node
   */
  openNode = async (e, node) => {
    const availableNodes = Chart.getNodes();
    const labels = Chart.getLabels();
    const ifNode = !node.tags;
    const isNodeAvailable = availableNodes.find((nd) => nd.id === node.id);
    if (isNodeAvailable) {
      ChartUtils.findNodeInDom(node);
      this.props.history.replace(
        `${window.location.pathname}?info=${isNodeAvailable.id}`,
      );
      this.closeModal();
    } else if (ifNode) {
      await node.labels.map(async (labelId) => {
        const label = labels.find((lb) => lb.id === labelId);
        if (label && label.type === 'folder') {
          if (label.open === false) {
            this.openFolder(e, label, node);
          }
        }
      });
    }
  };

  /**
   * Open chosen tab of node if it's inside folder call openFolder
   * @param {*} e
   * @param {*} node
   * @param {*} tabName
   */
  openTab = (e, node, tabName) => {
    const availableNodes = Chart.getNodes();
    const labels = Chart.getLabels();
    const isNodeAvailable = availableNodes.find((nd) => nd.id === node.id);
    if (isNodeAvailable) {
      ChartUtils.findNodeInDom(node);
      this.props.setActiveTab(tabName);
      this.props.history.replace(
        `${window.location.pathname}?info=${isNodeAvailable.id}`,
      );
      this.closeModal();
    } else {
      const label = labels.find((lbl) => lbl.nodes.includes(node.id));
      if (label) {
        this.openFolder(e, label, node, tabName);
      }
    }
  };

  /**
   * Filter user search by name, tab, tag, keywords
   * @param {object} e
   */
  handleCheckBoxChange = (e) => {
    const { checkBoxValues, search } = this.state;
    const { target } = e;
    const name = target.innerText.toLowerCase();
    if (name === 'all') {
      let value = true;
      const checkBoxFields = Object.values(checkBoxValues).filter((el) => el === value);
      if (checkBoxFields.length === 4) {
        value = false;
      } else {
        value = true;
      }
      const allCheckElements = Array.from(document.getElementsByClassName('checkBox'));

      allCheckElements.forEach((element) => {
        element.style.color = value ? '#1CC5DC' : '#BEBEBE';
      });
      // this.setState({ checkBoxAll: value });
      for (const key in checkBoxValues) {
        _.set(checkBoxValues, key, value);
        this.setState({ checkBoxValues });
      }
    } else {
      const value = !checkBoxValues[name];
      _.set(checkBoxValues, name, value);
      this.setState({ checkBoxValues });
      target.style.color = value ? '#1CC5DC' : '#BEBEBE';
      const checkBoxFields = Object.values(checkBoxValues).filter((el) => el === value);
      if (checkBoxFields.length === 4) {
        // this.setState({ checkBoxAll: value });
        Array.from(document.getElementsByClassName('checkBoxAll')).forEach(
          (element) => {
            element.style.color = value ? '#7166F8' : '#BEBEBE';
          },
        );
      }
    }
    this.handleChange(search);
  };

  findNodeInDom = (node, closeModal = true) => {
    if (closeModal && closeModal !== 'closeMap') {
      this.closeModal();
    } else if (closeModal !== 'closeMap') {
      this.props.toggleGraphMap(true);
    }
    const nodeInDom = Chart.getNodes().find((nd) => nd.id === node.id);
    ChartUtils.findNodeInDom(nodeInDom);
  }

  handleTabToggle = (ev, id, tabName) => {
    const { tabsContentVisibility } = this.state;
    ev.stopPropagation();
    const idName = `content_${id.replace('.', '_')}_${tabName.replaceAll(' ', '_')}`;
    const contentWrapper = document.getElementById(idName);
    const isVisible = tabsContentVisibility[idName];

    contentWrapper.style.display = isVisible ? 'block' : 'none';
    _.set(tabsContentVisibility, idName, !isVisible);
  }

  render() {
    const {
      nodes, tabs, search, docs, keywords, checkBoxValues,
    } = this.state;
    return (
      <Modal
        isOpen
        className="ghModal ghModalEditSearch editSearchNodes ghModalSearch searchNodes searchMenuNodes"
        overlayClassName=" searchOverlay "
        id="searchMenuNodes"
      >
        <div className="searchField">
          <Button
            color="transparent"
            className="close searchButtonClosed"
            icon={<CloseSvg />}
            onClick={() => this.closeModal()}
            disabled={!search}
          />
          {' '}
          <div className="searchBox">
            <div className="searchBoxInside">
              <div className="searchFieldCheckBox">
                <div className="chooseSearchFields">
                  Filters
                  <Icon value="fa-chevron-down" className="down" />

                </div>
                <div className="searchFieldCheckBoxList">
                  <div
                    onClick={this.handleCheckBoxChange}
                    className="checkBox checkBoxAll"
                  >
                    All
                  </div>
                  {Object.keys(checkBoxValues).map((field) => (
                    <div
                      onClick={this.handleCheckBoxChange}
                      className={`checkBox checkBox${field}`}
                    >
                      {field}
                    </div>
                  ))}
                </div>
              </div>
              <input
                placeholder="Search"
                autoComplete="off"
                value={search}
                className="nodeSearch"
                onChange={(e) => this.handleChange(e.target.value)}
              />
            </div>
          </div>
        </div>
        <Outside
          onClick={() => this.handleChange()}
        >
          <ul
            className="list"
          >
            {nodes.map((d) => (
              <li
                className="item nodeItem"
                key={d.index}
              >
                <div
                  onMouseOver={() => { this.findNodeInDom(d, false); }}
                  tabIndex="0"
                  role="button"
                  className="ghButton searchItem"
                  onClick={(e) => this.openNode(e, d)}
                >
                  <div className="left">
                    <NodeIcon node={d} searchIcon />
                  </div>
                  <div className="right">
                    <span className="row">
                      <span
                        className="name"
                        title={d.name}
                        dangerouslySetInnerHTML={{
                          __html: this.formatHtml(d.name),
                        }}
                      />
                      <span className="typeText">Type:</span>

                      <span
                        className="type"
                        dangerouslySetInnerHTML={{
                          __html: this.formatHtml(d.type),
                        }}
                      />
                    </span>
                    {!d.name.toLowerCase().includes(search)
                      && !d.type.toLowerCase().includes(search) ? (

                        <span
                          className="keywords"
                          dangerouslySetInnerHTML={{
                            __html: d.keywords
                              .map((k) => this.formatHtml(k))
                              .join(', '),
                          }}
                        />
                      ) : null}
                  </div>
                </div>
              </li>
            ))}

            {Object.keys(tabs)
              && Object.keys(tabs).map((item) => (
                <li
                  className="item nodeItem"
                  key={tabs[item]?.node?.id}
                  onMouseOver={() => { this.findNodeInDom(tabs[item].node, false); }}
                >
                  <div tabIndex="0" role="button" className="ghButton tabButton">
                    <div className="header" onClick={() => this.findNodeInDom(tabs[item].node)}>
                      <div className="right tabRight">
                        {Object.keys(tabs[item]).map(
                          (tab) => tabs[item][tab].nodeId && (
                            <div className="contentTabs">
                              <span className="row nodeTabs">
                                <div
                                  className="contentWrapper"
                                  onClick={(e) => this.openTab(e, tabs[item].node, tabs[item][tab].tabName)}
                                >
                                  <div className="tabNameLine ">
                                    <NodeIcon node={tabs[item].node} searchIcon />
                                    <span className="name">{tabs[item].node.name}</span>
                                    <span className="nodeType">
                                      {' '}
                                      <span className="typeText">Type:</span>
                                      {' '}
                                      {tabs[item].node.type}
                                    </span>
                                    <div className="toggleTabBox">
                                      <DownSvg
                                        onClick={(ev) => {
                                          this.handleTabToggle(ev, tabs[item]?.node?.id, tabs[item][tab].tabName);
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div
                                    className="content"
                                    id={
                                      `content_${tabs[item]?.node?.id
                                        .replace('.', '_')
                                      }_${tabs[item][tab].tabName
                                        .replaceAll(' ', '_').replaceAll('  ', '_')}`
                                    }
                                  >
                                    <span
                                      className="type"
                                      dangerouslySetInnerHTML={{
                                        __html: this.formatHtml(
                                          tabs[item][tab].tabContent,
                                        ),
                                      }}
                                    />
                                  </div>
                                </div>
                              </span>
                              {!tabs[item][tab].tabName.toLowerCase().includes(search)
                                && !tabs[item][tab].tabSearchValue.toLowerCase().includes(search) ? (
                                  <span
                                    className="keywords"
                                    dangerouslySetInnerHTML={{
                                      __html: tabs[item][tab].keywords
                                        ?.map((k) => this.formatHtml(k))
                                        .join(', '),
                                    }}
                                  />
                                ) : null}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}

            {keywords.map((d) => (
              <li
                className="item nodeItem"
                key={d.index}
                onMouseOver={() => { this.findNodeInDom(d, false); }}
              >
                <div
                  tabIndex="0"
                  role="button"
                  className="ghButton searchItem"
                  onClick={(e) => this.openNode(e, d)}
                >
                  <div className="left">
                    <NodeIcon node={d} searchIcon />
                  </div>
                  <div className="right">
                    <span className="row">
                      <span
                        className="name"
                        title={d.name}
                        dangerouslySetInnerHTML={{
                          __html: this.formatHtml(d.name),
                        }}
                      />
                      <span
                        className="type"
                        dangerouslySetInnerHTML={{
                          __html: this.formatHtml(d.type),
                        }}
                      />
                    </span>

                    <span
                      className="keywords"
                      dangerouslySetInnerHTML={{
                        __html: this.formatHtml(d.keywords.join(', ')),
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}

            {docs.map((d, index) => (
              <li
                className="item nodeItem"
                key={index}
                onMouseOver={() => { this.findNodeInDom(d, false); }}
              >
                <div
                  tabIndex="0"
                  role="button"
                  className="ghButton searchItem"
                  onClick={(e) => this.openNodeByTag(e, d)}
                >
                  <div className="right">
                    <span className="row">
                      <span
                        className="name"
                        dangerouslySetInnerHTML={{
                          __html: this.formatHtml(d.name),
                        }}
                      />
                      <span
                        className="type"
                        dangerouslySetInnerHTML={{
                          __html: this.formatHtml(d.type),
                        }}
                      />
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Outside>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  graphId: state.graphs.singleGraph.id,
});

const mapDispatchToProps = {
  setActiveTab,
  setActiveButton,
  getGraphNodesRequest,
  toggleGraphMap,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(SearchModal);

export default Container;
