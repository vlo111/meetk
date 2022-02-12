import React, {
  useEffect, useRef, useState, useCallback,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import isEmpty from 'lodash/isEmpty';
import _, { reduceRight } from 'lodash';
import HorizontalTimelineContent from 'react-horizontal-timeline';
import Button from '../form/Button';
import Chart from '../../Chart';
import {
  getGraphHistoryRequest,
  resetGraphHistory,
  getHistoryDataRequst,
} from '../../store/actions/graphsHistory';
import {
  getSingleGraphHistory,
  getSingleGraphHistoryData,
} from '../../store/selectors/graphsHistory';
import { getSingleGraph } from '../../store/selectors/graphs';
import {
  createGraphRequest,
  revertGraphRequest,
} from '../../store/actions/graphs';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { ReactComponent as TriangleSvg } from '../../assets/images/icons/triangle.svg';
// import Swiper from "react-id-swiper";
// import "swiper/swiper.scss";
// import "swiper/components/navigation/navigation.scss";
// import "swiper/components/pagination/pagination.scss";
// import { Chrono } from "react-chrono";
// import { tree } from 'd3-hierarchy';

const GraphHistory = React.memo(({ graphId }) => {
  const dispatch = new useDispatch();
  const [speed, setSpeed] = useState(5000);
  const [openRevertModal, setOpenRevertModal] = useState(false);
  const [item, setItem] = useState({
    value: 0,
    previous: 0,
  });
  const [title, setTitle] = useState([]);
  // const [swiper, setSwiper] = useState(null);
  // Slides current index
  const [currentIndex, updateCurrentIndex] = useState(0);

  const history = useHistory();
  // Swiper instance
  const swiperRef = useRef(null);

  const graphHistory = useSelector(getSingleGraphHistory);
  const graphHistoryData = useSelector(getSingleGraphHistoryData);
  // useEffect
  useEffect(() => {
    dispatch(getGraphHistoryRequest(graphId));
  }, []);

  useEffect(() => {
    setItem({ ...item, value: graphHistory.length - 1 });
  }, [graphHistory.length]);

  useEffect(() => {
    Chart.loading(true);
    // Chart.setAutoSave(false);

    Chart.render(
      {
        nodes: graphHistoryData.nodes,
        labels: graphHistoryData.labels,
        links: graphHistoryData.links,
      },
      { ignoreAutoSave: false },
    );
    Chart.loading(false);
  }, [graphHistoryData]);
  // end useEffect

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

  const getHistoryData = (items) => {
    console.log(items.eventId, items.id, 'itemsitemsitems');
    if (!items.id) return;
    dispatch(getHistoryDataRequst(graphId, items.eventId, items.id));
  };
  const checkUnqiueDate = (date) => {
    const d = moment.unix(date).format('YYYY-MM-DD');
    if (!title.includes(d)) {
      //  setTitle(a => [...a, moment.unix(date).format("YYYY-MM-DD")]);
      // setTitle([...title,  d])
      return 1;
    }
    return 0;
  };
  // const getHistoryData = async (items) => {
  //   if (!items.id) return;
  //   Chart.loading(true);
  //   Chart.setAutoSave(false);
  //   const {
  //     payload: { data },
  //   } = await dispatch(getHistoryDataRequst(graphId, items.id));
  //   if (graphHistoryData) { console.log('sssssssssssssssssssss', data.data);
  //     Chart.render(
  //       {
  //         nodes: graphHistoryData.nodes,
  //         labels: graphHistoryData.labels,
  //         links: graphHistoryData.links,
  //       },
  //       { ignoreAutoSave: false }
  //     );
  //   }
  //   Chart.loading(false);
  // };
  // Revert modal
  const revert = () => {
    if (graphHistory.length - 1 === item.value) {
      toast.info('Please select an older revision');
      return;
    }
    setOpenRevertModal(!openRevertModal);
  };

  return isEmpty(graphId) ? null : (
    <Modal
      className="ghModal"
      overlayClassName="graphHistory graphUsersInfoOverlay"
      isOpen
      onAfterOpen={afterOpenModal}
      onRequestClose={onClose}
      contentLabel="History"
    >
      <div className="graph-history">
        <div className="event">
          <img
            className="avatar"
            alt="event"
            src={graphHistory[item.value]?.avatar}
            alt={graphHistory[item.value]?.users}
          />
          <div className="infoWrapper">
            <span className="author">{graphHistory[item.value]?.users}</span>
            <div className="info">
              <span>
                {moment
                  .unix(graphHistory[item.value]?.id)
                  .format('MMM D, YYYY, HH:mmA')}
              </span>
            </div>
            <span>{graphHistory[item.value]?.title}</span>
          </div>
        </div>
        <div className="revisions">
          {graphHistory.length > 0 ? (
            <HorizontalTimelineContent
              labelWidth={10}
              maxEventPadding={20}
              minEventPadding={20}
              index={item.value}
              fillingMotion={{ stiffness: 150, damping: 25 }}
              slidingMotion={{ stiffness: 150, damping: 25 }}
              getLabel={function (date, index) {
                // console.log('checkUnqiueDate(date) ', checkUnqiueDate(date),  moment.unix(date).format("YYYY-MM-DD"));
                const a = moment.unix(date).format('YYYY-MM-DD'); console.log(a, 'aaa');
                //  return checkUnqiueDate(date)

                //  if(!title.includes(a)){

                //   // setTitle(title => [...title, moment.unix(date).format("YYYY-MM-DD")]);
                //    setTitle([...title,   moment.unix(date).format("YYYY-MM-DD")])
                //   return 'aaaaaaaaa';
                // }else{

                //   return '';
                // }
                // return checkUnqiueDate(date) ?  checkUnqiueDate(date) : null
              }}
              styles={{
                background: 'white',
                outline: '#c0c0c0',
                foreground: '#2E57A1',
              }}
              indexClick={(index) => {
                setItem({ ...item, value: index, previous: item.value });
                const currentEvent = graphHistory[index];
                getHistoryData(currentEvent);
              }}
              values={graphHistory.map((x) => x.id)}
            />
          ) : (
            ' No history data'
          )}
        </div>
        <div className="controls">
          <Button
            color="transparent"
            className="close"
            icon={<CloseSvg />}
            onClick={onClose}
          />
          <div className="l-table">
            {/* <div className="speed">
                <label for="speed" className="label">Speed</label>
                <span className="min" className="min" >-</span>
                <input type="range" min={-10} max={-1} step="1"  onChange={(v) => handleChange('value', v)} value ={speed/ -1000} />
                <span className="max" className="max" >+</span>
              </div> */}
            {graphHistory && (
              <Button className="accent alt" onClick={revert}>
                Revert
              </Button>
            )}
          </div>
        </div>
      </div>
      {openRevertModal && (
        <Revert
          closeModal={() => setOpenRevertModal(false)}
          graphId={graphId}
        />
      )}
    </Modal>
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
  const save = async () => {
    if (selectOptions === 'newGraph') {
      const nodes = Chart.getNodes();
      const links = Chart.getLinks();
      const labels = Chart.getLabels();

      const {
        payload: { data },
      } = await dispatch(
        createGraphRequest({
          nodes,
          links,
          labels,
        }),
      );
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

      const {
        payload: { data },
      } = await dispatch(
        revertGraphRequest(graphId, {
          status,
          nodes,
          links,
          labels,
        }),
      );
      // Chart.setAutoSave(true);
      if (data.graphId) {
        window.location.href = `/graphs/update/${data.graphId}`;
      } else {
        toast.error('Something went wrong');
      }
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
          <Button
            color="transparent"
            className="close"
            icon={<CloseSvg />}
            onClick={onClose}
          />
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
            <Button className="cancel transparent alt" onClick={onClose}>
              {' '}
              Cancel
              {' '}
            </Button>
            <Button className="accent alt" onClick={save}>
              {' '}
              Save
              {' '}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
