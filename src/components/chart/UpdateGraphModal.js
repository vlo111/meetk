import React, {
  useState,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import queryString from 'query-string';
import Modal from 'react-modal';
import Button from '../form/Button';
import Input from '../form/Input';
import { updateGraphDataRequest, getGraphsListRequest }
  from '../../store/actions/graphs';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';

const UpdateGraphModal = ({ graph, closeModal }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [graphData, setGraphData] = useState(graph);
  const { page = 1, s: searchParam } = queryString.parse(window.location.search);

  const updateGraph = async (event) => {
    event.preventDefault();
    try {
      const { payload: { data } } = await dispatch(updateGraphDataRequest(graphData.id,
        { title: graphData.title, description: graphData.description }));
      await dispatch(getGraphsListRequest(page, { s: searchParam }));
      closeModal();
      history.push('/');
      toast.success('Successfully saved');
    } catch (e) {
      console.log(e);
    }
  };

  function validateForm() {
    return (
      graphData.title.trim().length === 0
    );
  }
  const handleChange = (path, value) => {
    setGraphData({ ...graphData, [path]: value });
  };
  return (
    <Modal
      className="ghModal"
      overlayClassName="ghModalOverlay"
      isOpen
    >
      <Button color="transparent" className="close" icon={<CloseSvg />} onClick={() => closeModal()} />

      <h2> Update Graph </h2>
      <Input
        label="Title"
        value={graphData.title}
        onChangeText={(v) => handleChange('title', v)}
      />
      <Input
        label="Description"
        value={graphData.description}
        textArea
        onChangeText={(v) => handleChange('description', v)}
      />
      <div className="buttons">
        <Button className="cancel transparent alt" onClick={() => closeModal()}>
          Cancel
        </Button>
        <Button
          className="accent alt"
          disabled={validateForm()}
          onClick={updateGraph}
        >
          Update
        </Button>
      </div>
    </Modal>
  );
};

UpdateGraphModal.propTypes = {
  graph: PropTypes.object.isRequired,
};

export default React.memo(UpdateGraphModal);
