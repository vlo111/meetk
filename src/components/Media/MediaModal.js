import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import _ from 'lodash';
import { setActiveButton } from '../../store/actions/app';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { ReactComponent as CompressScreen } from '../../assets/images/icons/compress.svg';
import { ReactComponent as FullScreen } from '../../assets/images/icons/CompresMediaModal.svg';
import bgImage from '../../assets/images/mediaDocument.png';
import Button from '../form/Button';
import { getDocumentsRequest } from '../../store/actions/document';
import { getSingleGraphRequest, getAllTabsRequest, setActiveTab } from '../../store/actions/graphs';
import ChartUtils from '../../helpers/ChartUtils';
import Input from '../form/Input';
import Utils from '../../helpers/Utils';
import Outside from '../Outside';
import { ReactComponent as ArrowSvg } from '../../assets/images/icons/arrow.svg';
import Checkbox from '../form/Checkbox';
import Chart from '../../Chart';

class MediaModal extends Component {
  static propTypes = {
    getSingleGraphRequest: PropTypes.func.isRequired,
    getAllTabsRequest: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    getDocumentsRequest: PropTypes.func.isRequired,
    documentSearch: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    user: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  }

  initTabs = memoizeOne(() => {
    this.props.getAllTabsRequest(window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1));
  })

  initDocument = memoizeOne((document) => {
    document.forEach((p) => {
      if (p.graphs?.nodes && p.graphs?.nodes.length) {
        p.node = p.graphs.nodes.filter((n) => n.id === p.nodeId)[0];
      }
    });
  })

  searchDocuments = memoizeOne((searchParam) => {
    this.props.getDocumentsRequest(searchParam);
  })

  initialGraph = memoizeOne(() => {
    this.props.getSingleGraphRequest(this.props.singleGraph.id);
  });

  constructor() {
    super();
    this.state = {
      loading: true,
      getCheckedNodes: true,
      getCheckedDocs: true,
      getCheckedImages: true,
      getCheckedVideos: true,
      search: '',
      showDropDown: false,
      showVideo: false,
      fullWidth: false,

    };
  }

  componentDidMount() {
    if (this.state.loading) {
      const { documentSearch } = this.props;
      if (documentSearch && documentSearch.length) {
        this.setState({ loading: false });
      }
    }
    this.props.history.push(`/graphs/update/${this.props.singleGraph.id}`);
  }

  closeModal = () => {
    this.props.setActiveButton('create');
  }

  filterHandleChange = (path, value) => {
    switch (path) {
      case 'docs': {
        this.setState({
          getCheckedDocs: value,
        });
        break;
      }
      case 'Image': {
        this.setState({
          getCheckedImages: value,
        });
        break;
      }
      case 'videos': {
        this.setState({
          getCheckedVideos: value,
        });
        break;
      }
      case 'icon': {
        this.setState({
          getCheckedNodes: value,
        });
        break;
      }
      default:
        break;
    }
    const { getChecked } = this.state;
    _.set(getChecked, path, value);
  }

  searchHandleChange = (search = '') => {
    this.setState({ search });
  }

  openTab = (graphId, node, tabName) => {
    const availableNodes = Chart.getNodes();
    const isNodeAvailable = availableNodes.find((nd) => nd.id === node.id);
    if (isNodeAvailable || tabName) {
      ChartUtils.findNodeInDom(node);
      this.props.setActiveTab(tabName);
      this.props.history.replace(
        `${graphId || window.location.pathname}?info=${isNodeAvailable.id}`,
      );
      this.closeModal();
    }
  }

  insertDocument = (document) => {
    const { getCheckedDocs, getCheckedImages } = this.state;

    return document.filter((p) => {
      const type = typeof p.data === 'string' ? (Utils.isImg(p.data) ? 'Image' : 'document') : 'video';
      if (type === 'Image' && getCheckedImages) {
        return true;
      }
      return type !== 'Image' && type !== 'video' && getCheckedDocs;
    });
  }

  insertIcon = (document) => {
    const { singleGraph: { nodesPartial, user } } = this.props;

    if (nodesPartial && nodesPartial.length) {
      const { getCheckedNodes } = this.state;

      if (!getCheckedNodes) {
        document = document.filter((p) => !p.added);
      } else {
        nodesPartial.forEach((node) => {
          if (node.icon) {
            if (!document.filter((p) => p.added === node.id).length) {
              document.push({
                id: node.id,
                user,
                node,
                data: node.icon,
                added: node.id,
                type: 'Image',
                graphId: Utils.getGraphIdFormUrl(),
              });
            }
          }
        });
      }
    }

    return document;
  }

  insertVideo = (_document) => {
    const { singleGraph: { nodesPartial, user }, graphTabs } = this.props;

    const { getCheckedVideos } = this.state;

    if (graphTabs && graphTabs.length && !_.isEmpty(nodesPartial)) {
      graphTabs.forEach((p) => {
        const node = nodesPartial.filter((g) => g.id === p.nodeId)[0];
        const tabData = p.tab;

        tabData.forEach((tab) => {
          const mediaVideoHtml = document.createElement('div');
          mediaVideoHtml.innerHTML = tab.value;
          Array.from(mediaVideoHtml.getElementsByTagName('iframe')).forEach((el) => {
            if (getCheckedVideos) {
              _document.push({
                id: node.id,
                user,
                node,
                data: el,
                added: node.id,
                type: 'Video',
                graphId: Utils.getGraphIdFormUrl(),
              });
            }
          });
        });
      });

      return _document;
    }
  }

  toggleDropDown = () => {
    const { showDropDown } = this.state;
    this.setState({ showDropDown: !showDropDown });
  }

  toggleVideo = () => {
    const { showVideo } = this.state;
    this.setState({ showVideo: !showVideo });
  }

  toggleFullWidth = () => {
    const { fullWidth } = this.state;
    this.setState({ fullWidth: !fullWidth });
  }

  showMediaOver = (id) => {
    console.log(id);
    // document.getElementsByClassName(`medInfo1_${id}`)[0].style.display = 'flex';
  }

  hideMediaOver = (id) => {
    document.getElementsByClassName(`medInfo1_${id}`)[0].style.display = 'none';
  }

  render() {
    let { documentSearch } = this.props;

    this.initTabs();

    this.initialGraph();

    const {
      fullWidth, showDropDown, getCheckedVideos, getCheckedDocs, getCheckedImages, getCheckedNodes, search,
    } = this.state;
    const size = 3;
    const graphIdParam = Utils.getGraphIdFormUrl();

    this.searchDocuments(graphIdParam);

    if (documentSearch && documentSearch.length) {
      this.initDocument(documentSearch);

      // Node documents and images of tabs
      documentSearch = this.insertDocument(documentSearch);
    }

    // Insert node icon
    documentSearch = this.insertIcon(documentSearch);

    // Insert tab video
    documentSearch = this.insertVideo(documentSearch);

    // Search media
    documentSearch = documentSearch?.filter((p) => p.node?.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()));

    return (
      <div className="mediaModal">
        <Modal
          isOpen
          className="ghModal ghModalMedia"
          id={fullWidth ? 'fullWidth' : undefined}
          overlayClassName="ghModalOverlay"
          onRequestClose={this.closeModal}
        >
          <div className="">
            <Button className="reSize" color="transparent" icon={fullWidth ? <CompressScreen /> : <FullScreen />} onClick={this.toggleFullWidth} />
            <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeModal} />
          </div>
          <h2>Media Gallery</h2>
          <div className="mediaHeader">
            <div className="showCheck" onClick={this.toggleDropDown}>
              <div>Show</div>
              <div className="carretMedia">
                <ArrowSvg />
              </div>
            </div>
            {showDropDown ? (
              <Outside onClick={this.toggleDropDown} exclude=".showCheck">
                <div className="filterMedia">
                  <Checkbox
                    label="Node Icon"
                    checked={getCheckedNodes}
                    onChange={() => this.filterHandleChange('icon', !getCheckedNodes)}
                  />
                  <Checkbox
                    label="Documents of Tabs"
                    checked={getCheckedDocs}
                    onChange={() => this.filterHandleChange('docs', !getCheckedDocs)}
                  />
                  <Checkbox
                    label="Images of Tabs"
                    checked={getCheckedImages}
                    onChange={() => this.filterHandleChange('Image', !getCheckedImages)}
                  />
                  <Checkbox
                    label="Videos"
                    checked={getCheckedVideos}
                    onChange={() => this.filterHandleChange('videos', !getCheckedVideos)}
                  />
                </div>
              </Outside>
            ) : null}
            <Input
              placeholder="Search ..."
              autoComplete="off"
              value={search}
              onFocus={() => this.searchHandleChange(search)}
              onChangeText={this.searchHandleChange}
              className="mediaSearch "
              containerClassName="mediaSearch"
            />
          </div>
          {(documentSearch && documentSearch.length)
            ? (
              <div className="mediaContainer mediaGallery">
                {documentSearch.map((document) => {
                  document.tags = document?.tags?.filter((p) => p !== '');
                  return document.id && (
                    <div className="imageFrame">
                      <figure className="img-container">
                        <div className={`${document.type !== 'Video' ? 'media-item-hover' : ''}`}>
                          <div className="medInfo">
                            <div className="mediaInfo">
                              <span className="mediaLeter">Uploaded:</span>
                              <span className="item">{moment(document.updatedAt).format('YYYY.MM.DD')}</span>
                            </div>
                            <div className="mediaInfo maediaUserBloc">
                              <span className="mediaLeter">User Name:</span>
                              <span className="mediaUser">
                                <a href={`/profile/${document.user.id}`} target="_blank" rel="noreferrer">
                                  {`${document.user.firstName} ${document.user.lastName}`}
                                </a>
                              </span>
                            </div>
                            {_.isEmpty(document.data)
                              ? (
                                <></>
                              ) : (
                                <div className="mediaInfo docType">
                                  <span className="mediaLeter">type:</span>
                                  <span className="item">{document.data.substring(document.data.lastIndexOf('.') + 1).toUpperCase()}</span>
                                </div>
                              )}
                            {_.isEmpty(document.description)
                              ? (
                                <></>
                              ) : (
                                <div className="mediaInfo mediaDescription">
                                  <span className="mediaLeter">Description:</span>
                                  <span className="descriptionLeng">
                                    {Utils.substr(document.description, 45)}
                                  </span>
                                </div>
                              )}
                            {_.isEmpty(document.tags)
                              ? (
                                <></>
                              ) : (
                                <div className="mediaInfo maediaTags">
                                  <span className="mediaLeter">Tags:</span>
                                  <div className="maediaTagsleng">
                                    {`${document.tags
                                      ? `${document.tags.slice(0, size)}...`
                                      : document.tags
                                    } `}
                                    {' '}
                                  </div>
                                </div>
                              )}
                            {document.type !== 'Image' && document.type !== 'Video' && !Utils.isImg(document.data)
                              ? (
                                <div className="wiewDoc">
                                  <i className="fa fa-download" />
                                  <a target="_blank" href={document.data} rel="noreferrer">
                                    Download
                                  </a>
                                </div>
                              ) : document.type === 'Image' && Utils.isImg(document.data) ? (
                                <div className="wiewDoc viewImg">
                                  <i className="fa fa-eye" />
                                  <a target="_blank" href={document.data} rel="noreferrer">View</a>
                                </div>
                              ) : (
                                <div className="wiewDoc viewImg">
                                  <i className="fa fa-eye" />
                                  <a target="_blank" href={document.data} rel="noreferrer">View</a>
                                </div>
                              )}
                          </div>
                          <div>
                            {typeof document.data !== 'string'
                              ? (
                                <div>
                                  <iframe
                                    src={document.data.src}
                                    className="mediaVideo"
                                  />
                                </div>
                              )
                              : document.type !== 'Image' && document.type !== 'Video' && !Utils.isImg(document.data) ? (
                                <div className="documContainer">
                                  <img
                                    src={Utils.isImg(document.data) ? document.data : bgImage}
                                    className="mediaDocument"
                                  />
                                </div>
                              ) : (
                                <img
                                  className="gallery-box__img"
                                  src={document.data}
                                />
                              )}
                          </div>
                        </div>
                        <span
                          className="nodeLink"
                          onClick={
                            () => this.openTab(document.graphId, document.node, document.tabName)
                          }
                        >
                          <div className="containerMedia">
                            <img
                              className="userImg"
                              src={document.user.avatar}
                            />
                            <div className="ooo">
                              <span title={document.node.name} className="headerName">
                                {Utils.substr(document.node.name, 15)}
                              </span>
                              {document.type === 'Video' || document.type === 'Image'
                                ? (
                                  <span className="typeDocument">
                                    {' '}
                                    {document.type}
                                    {' '}
                                  </span>
                                ) : Utils.isImg(document.data) ? (
                                  <span className="typeDocument">Image</span>
                                ) : !Utils.isImg(document.data) ? (
                                  <span className="typeDocument">Document</span>
                                )
                                  : (<span className="typeDocument">Document</span>)}
                            </div>
                          </div>
                        </span>
                      </figure>
                    </div>
                  );
                })}
              </div>
            ) : <h3 className="mediaNotFound">No Media Found</h3>}
        </Modal>

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  documentSearch: state.document.documentSearch,
  singleGraph: state.graphs.singleGraph,
  graphTabs: state.graphs.graphTabs,
});

const mapDispatchToProps = {
  setActiveButton,
  setActiveTab,
  getDocumentsRequest,
  getSingleGraphRequest,
  getAllTabsRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MediaModal);

export default Container;
