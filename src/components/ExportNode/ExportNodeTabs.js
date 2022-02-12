import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ExportNode from './ExportNode';
import Button from '../form/Button';
import { setLoading } from '../../store/actions/app';
import Api from '../../Api';
import { ReactComponent as ExportSvg } from '../../assets/images/icons/export.svg';
import bgImage from '../../assets/images/no-img.png';

class ExportNodeTabs extends Component {
  static propTypes = {
    setLoading: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired,
    tabs: PropTypes.object.isRequired,
    image: PropTypes.func.isRequired,
    connectedNodes: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
  }

  decode = (str) => str.replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '\\"')
    .replace(/&amp;/g, '&')
    .replace('=\\"', '="')

  export = async () => {
    this.props.setLoading(true);

    const {
      node, tabs, image, title, connectedNodes,
    } = this.props;

    const html = this.decode(renderToString(<ExportNode
      node={node}
      connectedNodes={connectedNodes}
      tabs={tabs}
      image={image || bgImage}
      title={title}
    />));

    await Api.download('node-info-pdf', { html, image });

    this.props.setLoading(false);
  }

  render() {
    return (
      <button
        onClick={this.export}
        title="Export"
        className="b-navbar"
      >
        <ExportSvg />
      </button>
    );
  }
}

const mapStateToProps = (state) => ({
  nodeCustomFields: state.graphs.nodeCustomFields,
});

const mapDispatchToProps = {
  setLoading,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ExportNodeTabs);

export default withRouter(Container);
