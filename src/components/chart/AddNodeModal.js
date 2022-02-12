import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Modal from 'react-modal';
import _ from 'lodash';
import Tooltip from 'rc-tooltip';
import { useDispatch, useSelector } from 'react-redux';
import Select from '../form/Select';
import ColorPicker from '../form/ColorPicker';
import Input from '../form/Input';
import Button from '../form/Button';
import Chart from '../../Chart';
import FileInput from '../form/FileInput';
import { NODE_STATUS } from '../../data/node';
import Validate from '../../helpers/Validate';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import ChartUtils from '../../helpers/ChartUtils';
import Api from '../../Api';
import markerImg from '../../assets/images/icons/marker-black.svg';
import MapsLocationPicker from '../maps/MapsLocationPicker';
import { toggleNodeModal } from '../../store/actions/app';
import { updateNodesCustomFieldsRequest } from '../../store/actions/nodes';

const AddNodeModal = ({ ariaHideApp }) => {
  const dispatch = useDispatch();

  const [nodeData, setNodeData] = useState({ keywords: [] });
  const [errors, setErrors] = useState({});
  const [index, setIndex] = useState(null);
  const [openMap, setOpenMap] = useState(false);
  const [expand, setExpand] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [nodeId, setNodeId] = useState(null);
  const [getTypes, setGetTypes] = useState([]);
  const addNodeParams = useSelector((state) => state.app.addNodeParams);
  const currentUserId = useSelector((state) => state.account.myAccount.id);
  const currentUserRole = useSelector((state) => state.graphs.singleGraph.currentUserRole || '');
  const graph = useSelector((state) => state.graphs.singleGraph);

  const { editPartial } = addNodeParams || {};
  const nodes = Chart.getNodes();

  useMemo(() => {
    const {
      id, name, link, icon, type, status, nodeType, keywords,
      manually_size,
    } = addNodeParams || {};

    const _type = type || _.last(nodes)?.type || '';

    if (nodes && nodes.length) {
      const types = nodes.filter((d) => d.type)
        .map((d) => ({
          value: d.type,
          label: d.type,
        }));

      setGetTypes(_.uniqBy(types, 'value'));
    }
    setNodeData({
      ...addNodeParams,
      name: name || '',
      link: link || '',
      icon: icon || '',
      status: status || 'approved',
      nodeType: nodeType || 'square',
      type: _type,
      keywords: keywords || [],
      color: ChartUtils.nodeColorObj[_type] || '',
      manually_size: manually_size || 1,
    });

    setIndex(addNodeParams.index ?? null);
    setNodeId(id);
  }, [addNodeParams]);

  const closeModal = () => {
    closeExpand();
    setNodeData({});
    dispatch(toggleNodeModal());
  };

  const closeExpand = () => {
    setImgUrl('');
    setExpand(false);
    setErrors({});
  };

  const saveNode = async (ev) => {
    ev.preventDefault();

    const graphId = graph.id;
    const graphNodes = graph.nodesPartial;

    let chartNodes = nodes;

    const update = !_.isNull(index);
    [errors.name, nodeData.name] = Validate.nodeName(nodeData.name, update, graphNodes);
    [errors.type, nodeData.type] = Validate.nodeType(nodeData.type);
    // [errors.location, nodeData.location] = Validate.nodeLocation(nodeData.location);
    [errors.color, nodeData.color] = Validate.nodeColor(nodeData.color, nodeData.type);

    if (!nodeData.color) {
      nodeData.color = ChartUtils.nodeColor(nodeData);
    }

    if (nodeData.link) {
      [errors.link, nodeData.link] = Validate.nodeLink(nodeData.link);
    }

    nodeData.updatedAt = moment().unix();
    nodeData.updatedUser = currentUserId;

    if (!Validate.hasError(errors)) {
      nodeData.id = nodeId || ChartUtils.uniqueId(chartNodes);

      if (imgUrl && (imgUrl !== 'error')) {
        nodeData.icon = imgUrl;
        setImgUrl('');
      } else if (_.isObject(nodeData.icon) && !_.isEmpty(nodeData.icon)) {
        const { data = {} } = await Api.uploadNodeIcon(graphId, nodeData.id, nodeData.icon).catch((d) => d);
        nodeData.icon = data.icon;
      }

      if (nodeData.color) {
        chartNodes = chartNodes.map((n) => {
          if (n.type === nodeData.type) {
            n.color = nodeData.color;
          }
          return n;
        });
      }

      if (nodeData.icon) {
        nodeData.nodeType = 'infography';
      } else {
        nodeData.nodeType = 'square';
      }

      if (nodeData.location) {
        const { location: { lat, lng }, address } = nodeData.location;

        nodeData.location = {
          lat,
          lng,
          address,
        };
      }

      if (update) {
        chartNodes[index] = { ...chartNodes[index], ...nodeData };
        nodeData.update = true;
      } else {
        nodeData.create = true;
        nodeData.createdAt = moment().unix();
        nodeData.createdUser = currentUserId;
        chartNodes.push(nodeData);

        if (!_.isEmpty(nodeData.customFields)) {
          dispatch(updateNodesCustomFieldsRequest(graphId, [{
            id: nodeData.id,
            customFields: nodeData.customFields,
          }]));
        }
      }

      Chart.render({ nodes: chartNodes });

      closeExpand();
      dispatch(toggleNodeModal());

      setNodeData({});
    }

    setErrors({ ...errors });
  };

  const handleChange = (path, item, editIndex) => {
    let value = item;

    const changeNode = nodeData;
    const updateErrors = errors;

    if (path === 'type') {
      _.set(changeNode, path, value);
      _.unset(updateErrors, path);

      // edit color with type
      path = 'color';
      value = ChartUtils.nodeColorObj[value] || '';
    } else if (path === 'icon' && editIndex === 'cancel') {
      _.unset(changeNode, path, '');
    }

    _.set(changeNode, path, value);
    _.unset(updateErrors, path);

    setNodeData({ ...changeNode });
    setErrors({ ...updateErrors });
  };

  return (
    <Modal
      className={expand ? 'ghModal expandAddNode' : 'ghModal'}
      overlayClassName="ghModalOverlay addNode"
      isOpen={!_.isEmpty(addNodeParams)}
      onRequestClose={closeModal}
      ariaHideApp={ariaHideApp ?? false}
    >
      <div className="addNodeContainer containerModal">
        <div className="addNodetitle">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={closeModal} />
          <h2 className="add-node-text">{_.isNull(index) ? 'Add New Node' : 'Edit Node'}</h2>
        </div>
        <form
          id="createNode"
          className={`form ${imgUrl === 'error' ? '' : (nodeData.icon ? 'update-upload' : '')}`}
          onSubmit={saveNode}
        >
          <div className="node-type">
            <Select
              label="Node Type"
              limit={50}
              isCreatable
              value={[
                getTypes.find((t) => t.value === nodeData.type) || {
                  value: nodeData.type,
                  label: nodeData.type ? nodeData.type : 'Node Type',
                },
              ]}
              options={getTypes}
              error={errors.type}
              onChange={(v) => handleChange('type', v?.value || '')}
            />
          </div>
          <Input
            containerClassName="nodeName"
            label="Node Name"
            limit={50}
            value={nodeData.name}
            error={errors.name}
            autoFocus
            onChangeText={(v) => handleChange('name', v)}
            autoComplete="off"
          />
          {expand ? (
            <>
              <Input
                containerClassName="nodeLink"
                label="Node Link"
                value={nodeData.link}
                error={errors.link}
                autoFocus
                onChangeText={(v) => handleChange('link', v)}
                autoComplete="off"
              />
              <Select
                label="Node Status"
                containerClassName="nodeStatus"
                options={NODE_STATUS}
                isDisabled={currentUserRole === 'edit' && addNodeParams.createdUser !== currentUserId}
                value={NODE_STATUS.filter((t) => t.value === nodeData.status)}
                error={errors.status}
                onChange={(v) => handleChange('status', v?.value || '')}
              />
              {!editPartial ? (
                <>
                  <ColorPicker
                    label="Select Color"
                    containerClassName="colorPicker"
                    value={nodeData.color}
                    error={errors.color}
                    readOnly
                    style={{ color: nodeData.color }}
                    onChangeText={(v) => handleChange('color', v)}
                    autoComplete="off"
                    expand={!expand}
                  />
                  <div style={{ backgroundColor: nodeData.color }} className="color-preview" />

                  <FileInput
                    containerClassName="fileUpload"
                    label="Paste icon link or select"
                    accept=".png,.jpg,.gif,.svg"
                    value={nodeData.icon}
                    onChangeImgPreview={(v) => setImgUrl(v)}
                    onChangeFile={(v, file) => handleChange('icon', file)}
                    preview={nodeData.icon}
                    previewError={imgUrl}
                  />

                  <Select
                    containerClassName="keywords"
                    isCreatable
                    isMulti
                    value={nodeData.keywords.map((v) => ({ value: v, label: v }))}
                    menuIsOpen={false}
                    label="Keywords"
                    onChange={(value) => handleChange('keywords', (value || []).map((v) => v.value))}
                  />
                </>
              ) : null}

              <label className="nodeSize" htmlFor="nodeSize">Set size manually</label>

              <div className="number-wrapper">
                <Input
                  id="nodeSize"
                  containerClassName="manualSize"
                  value={nodeData.manually_size}
                  error={errors.manually_size}
                  type="text"
                  autoComplete="off"
                  isNumber
                  onChangeText={(v) => handleChange('manually_size', v)}
                />
              </div>
              {openMap && (
              <MapsLocationPicker
                onClose={() => setOpenMap(!openMap)}
                value={nodeData.location}
                onChange={(v) => handleChange('location', v)}
              />
              )}
              <div className="ghFormField locationExpandForm">
                <div className="locForm">
                  <div className="locEdit">
                    <Tooltip overlay="Select location" placement="top">
                      <span
                        onClick={() => setOpenMap(true)}
                      >
                        <img
                          src={markerImg}
                          className="locMarker"
                          alt="marker"
                        />
                        <p>{nodeData?.location?.address}</p>
                      </span>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </>
          ) : null}
          <div className="footerButtons">
            <div className="buttons">
              <button className="btn-classic" type="submit">
                {_.isNull(index) ? 'Add' : 'Save'}
              </button>
            </div>
          </div>

          <div className="advanced right">
            <div className="show-more" onClick={() => setExpand(!expand)}>
              {!expand ? 'Show More' : 'Show Less'}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

AddNodeModal.defaultProps = {
  ariaHideApp: false,
};

AddNodeModal.propTypes = {
  ariaHideApp: PropTypes.bool,
};

export default AddNodeModal;
