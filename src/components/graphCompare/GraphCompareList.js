import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import LabelCompareItem from '../labelCopy/LabelCompareItem';
import Checkbox from '../form/Checkbox';

class GraphCompareList extends Component {
    static defaultProps = {
      width: Math.min(window.innerWidth - 220, 1024),
    }

    static propTypes = {
      singleGraph1: PropTypes.object.isRequired,
      singleGraph2: PropTypes.object.isRequired,
      selectedNodes1: PropTypes.array.isRequired,
      selectedNodes2: PropTypes.array.isRequired,
      onChange: PropTypes.func.isRequired,
      title: PropTypes.object.isRequired,
      importGraph: PropTypes.object.isRequired,
      selected: PropTypes.array.isRequired,
    }

    constructor(props) {
      super(props);
      this.state = {
        selectAllLeft: true,
        selectAllRight: true,
      };
    }

    componentDidMount() {
      const { selected, singleGraph1, singleGraph2 } = this.props;

      if (selected) {
        const totalSelected1 = singleGraph1?.nodes?.length
          === singleGraph1?.nodes?.filter((p) => selected.filter((s) => s.name === p.name).length).length;
        const totalSelected2 = singleGraph2?.nodes?.length
          === singleGraph2?.nodes?.filter((p) => selected.filter((s) => s.name === p.name).length).length;

        this.setState({
          selectAllLeft: totalSelected1,
          selectAllRight: totalSelected2,
        });
      }
    }

    handleChange(node, checked, col) {
      this.props.onChange(node, checked, col);
      let {
        selectedNodes1, selectedNodes2,
      } = this.props;
      const {
        singleGraph1, singleGraph2,
      } = this.props;

      if (singleGraph1 && col === 1) {
        node.fx = node.x;
        node.fy = node.y;
        if (checked) {
          selectedNodes1.push(node);
        } else {
          selectedNodes1 = selectedNodes1.filter((nd) => nd.fx !== node.fx && nd.fy !== node.fy);
        }
        const allNodesAreSelected = !singleGraph1.nodes.find((nd) => !!selectedNodes1.find((n) => nd.x === n.fx && nd.y === n.fy) !== true);
        this.setState({ selectAllLeft: allNodesAreSelected });
      }
      if (singleGraph2 && col === 2) {
        if (checked) {
          selectedNodes2.push(node);
        } else {
          selectedNodes2 = selectedNodes2.filter((nd) => nd.fx !== node.fx && nd.fy !== node.fy);
        }
        const allNodesAreSelected = !singleGraph2.nodes.find((nd) => !selectedNodes2.find((n) => nd.fx === n.fx && nd.fy === n.fy));
        this.setState({ selectAllRight: allNodesAreSelected });
      }
    }

    toggleAllLeft = () => {
      const { selectAllLeft } = this.state;

      this.setState({
        selectAllLeft: !selectAllLeft,
      });

      const { singleGraph1 } = this.props;

      (singleGraph1?.nodes || []).forEach((n) => {
        this.props.onChange(n, !selectAllLeft, 1);
      });
    }

    toggleAllRight = () => {
      const { selectAllRight } = this.state;

      const { singleGraph1, singleGraph2 } = this.props;

      const isSimilar = singleGraph1 && singleGraph2;

      this.setState({
        selectAllRight: !selectAllRight,
      });

      if (isSimilar) {
        (singleGraph2?.nodes || []).forEach((n) => {
          if (singleGraph1.nodes.filter((p) => p.name === n.name).length) {
            this.props.onChange(n, !selectAllRight, 2);
          }
        });
      } else {
        (singleGraph2?.nodes || []).forEach((n) => {
          this.props.onChange(n, !selectAllRight, 2);
        });
      }
    }

    render() {
      const {
        singleGraph1, singleGraph2, title, selected, importGraph,
      } = this.props;
      const { selectAllLeft, selectAllRight } = this.state;

      if (_.isEmpty(singleGraph1?.nodes) && _.isEmpty(singleGraph2?.nodes)) {
        return null;
      }

      const isSimilar = singleGraph1 && singleGraph2;

      const body = document.querySelector('.graphCompareData > table > tbody');

      let height = '';

      if(body) {
        height = body.style.height = window.innerHeight - 150 - 180;
      }

      const selectAllSimilar = (
        <tr>
          {singleGraph1 && (
          <td>
            <Checkbox
              checked={selectAllLeft}
              onChange={this.toggleAllLeft}
              label="Check All"
              id={singleGraph2 ? 'allLeftNodes' : 'similar_allLeftNodes'}
            />
          </td>
          )}
          {singleGraph2 && (
          <td>
            <Checkbox
              checked={selectAllRight}
              onChange={this.toggleAllRight}
              label="Check All"
              id={singleGraph1 ? 'allRightNodes' : 'similar_allRightNodes'}
            />
          </td>
          ) }
        </tr>
      );

      const singleGraph1List = singleGraph1?.nodes?.map((node) => {
        const node2 = singleGraph2?.nodes?.find((n) => n.name === node.name);
        return (
          <>
            <tr>
              <td>
                <LabelCompareItem
                  node={node}
                  checked={selected.some((d) => d?.id === node?.id)}
                  onChange={(checked) => this.handleChange(node, checked, 1)}
                  nodes={singleGraph1.nodes}
                />
              </td>
              {node2?.id && (
              <td>
                <LabelCompareItem
                  node={node2}
                  checked={selected.some((d) => d?.id === node2?.id)}
                  onChange={(checked) => this.handleChange(node2, checked, 2)}
                  nodes={singleGraph2.nodes}
                />
              </td>
              )}
            </tr>
          </>
        );
      });

      const singleGraph2List = singleGraph2?.nodes?.map((node) => (
        <>
          <tr>
            <td>
              <LabelCompareItem
                node={node}
                checked={selected.some((d) => d?.id === node?.id)}
                onChange={(checked) => this.handleChange(node, checked, 2)}
                nodes={singleGraph2.nodes}
              />
            </td>
          </tr>
        </>
      ));

      return (
        <div className={`${importGraph ? 'importCompare' : ''} compareList`}>

          <details className="listExpand" open={importGraph}>
            <summary
              onClick={() => {
                Array.from(document.getElementsByClassName('listExpand')).forEach((el) => {
                  el.removeAttribute('open');
                });
              }}
              className="title"
            >
              {title}
            </summary>
            <div className="graphCompareData">
              <table>
                <thead>
                  <tr>
                    <th>
                      {isSimilar && (
                      <span className="caption-left">
                        {singleGraph1?.title}
                      </span>
                      )}
                      {!importGraph
                      && (
                      <span className="similar-nodes">
                        {title}
                      </span>
                      )}
                    </th>
                    {isSimilar && (
                    <th>
                      <span className="caption-right">
                        {singleGraph2?.title}
                      </span>
                    </th>
                    )}
                  </tr>
                </thead>
                <tbody height={`${height}px`} className={`${!isSimilar ? 'tableContent' : ''}`}>
                  {selectAllSimilar}
                  {singleGraph1List}
                  {isSimilar ? '' : singleGraph2List}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      );
    }
}

export default GraphCompareList;
