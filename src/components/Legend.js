import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ChartUtils from '../helpers/ChartUtils';
import { ReactComponent as LegendSvg } from '../assets/images/icons/legend.svg';
import Button from './form/Button';
import { getSingleGraphRequest } from '../store/actions/graphs';
import { ReactComponent as CloseSvg } from '../assets/images/icons/close.svg';

class Legend extends Component {
    static propTypes = {
      getSingleGraphRequest: PropTypes.func.isRequired,
      singleGraph: PropTypes.object.isRequired,
    }

    constructor(props) {
      super(props);

      this.state = {
        show: false,
      };
    }

    handleClick = () => {
      const { show } = this.state;

      const { singleGraph: { id } } = this.props;

      if (show) {
        const play = document.getElementById('autoPlay');
        const panel = document.getElementById('graphControlPanel');
        play.style.right = '29px';
        panel.style.right = '29px';
      } else {
        this.props.getSingleGraphRequest(id, { viewMode: true, rendering: false });
        const play = document.getElementById('autoPlay');
        const panel = document.getElementById('graphControlPanel');
        play.style.right = '29px';
        panel.style.right = '29px';
      }

      this.setState({
        show: !show,
      })
    }

    orderData = (data) => data.sort((a, b) => {
      if (a.type.toUpperCase() < b.type.toUpperCase()) return -1;
      if (a.type.toUpperCase() > b.type.toUpperCase()) return 1;
      return 0;
    })

    render() {
      const { show } = this.state;
      const { singleGraph: { nodesPartial, linksPartial } } = this.props;

      const nodes = this.orderData([...new Map(nodesPartial?.map((node) => [node.type, node])).values()]);

      const links = this.orderData([...new Map(linksPartial?.map((link) => [link.type, link])).values()]);

      const typeData = nodesPartial?.map((p) => ({
        name: p.name,
        type: p.type,
      }));
      const typeLinkData = linksPartial?.map((p) => ({
        name: p.name,
        type: p.type,
      }));
      const groupLinkTypes = _.groupBy(typeLinkData, 'type');

      const groupTypes = _.groupBy(typeData, 'type');
      const types = [];
      Object.keys(groupTypes).forEach((l) => {
        const currentType = groupTypes[l];
        types.push({ type: currentType[0].type, count: currentType.length });
      });

      const listNodeItems = nodes.map((node) => (
        <li className="node-item" key={node.id} style={{ backgroundColor: ChartUtils.nodeColor(node) }}>
          <p title={node.type}>{`${node.type}`}</p>
          <p className="nodeCount">{`(${groupTypes[Object.keys(groupTypes).filter((p) => p === node.type)].length})`}</p>
        </li>

      ));
      const listLinkItems = links.map((link) => (
        <li className="connection-item" key={link.id} style={{ backgroundColor: ChartUtils.linkColor(link) }}>
          <p title={link.type}>{`${link.type}`}</p>
          <p className="nodeCount">{`(${groupLinkTypes[Object.keys(groupLinkTypes).filter((p) => p === link.type)].length})`}</p>
        </li>
      ));
      return (
        <div className={`legends ${show && 'open'}`} id="legends">

          <Button className="dropdown-btn legendButton" onClick={() => this.handleClick()}>
            <LegendSvg className="legendSvg" />
          </Button>

          <div className="dropdown">
            <Button
              color="transparent"
              className="close legendClose"
              icon={<CloseSvg />}
              onClick={() => this.handleClick()}
            />
            <h4>
              Nodes (
              {nodesPartial?.length}
              )
            </h4>
            <div className="nodes">

              <ul className="node-list">
                {listNodeItems}
              </ul>
            </div>
            <div className="borderLegends" />
            <h4>
              Connections (
              {links?.length}
              )
            </h4>
            <div className="connections">
              <ul className="connection-list">
                {listLinkItems}
              </ul>
            </div>
          </div>
        </div>
      );
    }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
});

const mapDispatchToProps = {
  getSingleGraphRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Legend);

export default Container;
