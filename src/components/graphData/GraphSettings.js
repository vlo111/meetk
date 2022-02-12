import React, {
  useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import EditGraphModal from '../chart/EditGraphModal';
import { ReactComponent as PlusSvg } from '../../assets/images/icons/plusGraph.svg';
import Button from '../form/Button';
import ShareModal from '../ShareModal';
import SaveAsTampletModal from '../chart/SaveasTampletModal';
import Api from '../../Api';
import ChartUtils from '../../helpers/ChartUtils';
import { setActiveButton, setLoading } from '../../store/actions/app';
import Chart from '../../Chart';
import Icon from '../form/Icon';

const GraphSettings = ({ singleGraph }) => {
  const [openEditGraphModal, setOpenEditGraphModal] = useState(false);
  const [openSaveAsTempletModal, setOpenSaveAsTempletModal] = useState(false);
  const ref = useRef();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isTemplate = singleGraph.status === 'template';
  const graphId = singleGraph.id;
  const [openShareModal, setOpenShareModal] = useState(false);

  const [search] = useState('');
  const [graphList, setGraphList] = useState([]);
  const [requestData, setRequestData] = useState({
    title: singleGraph.title,
    description: singleGraph.description,
    status: 'active',
    publicState: false,
    userImage: false,
  });
  const history = useHistory();

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (isMenuOpen && ref.current && !ref.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('click', checkIfClickedOutside);
    return () => {
      document.removeEventListener('click', checkIfClickedOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setRequestData({
      title: singleGraph.title,
      description: singleGraph.description,
      status: 'active',
      publicState: false,
      userImage: false,
    });
  }, [singleGraph]);

  useEffect(async () => {
    if (isMenuOpen) {
      setGraphList([]);
      try {
        const result = await Api.getGraphsList(1, {
          onlyTitle: true,
          s: search,
          limit: search === '' ? 3 : undefined,
          graphName: 'true',
          graphId,
        });
        setGraphList(result?.data?.graphs || []);
      } catch (e) {
        console.log(e);
      }
      Chart.undoManager.reset();
    }
    ChartUtils.autoScale();
  }, [graphId, isMenuOpen]);

  const startGraph = () => {
    window.location.href = '/graphs/create';
  };
  const saveGraph = async (status, forceCreate) => {
    const labels = Chart.getLabels();
    const svg = ChartUtils.getChartSvg();
    let resGraphId;
    if (forceCreate || !graphId) {
      const result = await Api.createGraph({
        ...requestData,
        status,
        svg,
        graphId,
      });
      resGraphId = result.data.graphId;
    } else {
      const result = await Api.updateGraph({
        ...requestData,
        labels,
        status,
        svg,
      });
      resGraphId = result.data.graphId;
    }
    if (resGraphId) {
      toast.info('Successfully saved');
      history.push('/');
    } else {
      toast.error('Something went wrong. Please try again');
    }

    setLoading(false);
    setIsMenuOpen();
    setActiveButton('create');
  };

  const handleChange = async (path, value) => {
    setRequestData((prevState) => ({
      ...prevState,
      [path]: value,
    }));
  };
  const handleOnClick = () => setIsMenuOpen(true);

  return (
    <div className="GraphNames">
      <button
        className="dropdown-btn"
        type="button"
        onClick={handleOnClick}
      >
        <div className="graphNname">
          <span title={singleGraph.title} className="graphNames">
            {/* {singleGraph.title?.length > 11 ? `${singleGraph.title.substring(0, 11)}...` : singleGraph.title} */}
            <span>Document</span>
          </span>
          <span className="carret2">
            <Icon value="fa-chevron-down" className="down" />

          </span>
        </div>
      </button>
      {isMenuOpen && (
        <div ref={ref} className="dropdown">
          <Button
            className="graphSetingsName"
            onClick={startGraph}
            icon={<PlusSvg />}
          >
            New
          </Button>
          <Button
            className="graphSetingsName"
            onClick={() => setOpenEditGraphModal(true)}
          >
            {' '}
            Edit
          </Button>

          <Button
            className="graphSetingsName"
            onClick={() => setOpenShareModal(true)}
          >
            Share
          </Button>

          {isTemplate ? (

            <Button
              className="btn-classic"
              onClick={() => saveGraph('active', true)}
            >
              Save as Graph
            </Button>
          ) : (
            <Button
              className="graphSetingsName"
              onClick={() => setOpenSaveAsTempletModal(true)}
            >
              Save as Template
            </Button>
          )}

        </div>
      )}
      {openShareModal && (
      <ShareModal
        closeModal={() => {
          setOpenShareModal(false);
        }}
        graph={graph}
        setButton
        graph={singleGraph}
      />
      )}
      {openEditGraphModal && (
        <EditGraphModal
          toggleModal={(value) => setOpenEditGraphModal(value)}
          graph={singleGraph}
        />
      )}
      {openSaveAsTempletModal && (
        <SaveAsTampletModal
          toggleModal={(value) => setOpenSaveAsTempletModal(value)}
          saveGraph={saveGraph}
          handleChange={handleChange}
          requestData={requestData}
        />
      )}
    </div>
  );
};

GraphSettings.propTypes = {
  singleGraph: PropTypes.object.isRequired,
};

export default React.memo(GraphSettings);
