import React, { Component } from 'react';
import ReactDataSheet from 'react-datasheet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { setActiveButton, setGridIndexes, toggleGrid } from '../../store/actions/app';
import Chart from '../../Chart';
import Input from '../form/Input';
import Select from '../form/Select';
import Convert from '../../helpers/Convert';
import { DASH_TYPES } from '../../data/link';
import SvgLine from '../SvgLine';
import Validate from '../../helpers/Validate';
import ChartUtils from '../../helpers/ChartUtils';
import Checkbox from '../form/Checkbox';

let CHECKED = false;
class DataTableLinks extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.array.isRequired,
    selectedLinks: PropTypes.array.isRequired,
    links: PropTypes.array.isRequired,
    allNodes: PropTypes.array.isRequired,
    allLinks: PropTypes.array.isRequired,
    toggleGrid: PropTypes.func.isRequired,
    setLinksGrouped: PropTypes.func.isRequired,
  }

  initGridValues = memoizeOne((links) => {
    if (!_.isEmpty(links)) {
      const grid = Convert.linkDataToGrid(links);

      grid.map((cells) => {
        cells.forEach((cell) => {
          if (cell.key === 'source' || cell.key === 'target') {
            const node = ChartUtils.getNodeById(cell.value);
            if (node) {
              cell.orginalValue = cell.value;
              cell.value = node.name;
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
      const [error, value] = Validate.link(d.cell.key, d.value);
      if (error) {
        toast.error(error);
      }

      if (d.cell.key === 'source' || d.cell.key === 'target') {
        const node = ChartUtils.getNodeById(d.value);

        if (node) {
          grid[d.row][d.col].orginalValue = value;
          grid[d.row][d.col].value = node.name;
        }
      } else {
        grid[d.row][d.col] = { ...grid[d.row][d.col], value };
      }
    });
    this.setState({ grid });
    const linksChanged = Convert.gridDataToLink(grid);
    const links = this.props.allLinks.map((d) => {
      const changed = linksChanged.find((c) => c.index === d.index);
      if (changed) {
        // eslint-disable-next-line no-param-reassign
        d = changed;
      }
      return d;
    });

    this.props.setLinksGrouped(links);

    Chart.render({ links });
  }

  getValues = (arr) => {
    const values = [];
    arr.forEach((grid) => {
      values.push(grid[0].value);
    });

    return values;
  }

  sheetRenderer = (props, className) => {
    const { grid } = this.state;
    const { selectedLinks } = this.props;
    const position = className || '';
    const gridValues = this.getValues(grid);
    let isAllChecked = true;
    if (grid.length) {
      gridValues.forEach((l) => {
        if (!Number.isFinite(selectedLinks.find((p) => p === l))) {
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
                  onChange={() => this.props.setGridIndexes('links', isAllChecked ? [] : grid.map((g) => g[0].value))}
                  checked={isAllChecked}
                  id="all"
                />
                <label className="pull-left" htmlFor="all" />
              </div>
            </th>
            <th className={`${position} cell type`} width="150"><span>Type</span></th>
            <th className={`${position} cell source`} width="150"><span>Source</span></th>
            <th className={`${position} cell target`} width="150"><span>Target</span></th>
            <th className={`${position} cell value`} width="80"><span>Value</span></th>
            <th className={`${position} cell linkType`} width="100"><span>Link Type</span></th>
            <th className={`${position} cell direction`} width="90"><span>Direction</span></th>
            <th className={`${position} cell status`} width="90"><span>Status</span></th>
          </tr>
        </thead>
        <tbody>
          {props.children}
        </tbody>
      </table>
    );
  }

  cellRenderer = (props, className) => {
    const { selectedLinks } = this.props;

    const position = className || '';
    const {
      cell, children, ...p
    } = props;
    if (cell.key === 'index') {
      if (selectedLinks.includes(cell.value)) {
        CHECKED = true;
      } else CHECKED = false;

      return (
        <td className={`${position} cell index ${CHECKED && 'checked'}`}>
          <div className="items">
            <Checkbox
              onChange={() => this.props.toggleGrid('links', cell.value)}
              checked={selectedLinks.includes(cell.value)}
              id={cell.value}
            />
            <label className="pull-left" htmlFor={cell.value} />
          </div>
        </td>
      );
    }
    return (
      <td {...p} className={`${position} cell ${cell.key || ''} ${CHECKED && 'checked'}`}>
        {children}
      </td>
    );
  }

  renderDataEditor = (props) => {
    const defaultProps = {
      autoFocus: true,
      value: props.value,
      onKeyDown: props.onKeyDown,
      onChangeText: props.onChange,
    };
    if (['source', 'target'].includes(props.cell.key)) {
      const nodes = this.props.allNodes;
      return (
        <Select
          {...defaultProps}
          options={nodes}
          menuIsOpen
          value={nodes.find((d) => d.id === props.value)}
          getOptionLabel={(d) => d.name}
          getOptionValue={(d) => d.name}
          onChange={(v) => v && props.onChange(v.id)}
        />
      );
    }
    if (props.cell.key === 'linkType') {
      return (
        <Select
          {...defaultProps}
          value={[props.value]}
          menuIsOpen
          onChange={(v) => props.onChange(v)}
          options={Object.keys(DASH_TYPES)}
          containerClassName="lineTypeSelect"
          getOptionValue={(v) => v}
          getOptionLabel={(v) => <SvgLine type={v} />}
        />
      );
    }
    if (props.cell.key === 'direction') {
      return (
        <Select
          {...defaultProps}
          value={[props.value]}
          menuIsOpen
          placeholder="No"
          onChange={(v) => props.onChange(v)}
          options={[false, true]}
          containerClassName="lineDirectionSelect"
          getOptionValue={(v) => v}
          getOptionLabel={(v) => (v ? 'Yes' : 'No')}
        />
      );
    }
    if (props.cell.key === 'value') {
      defaultProps.type = 'number';
      defaultProps.min = '1';
    }
    if (props.cell.key === 'type') {
      const types = _.uniqBy(Chart.getLinks().filter((d) => d.type)
        .map((d) => ({
          value: d.type,
          label: d.type,
        })), 'value');

      return (
        <Select
          isSearchable
          value={[
            types.find((t) => t.value === props.value) || {
              value: props.value,
              label: props.value,
            },
          ]}
          options={types}
          menuIsOpen
          isCreatable
          onChange={(v) => props.onChange(v.value)}
        />
      );
    }
    return (
      <Input {...defaultProps} />
    );
  }

  renderValueViewer = (props) => {
    if (props.cell.key === 'linkType') {
      return (
        <span className="value-viewer">
          <SvgLine type={props.value} />
        </span>
      );
    }
    if (props.cell.key === 'direction') {
      return (
        <span className="value-viewer">
          {props.value ? 'Yes' : 'No'}
        </span>
      );
    }
    return (
      <span className="value-viewer">
        {props.value}
      </span>
    );
  }

  render() {
    const { grid } = this.state;
    const { links, classNamePos } = this.props;
    this.initGridValues(links);
    return (
      <ReactDataSheet
        className="ghGridTable ghGridTableLinks"
        data={grid}
        valueRenderer={(cell) => cell.value}
        cellRenderer={(props) => this.cellRenderer(props, classNamePos)}
        onCellsChanged={this.handleDataChange}
        sheetRenderer={(props) => this.sheetRenderer(props, classNamePos)}
        dataEditor={this.renderDataEditor}
        valueViewer={this.renderValueViewer}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  selectedLinks: state.app.selectedGrid.links,
});
const mapDispatchToProps = {
  setActiveButton,
  toggleGrid,
  setGridIndexes,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DataTableLinks);

export default Container;
