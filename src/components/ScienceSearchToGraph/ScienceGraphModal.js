import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { parseStringPromise } from 'xml2js';
import moment from 'moment';
import { toast } from 'react-toastify';
import { setActiveButton, toggleNodeModal } from '../../store/actions/app';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';
import { ReactComponent as ApiImg } from '../../assets/images/icons/science.svg';
import Api from '../../Api';
import { ScienceCategories } from '../../data/scienceCategory';
import Button from '../form/Button';
import Checkbox from '../form/Checkbox';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';

const {
  REACT_APP_ARXIV_URL,
  REACT_APP_CORE_URL,
} = Api;

class ScienceGraphModal extends Component {
  static propTypes = {
    currentUserId: PropTypes.number.isRequired,
    singleGraphId: PropTypes.number.isRequired,
    setActiveButton: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      apiSearchReturnValues: [],
      apiTitleSearchTerms: '',
      apiAuthorSearchTerms: '',
      getChecked: false,
      searchResults: null,
      checkedList: [],

    };
  }

  /**
   * Search user input in core and arxiv APIs
   *
   * @param {object} e
   * @returns
   */
  handleSearch = async (e) => {
    const { apiTitleSearchTerms, apiAuthorSearchTerms } = this.state;
    this.setState({
      searchResults: null,
      checkedList: [],
    });
    e.preventDefault();

    if (apiTitleSearchTerms?.length > 0
        && apiAuthorSearchTerms?.length > 0) {
      return;
    }
    this.setState({
      apiSearchReturnValues: [],
    });

    Chart.loading(true);
    const apiSearchReturnValues = [];

    // combined author and topic fields and putted it in arxivUrl and coreUrl
    const arxivUrl = `${REACT_APP_ARXIV_URL
    }search_query=all:${apiTitleSearchTerms} ${apiAuthorSearchTerms}&sortBy=relevance&max_results=30`;
    const author = apiAuthorSearchTerms || '';
    const title = apiTitleSearchTerms
      ? `title:${apiTitleSearchTerms}`
      : '';
    const coreUrl = `${REACT_APP_CORE_URL
    }"${title} ${author}"?page=1&pageSize=10&fulltext=false&citations=true&metadata=true&apiKey=uRj8cMByiodHF0Z61XQxzVUfqpkYJW2D`;

    const urls = [
      {
        url: arxivUrl,
        name: 'arxiv',
      },
      {
        url: coreUrl,
        name: 'core',
      },
    ];
    let fetchedSources = await this.fetchUrls(urls);
    fetchedSources = fetchedSources.filter((source) => source?.articles);
    if (!fetchedSources.filter((source) => source != undefined)) {
      this.setState({
        searchResults: 0,
      });
      Chart.loading(false);
      return;
    }

    let arxivJsonData = '';
    let coreJsonData = '';
    if (fetchedSources.find((source) => source.name === 'arxiv') != undefined) {
      const arxivResponse = fetchedSources.find(
        (source) => source.name === 'arxiv',
      ).articles;
      const arxivXml = await arxivResponse.text();
      arxivJsonData = await parseStringPromise(arxivXml);
    }
    if (fetchedSources.find((source) => source.name === 'core') != undefined) {
      const coreResponse = fetchedSources.find(
        (source) => source.name === 'core',
      ).articles;
      const coreString = await coreResponse.text();
      coreJsonData = JSON.parse(coreString);
    }

    if (!arxivJsonData && !coreJsonData) {
      this.setState({
        searchResults: 0,
      });
      Chart.loading(false);
      return;
    }
    if (arxivJsonData.feed.entry) {
      await arxivJsonData.feed.entry.map((article) => {
        const categoryAcronim = article.category[0].$.term.trim();
        const category = ScienceCategories.find(
          (category) => category.acronym.trim() === categoryAcronim,
        );
        const topics = category ? [category.fullName] : undefined;
        const url = `${article?.id[0]?.replace('abs', 'pdf')}.pdf`;
        let authors = '';
        article.author.map((auth) => (authors += `${auth.name}, `));
        apiSearchReturnValues.push({
          authorsList: authors.split(',').slice(0, -1),
          authors,
          url,
          queryResultPageID: article.id[0].split('/').slice(-1)[0],
          title: article.title[0],
          abstract: article.summary[0],
          topics,
          published: article.published[0].split('T')[0],
          origin: ['arxiv'],
        });
      });
    }

    if (coreJsonData && coreJsonData.data) {
      await coreJsonData.data.map((article) => {
        const articleAlreadyExists = apiSearchReturnValues.find(
          (arxivArticle, index) => {
            if (arxivArticle.title === article.title) {
              if (
                !apiSearchReturnValues[
                  index
                ].origin.includes('core')
              ) {
                apiSearchReturnValues[index].origin.push(
                  'core',
                );
              }
              return arxivArticle;
            }
          },
        );

        if (articleAlreadyExists) {
          return;
        }
        let url = article.downloadUrl;
        if ((url?.length > 0) && article.urls) {
          url = article.urls[0];
        }
        if ((url === undefined || url === '') && article.relations) {
          url = article.relations[0];
        }
        if (
          !url
          || (url.split('/')[0] !== 'http:' && url.split('/')[0] !== 'https:')
          || !article.description
        ) {
          return;
        }

        let authors = '';
        article.authors.map((auth) => (authors += `${auth}, `));
        const topics = Array.isArray(article.topics)
          ? article.topics
          : article.topics.split(';');

        apiSearchReturnValues.push({
          authors,
          authorsList: article.authors,
          url,
          queryResultPageID: article.id,
          title: article.title,
          abstract: article.description,
          topics,
          published:
            article.year < new Date().getFullYear() ? article.year : '', // some articles in core have year 10000
          origin: ['core'],
        });
      });
    }
    this.setState({
      searchResults: apiSearchReturnValues.length,
      apiSearchReturnValues,
    });
    Chart.loading(false);
  };

  /**
   * Get results from core and arix
   *
   * @param {object[]} urls
   * @returns {object[]}
   */
  fetchUrls = async (urls) => {
    const result = await Promise.all(
      urls.map(async (url) => {
        try {
          const result = {
            articles: await fetch(url.url),
            name: url.name,
          };
          return result;
        } catch (e) {}
      }),
    );
    return result;
  };

  changeApiTitleSearchTerms = (e) => {
    this.setState({
      apiAuthorSearchTerms: e.target.value,
    });
  };

  changeApiAuthorSearchTerms = (e) => {
    this.setState({
      apiTitleSearchTerms: e.target.value,
    });
  };

  /**
   * Create nodes for selected Articles
   *
   * @param {object} ev
   */
  createSelectedNodes = async (ev) => {
    const { checkedList, apiSearchReturnValues } = this.state;
    Chart.loading(true);
    if (!checkedList.length) {
      return;
    }
    const chosenArticles = checkedList.map((articleIndex) => apiSearchReturnValues[parseInt(articleIndex)]);
    await this.getArticlesData(chosenArticles).then(async (res) => {
      if (res?.length && res[0]) {
        const firstNode = res[0];
        const nodes = Chart.getNodes();
        const nodeInDom = nodes.find((node) => node.id === firstNode.id);
        if (nodeInDom) {
          ChartUtils.findNodeInDom(nodeInDom);
        }
      } else {
        toast.warning('you already have this nodes!');
      }
      Chart.loading(false);
      this.close();
    });
  };

  /**
   * Get articles data from state by selected articles
   *
   * @param {object[]} chosenArticles
   * @returns {object[]}
   */
  getArticlesData = async (chosenArticles) => {
    if (!chosenArticles.length) {
      return;
    }
    const nodes = [...Chart.getNodes()];
    const ArticleList = [];
    for (const chosenArticle in chosenArticles) {
      const new_nodes = [];
      const new_links = [];
      const articleJson = chosenArticles[chosenArticle];
      articleJson.author = true;
      const { title, url, authorsList } = articleJson;

      const article = await this.createNode(
        nodes,
        title.trim(),
        url,
        'Article',
        articleJson,
      );
      new_nodes.push(article);

      const getAuthorsData = async () => {
        if (!authorsList) {
          return;
        }
        return this.getAuthors(
          authorsList,
          nodes,
          article,
          new_links,
          new_nodes,
        );
      };
      const AuthorsData = await getAuthorsData().then(this.sendResultsToBackEnd);
      ArticleList.push(AuthorsData);
    }
    return ArticleList;
  };

  /**
   * Create Article/Author Node
   *
   * @param {object[]} nodes
   * @param {string} name
   * @param {string} url
   * @param {string} type
   * @param {object} contentData
   * @returns {object}
   */
  createNode = (nodes, name, url, type, contentData = false) => {
    const { currentUserId } = this.props;
    const updatedAt = moment().unix();

    const keywords = contentData.topics ? contentData.topics : [];
    const arxivHref = url != undefined
      ? `
        <a href="${url}" target="_blank">
          Go to article
        </a>
      `
      : '';
    const about = contentData.author
      ? `<div>
        <br>Topics: ${contentData.topics}<br>
        <br>Published at: ${contentData.published}<br>
        <br>${contentData.abstract}<br>
        ${arxivHref}
      </div>`
      : false;

    const customFields = about
      ? [
        {
          name: 'About',
          subtitle: '',
          value: about,
        },
      ]
      : '';
    const _type = type || _.last(nodes)?.type || '';

    const node = {
      create: true,
      color: '',
      fx: -189.21749877929688 + Math.random() * 150,
      fy: -61.72186279296875 + Math.random() * 150,
      icon: undefined,
      id: ChartUtils.uniqueId(nodes),
      keywords,
      labels: [],
      link: url,
      name,
      type: _type,
      createdAt: updatedAt,
      updatedAt,
      customFields,
      createdUser: currentUserId,
      updatedUser: currentUserId,
    };

    ChartUtils.nodeColor(node);

    node.color = ChartUtils.nodeColorObj[_type];

    return node;
  };

  /**
   * Create author nodes compare and connect to article node
   *
   * @param {string[]} authorsList
   * @param {object[]} nodes
   * @param {object} article
   * @param {object[]} new_links
   * @param {object[]} new_nodes
   * @returns {object}
   */
  getAuthors = (authorsList, nodes, article, new_links, new_nodes) => {
    const { currentUserId } = this.props;
    const type = 'Author';
    return Promise.all(
      authorsList.map(async (author) => {
        const authorData = await this.createNode(
          nodes,
          author.trim(),
          author.url,
          type,
          { topics: article.keywords },
        );
        const target = authorData.id;
        const source = article.id;
        const links = [...(await Chart.getLinks())];

        const existingLink = links.find(
          (link) => link.target === target && link.source === source,
        );

        if (!existingLink) {
          const _type = type || _.last(links)?.type || '';
          const link = {
            create: true,
            createdAt: moment().unix(),
            direction: '',
            id: ChartUtils.uniqueId(links),
            linkType: type,
            source: article.id,
            status: 'approved',
            target: authorData.id,
            type: _type,
            value: 2,
            updatedAt: moment().unix(),
            createdUser: currentUserId,
            updatedUser: currentUserId,
          };
          new_links.push(link);
        }
        new_nodes.push(authorData);
        return { nodes: new_nodes, links: new_links };
      }),
    );
  };

  /**
   * Merge all new cerated nodes and links
   *
   * @param {object} res
   * @returns {object}
   */
  sendResultsToBackEnd = async (res) => {
    if (!res) {
      return;
    }
    if (!res.filter((obj) => obj !== undefined).length) {
      return;
    }
    const { singleGraphId } = this.props;
    const savedNodes = await Api.dataPast(singleGraphId, undefined, [0, 0], 'merge', {
      labels: [],
      nodes: res[0].nodes,
      links: res[0].links,
    }).catch((e) => e.response);
    if (res.status === 'error') {
      toast.error(res.message);
      return;
    }

    if (savedNodes?.data?.create?.nodes?.length > 0) { // check this out
      return savedNodes.data.create.nodes[0];
    }
  };

  handleCheckedButton = (param, e) => {
    const { checkedList } = this.state;
    e.preventDefault(false);
    if (checkedList.includes(param)) {
      this.setState({
        checkedList: checkedList.filter(
          (checkedItems) => checkedItems !== param,
        ),
      });
    } else {
      checkedList.push(param);
    }
    this.setState({
      getChecked: param,
    });
  };

  getListOfArticles = (apiSearchReturnValues, checkedList) => {
    const apiSearchResults = [];
    for (const index in apiSearchReturnValues) {
      apiSearchResults.push(
        <label className="pull-left" htmlFor={index}>
          <div
            tabIndex="0"
            className="scine scienceResultsList"
            onClick={(ev) => {
              const items = document.getElementsByClassName('scienceResultsList ');

              if (!checkedList.includes(index)) {
                items[index].style.backgroundColor = '#e5e3f5';
              } else {
                items[index].style.backgroundColor = 'white';
              }
              this.handleCheckedButton(index, ev);
            }}
            key={index}
          >
            <div className="scienceCheckBox">
              <Checkbox
                onChange={() => this.handleCheckedButton(index)}
                checked={checkedList.includes(index)}
                type="checkbox"
                name="layout"
                id={index}
                value="option1"
              />

            </div>

            <div className="scienceArticleData">
              <h3>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={apiSearchReturnValues[index].url}
                >
                  {apiSearchReturnValues[index].title}
                </a>
              </h3>
              <p className="scienceAuthor">

                <b>Authors: </b>
                {' '}
                {apiSearchReturnValues[index].authors}
              </p>
              {apiSearchReturnValues[index].topics ? (
                <p className="scienceAuthor">
                  <b>Topic: </b>
                  {apiSearchReturnValues[index].topics.join(', ')}
                </p>
              ) : (
                ''
              )}
              <div>
                {apiSearchReturnValues[index].origin.includes(
                  'arxiv',
                ) ? (
                  <b>
                    Source:
                    <a>https://arxiv.org/</a>
                  </b>

                  ) : (
                    ''
                  )}
                {apiSearchReturnValues[index].origin.includes(
                  'core',
                ) ? (
                  <b>
                    Source:
                    <a>https://core.ac.uk/</a>
                  </b>
                  ) : (
                    ''
                  )}
              </div>
              <p
                className=" scienceArticleDescription"
                dangerouslySetInnerHTML={{
                  __html:
                  `Abstract:${
                    apiSearchReturnValues[index].abstract}`
                  !== undefined
                    ? apiSearchReturnValues[index].abstract
                    : '',
                }}
              />
            </div>
          </div>
        </label>,
      );
    }
    return apiSearchResults;
  }

  close = () => {
    this.props.setActiveButton('create');
  }

  render() {
    const {
      checkedList,
      apiSearchReturnValues,
      apiAuthorSearchTerms,
      apiTitleSearchTerms,
      searchResults,
    } = this.state;
    const resultAmount = searchResults !== null
      ? `Got ${searchResults} results`
      : '';
    const apiSearchResults = this.getListOfArticles(apiSearchReturnValues, checkedList);

    return (
      <>
        <Modal
          isOpen
          className="ghModal ghMapsModal scienceModal"
          overlayClassName="ghModalOverlay ghMapsModalOverlay"
          onRequestClose={this.close}
        >
          <div className="scienceModalsubBox">
            <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.close} />

            <div className="scienceLogo">
              <ApiImg className="ApiImg" />
            </div>
            <div className="scienceForm">
              <div className="scienceFormInside">
                <form action="">
                  <input
                    className="scienceAuthorInput scienceInput"
                    type="text"
                    value={apiAuthorSearchTerms || ''}
                    onChange={this.changeApiTitleSearchTerms}
                    placeholder="Search Authors"
                  />
                  <input
                    className="scienceTitleInput scienceInput"
                    type="text"
                    value={apiTitleSearchTerms || ''}
                    onChange={this.changeApiAuthorSearchTerms}
                    placeholder="Search  Articles"
                    autoFocus
                  />
                  <button
                    className="scienceSearchSubmit button btn-classic"
                    type="submit"
                    onClick={this.handleSearch}
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>
            <div className="scienceResultBox">
              <div className="scienceResultAmountBox">
                <p className="scienceResultAmount">{resultAmount}</p>
                {checkedList.length ? (
                  <p className="selectedItemsAmount scinceItems">
                    Selected Articles
                    {' '}
                    {checkedList.length}
                  </p>
                ) : (
                  ''
                )}
              </div>
            </div>
            <div className="scinceGraphResukt">
              {' '}
              {apiSearchResults}
              {' '}
            </div>
          </div>
          <div className="acceptCheckedItems">
            {checkedList.length ? (
              <>
                <Button
                  onClick={(ev) => this.createSelectedNodes(ev)}
                  className="ghButton btn-classic creatGraphScience"
                >
                  Create Sub Graph
                </Button>
              </>
            ) : (
              ''
            )}
          </div>
        </Modal>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  customFields: state.graphs.customFields || {},
  singleGraphId: state.graphs.singleGraph.id,
  currentUserId: state.account.myAccount.id,
});

const mapDispatchToProps = {
  toggleNodeModal,
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ScienceGraphModal);

export default Container;
