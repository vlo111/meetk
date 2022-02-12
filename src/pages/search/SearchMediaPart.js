import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Utils from '../../helpers/Utils';
import ChartUtils from '../../helpers/ChartUtils';
import Loading from '../../components/Loading';
import bgImage from '../../assets/images/mediaDocument.png';
import NotFound from '../../assets/images/NotFound.png';

class SearchMediaPart extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, limit: 5 };
  }

    goToNodeTab = (graphId, node, userId) => {
      const { currentUserId } = this.props;
      const mode = currentUserId === userId ? 'update' : 'view';
      this.props.history.replace(`/graphs/${mode}/${graphId}?info=${node.id}`);
      ChartUtils.findNodeInDom(node);
    }

    componentDidMount() {
      if (this.state.loading) {
        const { documentSearch } = this.props;
        if (documentSearch && documentSearch.length) {
          this.setState({ loading: false });
        }
      }
    }

    render() {
      const { mediaMode, data, setLimit } = this.props;
      const { loading, limit } = this.state;

      if (data) {
        data.map((d) => {
          d.node = d.graphs.nodes.filter((n) => n.id === d.nodeId)[0];
          d.graphName = d.graphs.title;
          d.userName = `${d.user.firstName} ${d.user.lastName} `;
        });
      }
      return (
        <>
          {data && data.length ? (

            data.map((document) => (

              <>
                <article key={document.userId} className="graphs">
                  <div className="mediaPart_wrapper">
                    <div className="top">
                      <p
                        className="nodeLink"
                        onClick={() => this.goToNodeTab(
                          document.graphId,
                          document.node,
                          document.userId,
                        )}
                      >
                        <div className="right">
                          <span className="headerName">{document.node?.name}</span>
                        </div>
                      </p>
                      <div className="infoContent">
                        <img
                          className="avatar"
                          src={document.user.avatar}
                          alt={document.user.name}
                        />
                        <div className="infoWrapper">
                          <Link to={`/profile/${document.userId}`}>
                            <span className="author">{`${document.user.firstName} ${document.user.lastName}`}</span>
                          </Link>
                          <div className="info">
                            <span>{moment(document.updatedAt).calendar()}</span>
                          </div>
                        </div>
                      </div>

                      {document.altText
                        ? (
                          <a
                            download={document.altText}
                            target="_blank"
                            href={document.data}
                            rel="noreferrer"
                          >
                            {document.altText}
                          </a>
                        )
                        : (mediaMode === 'document'
                          ? (
                            <>
                            </>
                          )
                          : (
                            <>
                            </>
                          )
                        )}
                    </div>
                    <div className={`${document.type !== 'Video' ? 'media-item-hover' : ''}`}>
                      <div className="medInfo">
                        <div className="mediaInfo">
                          <span className="mediaLeter">Uploaded:</span>
                          <span className="searchDate">{moment(document.updatedAt).format('YYYY.MM.DD')}</span>
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
                                {Utils.substr(document.description, 90)}
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
                                  ? `${document.tags.slice(0, limit)}...`
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
                      {typeof document.data !== 'string'
                        ? (
                          <>

                          </>
                        )
                        : document.type !== 'Image' && document.type !== 'Video' && !Utils.isImg(document.data) ? (
                          <div className="documContainer ">
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
                      <div className="ooo">

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
                  </div>
                </article>
              </>
            ))
          ) : ((!setLimit && (!loading
            ? <Loading />
            : (
              <div className="not_graphfound">
                <img src={NotFound} />
                <h3>Not Found</h3>
              </div>
            ))) || null)}
        </>
      );
    }
}

export default SearchMediaPart;
