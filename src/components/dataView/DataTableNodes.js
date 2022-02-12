import React, { Component } from 'react';
import ReactDataSheet from 'react-datasheet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { toast } from 'react-toastify';
import stripHtml from 'string-strip-html';
import { setActiveButton, setGridIndexes, toggleGrid } from '../../store/actions/app';
import Chart from '../../Chart';
import Input from '../form/Input';
import FileInput from '../form/FileInput';
import DataEditorDescription from './DataEditorDescription';
import Convert from '../../helpers/Convert';
import Select from '../form/Select';
import { NODE_STATUS } from '../../data/node';
import Validate from '../../helpers/Validate';
import ChartUtils from '../../helpers/ChartUtils';
import MapsLocationPicker from '../maps/MapsLocationPicker';
import Checkbox from '../form/Checkbox';
import Utils from '../../helpers/Utils';

let CHECKED = false;

class DataTableNodes extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    toggleGrid: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.func.isRequired,
    selectedNodes: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
    allNodes: PropTypes.array.isRequired,
    allLinks: PropTypes.array.isRequired,
  }

  initGridValues = memoizeOne((nodes) => {
    if (!_.isEmpty(nodes)) {
      const grid = Convert.nodeDataToGrid(nodes);

      grid.map((cells) => {
        cells.forEach((cell) => {
          if (cell.key === 'location') {
            if (cell.value?.address) {
              cell.orginalValue = cell.value;
              cell.value = Utils.substr(cell.value.address, 28);
            } else {
              cell.orginalValue = undefined;
              cell.value = undefined;
            }
          }
        });
      });

      this.setState({ grid });
    }
  }, _.isEqual)

  constructor(props) {
    super(props);
    this.state = {
      grid: [],
    };
  }

  handleDataChange = (changes) => {
    const { grid } = this.state;
    changes.forEach((d) => {
      const [error, value] = Validate.node(d.cell.key, d.value);
      if (error) {
        toast.error(error);
      }

      if (d.cell.key === 'location') {
        const { location: { lat, lng }, address } = value;

        const location = {
          lat,
          lng,
          address,
        };

        grid[d.row][d.col].orginalValue = location;
        grid[d.row][d.col].value = Utils.substr(location.address, 28);
      } else {
        grid[d.row][d.col] = { ...grid[d.row][d.col], value };
      }
    });
    this.setState({ grid });
    const nodesChanged = Convert.gridDataToNode(grid);
    const links = this.props.allLinks;
    const nodes = this.props.allNodes.map((d) => {
      const changed = nodesChanged.find((c) => c.index === d.index);
      if (changed) {
        if (changed.type !== d.type) {
          changed.color = '';
          changed.color = ChartUtils.nodeColor(changed);
        }
        return changed;
      }
      return d;
    });
    Chart.render({ nodes, links });
  }

  toggleGrid = (index) => {
    this.props.toggleGrid('nodes', index);
  }

  getValues = (arr) => {
    const values = [];
    arr.forEach((grid) => {
      values.push(grid[0].value);
    });

    return values;
  }

  handleCheckBoxChange = (isAllChecked) => {
    let { nodes, selectedNodes } = this.props;
    if (!isAllChecked) {
      nodes.map((node) => {
        if (!selectedNodes.includes(node.index)) {
          selectedNodes.push(node.index);
        }
      });
    } else {
      selectedNodes = selectedNodes.filter((index) => !nodes.some((node) => node.index === index));
    }
    this.props.setGridIndexes('nodes', selectedNodes);
  }

  renderSheet = (props, className) => {
    const { selectedNodes } = this.props;
    const { grid } = this.state;
    const position = className || '';
    const gridValues = this.getValues(grid);
    let isAllChecked = true;
    if (grid.length) {
      gridValues.forEach((l) => {
        if (!Number.isFinite(selectedNodes.find((p) => p === l))) {
          isAllChecked = false;
        }
      });
    }

    return (
      <table className={props.className}>
        <thead>
          <tr>
            <th className={`${position} cell index`} width="60">
              <div className="allTableCellChecked">
                <Checkbox
                  onChange={() => this.handleCheckBoxChange(isAllChecked)}
                  checked={isAllChecked}
                  id="all"
                />
                <label className="pull-left" htmlFor="all" />
              </div>
            </th>
            <th className={`${position} cell name`} width="180"><span>Node name</span></th>
            <th className={`${position} cell type`} width="150"><span>Node type</span></th>
            <th className={`${position} cell description`} width="272"><span>Description</span></th>
            <th className={`${position} cell status`} width="272"><span>Status</span></th>
            <th className={`${position} cell nodeType`} width="130"><span>Icon shape</span></th>
            <th className={`${position} cell icon`} width="272"><span>Icon</span></th>
            <th className={`${position} cell link`} width="272"><span>Link</span></th>
            <th className={`${position} cell keywords`} width="272"><span>Keywords</span></th>
            <th className={`${position} cell location`} width="272"><span>Location</span></th>
          </tr>
        </thead>
        <tbody>
          {props.children}
        </tbody>
      </table>
    );
  }

  nodeRow = undefined;

  renderCell = (props, className) => {
    const { selectedNodes } = this.props;
    const position = className || '';
    const {
      cell, children,
      onContextMenu, onDoubleClick, onKeyUp, onMouseOver,
    } = props;
    let { onMouseDown } = props;

    if (cell.key === 'location' && cell.value?.address) {
      cell.orginalValue = cell.value;
      cell.value = Utils.substr(cell.value.address, 28);
    }
    if (['description', 'location'].includes(props.cell.key)) {
      this.onMouseDown = onMouseDown;
      onMouseDown = undefined;
    }
    if (cell.key === 'index') {
      if (selectedNodes.includes(cell.value)) {
        CHECKED = true;
      } else {
        CHECKED = false;
      }

      return (
        <td className={`${position} cell index ${CHECKED && 'checked'}`}>
          <div className="items">
            <Checkbox
              onChange={() => this.toggleGrid(cell.value)}
              checked={CHECKED}
              id={cell.value}
            />
            <label className="pull-left" htmlFor={cell.value} />
          </div>
          {/* {props.row + 1} */}
        </td>
      );
    }

    return (
      <td
        onContextMenu={onContextMenu}
        onDoubleClick={onDoubleClick}
        onKeyUp={onKeyUp}
        onMouseDown={onMouseDown}
        onMouseOver={onMouseOver}
        className={`${position} cell ${cell.key || ''} ${CHECKED && 'checked'}`}
      >
        {children}
      </td>
    );
  }

  handleLinkClick = (ev) => {
    ChartUtils.keyEvent(ev);
    if (!ev.ctrlPress) {
      ev.preventDefault();
    }
  }

  renderView = (props) => {
    const { cell } = props;
    const { value } = props;
    if (['description'].includes(cell.key)) {
      const { result: description } = stripHtml(value || '');
      return (
        <span className="value-viewer">
          {description}
        </span>
      );
    }
    if (cell.key === 'link') {
      return (
        <a href={value} className="value-viewer" onClick={this.handleLinkClick}>
          {value}
        </a>
      );
    }
    return (
      <span className="value-viewer">
        {value}
      </span>
    );
  }

  renderDataEditor = (props) => {
    const defaultProps = {
      autoFocus: true,
      value: props.value,
      onKeyDown: props.onKeyDown,
      onChangeText: props.onChange,
    };
    if (props.cell.key === 'value') {
      defaultProps.type = 'number';
    }
    if (props.cell.key === 'link') {
      defaultProps.type = 'url';
    }
    if (props.cell.key === 'icon') {
      return (
        <FileInput {...defaultProps} accept=".png,.jpg,.gif" onChangeFile={props.onChange} />
      );
    }
    if (props.cell.key === 'description') {
      return (
        <DataEditorDescription {...defaultProps} onClose={this.onMouseDown} />
      );
    }
    if (props.cell.key === 'status') {
      return (
        <Select
          menuIsOpen
          options={NODE_STATUS}
          value={NODE_STATUS.filter((t) => t.value === props.value)}
          onChange={(v) => props.onChange(v?.value || '')}
        />
      );
    }
    if (props.cell.key === 'location') {
      return (
        <MapsLocationPicker
          onClose={() => {
            this.onMouseDown(new Event('mousedown'));
            document.dispatchEvent(new Event('mousedown'));
            document.dispatchEvent(new Event('mouseup'));
          }}
          value={props.cell.orginalValue}
          onChange={props.onChange}
        />
      );
    }
    if (props.cell.key === 'type') {
      let types = this.props.allNodes
        .filter((d) => d.type)
        .map((d) => ({
          value: d.type,
          label: d.type,
        }));
      types = _.uniqBy(types, 'value');
      return (
        <Select
          menuIsOpen
          isCreatable
          autoFocus
          options={types}
          value={types.find((t) => t.value === props.value)}
          onChange={(v) => props.onChange(v?.value || props.value)}
        />
      );
    }
    if (props.cell.key === 'keywords') {
      const values = _.isString(props.value) ? props.value.split(',').filter((v) => v) : props.value;
      return (
        <Select
          isCreatable
          isMulti
          value={values.map((v) => ({ value: v, label: v }))}
          menuIsOpen={false}
          placeholder=""
          onChange={(value) => props.onChange((value || []).map((v) => v.value))}
        />
      );
    }
    return (
      <Input {...defaultProps} />
    );
  }

  render() {
    const { grid } = this.state;
    const { nodes, classNamePos } = this.props;
    this.initGridValues(nodes);
    return (
      <ReactDataSheet
        className="ghGridTable ghGridTableNodes"
        data={grid || []}
        valueRenderer={(cell) => String(cell.value || '')}
        valueViewer={this.renderView}
        cellRenderer={(props) => this.renderCell(props, classNamePos)}
        onCellsChanged={this.handleDataChange}
        sheetRenderer={(props) => this.renderSheet(props, classNamePos)}
        dataEditor={this.renderDataEditor}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  selectedNodes: state.app.selectedGrid.nodes,
});
const mapDispatchToProps = {
  setActiveButton,
  toggleGrid,
  setGridIndexes,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DataTableNodes);

export default Container;
