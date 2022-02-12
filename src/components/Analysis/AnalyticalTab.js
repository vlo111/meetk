import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Outside from '../Outside';
import { getNodeCustomFieldsRequest } from '../../store/actions/graphs';
import NodeIcon from '../NodeIcon';
import Button from '../form/Button';

import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Utils from '../../helpers/Utils';

class AnalyticalTab extends Component {
    static propTypes = {
      history: PropTypes.object.isRequired,
    }

    goToBackHandle = () => {
      const path = window.location.pathname;

      const graphId = path.substring(path.lastIndexOf('view/') + 5);

      this.props.history.replace(`/graphs/update/${graphId}`);
    }

    render() {
      const { nodes } = this.props;

      let counter = 0;

      return (
        <Outside exclude=".ghModalOverlay,.contextmenuOverlay,.jodit">
          <div id="Tab" className="analyticalResult">
            <h3 className="shortest-tab-title">Shortest path</h3>
            <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.goToBackHandle} />

            <div className="container-shortest-tab">
              {nodes.map((p) => (
                <div className="left">
                  <div className="shortest-node-title" title={p.name}>
                    {Utils.substr(p.name, 13)}
                  </div>
                  <NodeIcon node={p} />
                  {((counter + 1 < nodes.length) && ((counter += 1) % 3 !== 0)) && <hr className="shortest-link" />}
                  {/* {(counter+1 < nodes.length) */}
                  {/* && (<hr className={`${((counter += 1) % 3 !== 0) ? 'shortest-link' : 'shortest-thirdLink'}`} />)} */}
                </div>
              ))}
            </div>
          </div>
        </Outside>
      );
    }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
});

const mapDispatchToProps = {
  getNodeCustomFieldsRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AnalyticalTab);

export default withRouter(Container);
