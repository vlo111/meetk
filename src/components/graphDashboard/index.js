import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../form/Button';
import AddQuery from '../GraphQuery/AddQuery';
import Queries from '../GraphQuery/Queries';
import { getSingleGraphRequest } from '../../store/actions/graphs';
import { currentUserRolePermission } from '../../store/selectors/graphs';
import Icon from '../form/Icon';
import Api from '../../Api';
import { ReactComponent as SaveSvg } from '../../assets/images/icons/save.svg';
import { ReactComponent as SettingSvg } from '../../assets/images/icons/setting.svg';
import { ReactComponent as ExportSvg } from '../../assets/images/icons/export.svg';
import Legend from '../Legend';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';

const Dashboard = ({ graph }) => {
  const [showGraphQuery, setshowGraphQuery] = useState(false);
  const [showGraphQuerySetting, setShowGraphQuerySetting] = useState(false);
  const dispatch = useDispatch();
  const userPermission = useSelector(currentUserRolePermission);
  const toggleGraphQuery = (togle) => {
    setshowGraphQuery(togle);
  };
  const toggleGraphQuerySetting = (togle) => {
    setShowGraphQuerySetting(togle);
  };
  const toggleGraphReset = () => {
    dispatch(getSingleGraphRequest(graph.id, { viewMode: true }));
  };

  const exportGraphData = (graphId) => {
    const nodes = Chart.getNodes();
    const links = Chart.getLinks();
    const labels = Chart.getLabels();

    const nodesId = nodes.map((n) => n.id);
    const linksId = ChartUtils.cleanLinks(links, nodes).map((l) => l.id);
    const labelsId = labels.map((l) => l.id);
    Api.download('xlsx', {
      graphId, nodesId, linksId, labelsId,
    });
  };

  return (
    <div className="dashboards">
      {userPermission && (
        <>
          <Button
            icon={<SaveSvg className="viewIconQuery " />}
            onClick={() => toggleGraphQuery(true)}
            title="Save Fragment"
            className="save_query"
          />
          <Button
            icon={<ExportSvg className="viewIcon " />}
            onClick={() => exportGraphData(graph.id)}
            title="Export"
            className="export"
          />
          <button
            onClick={() => toggleGraphQuerySetting(!showGraphQuerySetting)}
            title="Fragment List"
            className={`${showGraphQuerySetting ? 'setting_queryBtn__active' : ''} setting_queryBtn btn-classic`}
          >
            <Icon value={<SettingSvg className="viewIconQuery " />} />
          </button>
        </>
      )}
      <Button
        onClick={() => toggleGraphReset()}
        title="Reset"
        className="resetAll"
      >
        Reset
      </Button>
      <button className="legendView" title="Legend">
        <div className="LegendExplorer">
          <Legend />
        </div>
      </button>
      {showGraphQuery ? (

        <AddQuery
          closeModal={() => toggleGraphQuery(false)}
          graph={graph}
        />
      ) : null}
      {showGraphQuerySetting ? (
        <Queries
          graphId={graph.id}
          closeModal={() => setShowGraphQuerySetting(false)}
        />
      ) : null}
    </div>
  );
};

Dashboard.propTypes = {
  graph: PropTypes.object.isRequired,
};

export default Dashboard;
