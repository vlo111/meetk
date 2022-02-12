import React, {
  useEffect, useRef, useState, useCallback,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import isEmpty from 'lodash/isEmpty';
import Swiper from 'react-id-swiper';
import _ from 'lodash';
import Button from '../form/Button';
import Chart from '../../Chart';
import { getGraphHistoryRequest, resetGraphHistory, getHistoryDataRequst } from '../../store/actions/graphsHistory';
import { getSingleGraphHistory, getSingleGraphHistoryData } from '../../store/selectors/graphsHistory';
import { getSingleGraph } from '../../store/selectors/graphs';
import { createGraphRequest, updateGraphRequest } from '../../store/actions/graphs';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { ReactComponent as TriangleSvg } from '../../assets/images/icons/triangle.svg';
// import "swiper/swiper.scss";
import 'swiper/components/navigation/navigation.scss';
import 'swiper/components/pagination/pagination.scss';

const GraphHistory = React.memo(({ graphId }) => {
  const dispatch = new useDispatch();
  const [speed, setSpeed] = useState(5000);
  const [openRevertModal, setOpenRevertModal] = useState(false);
  const [eventData, setEventData] = useState({ user: '', eventText: '', eventDate: '' });

  // const [swiper, setSwiper] = useState(null);
  // Slides current index
  const [currentIndex, updateCurrentIndex] = useState(0);

  const history = useHistory();
  // Swiper instance
  const swiperRef = useRef(null);

  const graphHistory = useSelector(getSingleGraphHistory);
  const graphHistoryData = useSelector(getSingleGraphHistoryData);

  useEffect(() => {
    dispatch(getGraphHistoryRequest(graphId));
  }, []);

  const afterOpenModal = () => {};
  const onClose = () => {
    // dispatch(resetGraphHistory());
    history.push(`/graphs/view/${graphId}`);
  };
  const handleChange = (path, value) => {
    const val = value.target.value;
    setSpeed(-+val * 1000);
  };

  //     const  grouped = _.mapValues(_.groupBy(graphHistory, 'title'),
  //     clist => clist.map(hitsory => _.omit(hitsory, 'title')));

  // console.log(grouped, 'grouped', Object.entries(grouped));

  // const groupBy = keys => array =>
  //   array.reduce((objectsByKeyValue, obj) => {
  //     const value = keys.map(key => obj[key]).join('-');
  //     objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
  //     return objectsByKeyValue;
  //   }, {});

  //   const groupByBrand = groupBy(['eventDate']);

  //   console.log(
  //     JSON.stringify({
  //       carsByBrand: groupByBrand(graphHistory),
  //     }, null, 2, 'dddddddddddddddddd')
  //   );

  // Params definition
  const updateIndex = useCallback(
    () => updateCurrentIndex(swiperRef.current.swiper.realIndex),
    [],
  );
  const params = {
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    loop: true,
    // autoplay: true
  };

  // Add eventlisteners for swiper after initializing
  // useEffect(() => {
  //   const swiperInstance = swiperRef.current.swiper;

  //   if (swiperInstance) {
  //     swiperInstance.on("slideChange", updateIndex);
  //   }

  //   return () => {
  //     if (swiperInstance) {
  //       swiperInstance.off("slideChange", updateIndex);
  //     }
  //   };
  // }, [updateIndex]);

  // Manipulate swiper from outside
  const goNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const goPrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };
  const getHistoryData = async (items) => {
    setEventData(items);
    console.log(items, 'sssssssssssssssssss');
    if ((!items.id)) return;
    Chart.loading(true);
    Chart.setAutoSave(false);

    console.log(eventData, 'eventDataeventDataeventDataeventData');
    const { payload: { data } } = await dispatch(getHistoryDataRequst(graphId, items.id));
    if (graphHistoryData) Chart.render({ nodes: graphHistoryData.nodes, labels: graphHistoryData.labels, links: graphHistoryData.links }, { ignoreAutoSave: false });
    Chart.loading(false);
  };
  const revert = () => {
    setOpenRevertModal(!openRevertModal);
  };
  return (isEmpty(graphId) ? null
    : (
      <Modal
        className="ghModal"
        overlayClassName="graphHistory graphUsersInfoOverlay"
        isOpen
        onAfterOpen={afterOpenModal}
        onRequestClose={onClose}
        contentLabel="History"
      >
        <div className="graph-history">
          <div id="rvinfo">
            <span className="rvchange">
              <span className="user b">
                <img className="avatar-user d-block" src={eventData?.user.avatar} alt={eventData?.user.firstName} />
                <span className="userName">
                  {`${eventData?.user.firstName} ${eventData?.user.lastName}`}
                </span>

              </span>
              <span className="date">
                {' '}
                {eventData?.eventFullDate}
              </span>
              <span className="info">
                {' '}
                {eventData?.eventText}
              </span>
            </span>

          </div>
          <div id="revisions">

            <table id="rvbar">
              <tbody>
                <tr>
                  <td className="l" kr="" />
                  <td className="r" kr="" />
                </tr>
              </tbody>
            </table>

            <div id="rvtrack">
              <ul id="rvlist">
                {/* <Swiper {...params} ref={swiperRef}> */}
                {Object.keys(graphHistory).map((division, key) => (
                  <li title={`${division}`} key={key}>
                    {
                        graphHistory[division].map((item, key) => (<b className="circle swiper-slide" key={key} onClick={() => getHistoryData(item)} />))
                    }
                    <span className="title">
                      {' '}
                      {division}
                    </span>
                  </li>
                ))}
                {/* </Swiper> */}
              </ul>

            </div>
            <div id="rvindicator">
              <div className="svg-icon h-24 w-24">
                <TriangleSvg />
              </div>
            </div>

          </div>

          <div className="controls">
            <Button color="transparent" className="close" icon={<CloseSvg />} onClick={onClose} />
            <div className="l-table">
              <div className="speed">
                <label htmlFor="speed" className="label">Speed</label>
                <span className="min" className="min">-</span>
                <input type="range" min={-10} max={-1} step="1" onChange={(v) => handleChange('value', v)} value={speed / -1000} />
                <span className="max" className="max">+</span>
              </div>
              {/* <div className="controls">
              <button onClick={goPrev}>Prev</button>
              <button onClick={goNext}>Next</button>
            </div> */}
              {graphHistory && <Button className="accent alt" onClick={revert}> Revert </Button> }
            </div>

          </div>
        </div>
        {openRevertModal && <Revert closeModal={() => setOpenRevertModal(false)} graphId={graphId} /> }
      </Modal>
    )
  );
});

GraphHistory.propTypes = {
  graphId: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default GraphHistory;

const Revert = ({ closeModal, graphId }) => {
  const dispatch = useDispatch();
  const singleGraph = useSelector(getSingleGraph);
  const defaultValue = 'newGraph';
  const [selectOptions, setSelectOptions] = useState(defaultValue);
  const afterOpenModal = () => {};
  Chart.loading(true);
  const save = async () => {
    if (selectOptions === 'newGraph') {
      const nodes = Chart.getNodes();
      const links = Chart.getLinks();
      const labels = Chart.getLabels();

      const { payload: { data } } = await dispatch(createGraphRequest({
        nodes,
        links,
        labels,
      }));
      Chart.loading(false);
      if (data.graphId) {
        window.location.href = `/graphs/update/${data.graphId}?new=1`;
      } else {
        toast.error('Something went wrong');
      }
    }
    if (selectOptions === 'revert') {
      const status = 'active';
      const nodes = Chart.getNodes();
      const links = Chart.getLinks();
      const labels = Chart.getLabels();

      // const { payload: { data } } = await dispatch(updateGraphRequest(graphId, {
      //   status,
      //   nodes,
      //   links,
      //   labels,
      // }));
      // Chart.setAutoSave(true);
      // console.log(data, 'datadatadata');
      //  if (data.graphId) {
      //   window.location.href = `/graphs/update/${data.graphId}`;
      // } else {
      //   toast.error('Something went wrong');
      // }
      Chart.loading(false);
    }
  };
  // close modeal
  const onClose = () => {
    closeModal();
  };

  // Change value
  const onValueChange = (e) => {
    setSelectOptions(e.target.value);
  };
  return (
    <Modal
      className="ghModal ghModalSave"
      overlayClassName="ghModalOverlay"
      isOpen
    >
      <div className="revert">
        <h2>Revert options</h2>
        <div className="container">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={onClose} />
          <label className="container-label">
            Save as new Graph
            <input
              type="radio"
              value="newGraph"
              checked={selectOptions === 'newGraph'}
              onChange={(e) => onValueChange(e)}
            />
            <span className="info">
              Create a duplicate map from this version (non-destructive)
            </span>
            <span className="checkmark" />
          </label>
          <label className="container-label">
            Revert to this version
            <input
              type="radio"
              value="revert"
              checked={selectOptions === 'revert'}
              onChange={(e) => onValueChange(e)}
            />
            <span className="info">
              Undo all changes made after this version (destructive)
            </span>
            <span className="checkmark" />
          </label>
          <div className="buttons">
            <Button className="cancel transparent alt" onClick={onClose}> Cancel </Button>
            <Button className="accent alt" onClick={save}> Save </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
