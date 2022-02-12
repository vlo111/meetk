import React, {
  useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import Switch from 'rc-switch';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import queryString from 'query-string';
import Button from '../form/Button';
import Input from '../form/Input';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import ImageUploader from '../ImageUploader';
import ChartUtils from '../../helpers/ChartUtils';
import Api from '../../Api';
import {
  getSingleGraphRequest,
  updateGraphThumbnailRequest,
  updateGraphRequest,
  deleteGraphRequest,
  getGraphsListRequest,
} from '../../store/actions/graphs';
import {
  setLoading,
} from '../../store/actions/app';
import Chart from '../../Chart';

const EditGraphModal = ({
  toggleModal, graph, updateGraph, outOver,
}) => {
  const { defaultImage } = graph.defaultImage;
  const dispatch = useDispatch();
  const history = useHistory();
  const [requestData, setRequestData] = useState({
    title: graph.title,
    description: graph.description,
    status: graph.status,
    publicState: graph.publicState || false,
    userImage: graph.defaultImage || false,
  });
  const [image, setImage] = useState('');
  const order = JSON.parse(localStorage.getItem('/')) || 'newest';

  useEffect(async () => {
    const graphId = graph.id;
    const { publicState } = graph.publicState;
    const svg = ChartUtils.getChartSvg();
    if (!defaultImage && graphId && !publicState) {
      if (!(graph?.nodesPartial?.length > 500)) {
        await updateGraphThumbnailRequest(graphId, svg, 'small');
        await getSingleGraphRequest(graphId);
      }
    }
  }, [graph]);

  async function deleteGraph(graphId) {
    const { page = 1, s: searchParam } = queryString.parse(window.location.search);

    //  select data from localStorage
    try {
      if (graphId) {
        await dispatch(deleteGraphRequest(graph.id));

        await dispatch(getGraphsListRequest(page, { s: searchParam }));
      } else if (window.confirm('Are you sure?')) {
        await dispatch(deleteGraphRequest(graph.id));
        toast.info('Successfully deleted');

        await dispatch(getGraphsListRequest(page, { s: searchParam, filter: order }));
        history.push('/');
      }
    } catch (e) {
      console.log(e);
    }
  }
  const handleChange = async (path, value, byUser) => {
    if (path === 'image') {
      if (value === '') {
        const svg = graph?.nodesPartial?.length < 500 ? ChartUtils.getChartSvg() : '';
        setRequestData((prevState) => ({
          ...prevState,
          userImage: false,
        }));
        const savedImageRequest = await Api.updateGraphThumbnail(graph.id, svg, 'small', byUser);
        const images = `${savedImageRequest?.data?.thumbUrl}?t=${moment(graph.updatedAt).unix()}`;
        setImage(images);
      } else {
        setImage(value);
        setRequestData((prevState) => ({
          ...prevState,
          [path]: value,
          userImage: true,
        }));
      }
    } else {
      setRequestData((prevState) => ({
        ...prevState,
        [path]: value,
      }));
    }
  };
  const saveGraph = async (status) => {
    setLoading(true);
    const svg = ChartUtils.getChartSvg();
    const labels = Chart.getLabels();
    const { id: graphId } = graph;
    let dataIamge = image;
    if (image) {
      let userEdited = true;
      if (typeof (image) === 'string' && graph?.nodesPartial?.length < 500) {
        dataIamge = svg;
        setImage(svg);
        userEdited = false;
      } else if (typeof (image) !== 'object') {
        userEdited = false;
        dataIamge = '';
        setImage('');
      }
      await dispatch(updateGraphThumbnailRequest(graphId, dataIamge, 'medium', userEdited));
    }

    const { payload: { data } } = await dispatch(updateGraphRequest(graphId, {
      ...requestData,
      labels,
      status,
      image,
    }));
    const resGraphId = data.graphId;
    if (graph) {
      toast.info('Successfully saved');
      const { payload: { data: { graph: newGraph } } } = (await dispatch(getSingleGraphRequest(resGraphId)));
      if (history.location.pathname === '/public') {
        await dispatch(getGraphsListRequest(1, { filter: order, publicGraph: 1 }));
      } else {
        await dispatch(getGraphsListRequest(1, { filter: order, status: graph.status }));
      }

      (updateGraph && updateGraph(newGraph));
    } else if (!resGraphId) {
      toast.error('Something went wrong. Please try again');
    }
    setLoading(false);
    toggleModal(false);
  };
  return (
    <Modal
      className="ghModal ghModalEdit"
      overlayClassName="ghModalOverlay"
      isOpen
      onRequestClose={() => {
        if (outOver) {
          outOver();
        }
        toggleModal(false);
      }}
    >
      <Button
        color="transparent"
        className="close"
        icon={<CloseSvg />}
        onClick={() => {
          if (outOver) {
            outOver();
          }
          toggleModal(false);
        }}
      />
      <div className="form">
        <div className="uploaderImageEdit">
          <ImageUploader
            className="thumbnailSave"
            value={image || `${graph.thumbnail}?t=${moment(graph.updatedAt).unix()}`}
            onChange={(val) => handleChange('image', val)}
            userImage={requestData.userImage}
          />
        </div>
        <div className="graphInputName">
          <Input
            value={requestData.title}
            onChangeText={(v) => handleChange('title', v)}
          />
        </div>
        <div className="impData">
          <label className="switchLabel">
            <span className="switchPublic">Publish graph</span>
            <div>
              <Switch
                checked={requestData.publicState}
                onChange={(v) => handleChange('publicState', v)}
              />
            </div>
          </label>
          <div className="infoGraph">
            <label>Owner</label>
            <span className="item1">{`${graph.user.firstName} ${graph.user.lastName}`}</span>
          </div>
          <div className="infoGraph">
            <label>Created</label>
            <span className="item2">{moment(graph.createdAt).format('YYYY.MM.DD')}</span>
          </div>
          <div className="infoGraph">
            <label>Last Modfied</label>
            <span className="item3">{moment(graph.updatedAt).format('YYYY.MM.DD hh:mm')}</span>
          </div>
        </div>
        <div className="textareaEdit">
          <Input
            placeholder="Description"
            className="textarea"
            value={requestData.description}
            textArea
            onChangeText={(v) => handleChange('description', v)}
          />
        </div>
        <div className="buttonsSave">
          <>
            <Button
              onClick={() => deleteGraph(false)}
              className="btn-delete"
            >
              Delete
            </Button>
            <Button
              className="btn-classic"
              onClick={() => saveGraph(requestData.status)}
            >
              {' '}
              Save
              {' '}
            </Button>
          </>
        </div>
      </div>
    </Modal>
  );
};

EditGraphModal.propTypes = {
  graph: PropTypes.any.isRequired,
  toggleModal: PropTypes.func.isRequired,
  outOver: PropTypes.func.isRequired,
  updateGraph: PropTypes.func.isRequired,
};

export default React.memo(EditGraphModal);
