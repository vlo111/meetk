import _ from 'lodash';
import {
  LOADING,
  NEW_NODE_MODAL, PREVIOUS_ACTIVE_BUTTON, RESET_FILTER,
  SET_ACTIVE_BUTTON, SET_FILTER, SET_GRID_INDEXES,
  TOGGLE_GRID, ONLINE_USERS, TOGGLE_GRAPH_MAP, TOGGLE_SEARCH,
  TOGGLE_DELETE_STATE, AUTO_SCALE,
} from '../actions/app';
import ChartUtils from '../../helpers/ChartUtils';
import Chart from '../../Chart';

const initialState = {
  activeButton: 'create',
  _activeButtonPrev: 'create',
  nodeDescription: '',
  addNodeParams: {},
  isLoading: false,
  filters: ChartUtils.getFilters(),
  initialFilters: ChartUtils.getFilters(),
  selectedGrid: {
    nodes: [],
    links: [],
  },
  GraphNameButton: 'close',
  showGraphMap: false,
  showSearch: false,
  deleteState: false,
  autoScale: true,
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_ACTIVE_BUTTON: {
      if (state.activeButton === action.payload.button) {
        return state;
      }
      return {
        ...state,
        _activeButtonPrev: state.activeButton,
        activeButton: action.payload.button,
      };
    }
    case PREVIOUS_ACTIVE_BUTTON: {
      return {
        ...state,
        activeButton: state._activeButtonPrev || 'create',
      };
    }
    case NEW_NODE_MODAL: {
      return {
        ...state,
        addNodeParams: action.payload.params,
      };
    }
    case TOGGLE_GRID: {
      const { index, grid } = action.payload;
      const { selectedGrid } = state;
      selectedGrid[grid] = [...selectedGrid[grid]];
      const i = selectedGrid[grid].indexOf(index);
      if (i > -1) {
        selectedGrid[grid].splice(i, 1);
      } else {
        selectedGrid[grid].push(index);
      }
      Chart.node.attr('class', ChartUtils.setClass((d) => ({ unChecked: !ChartUtils.isCheckedNode(selectedGrid, d) })));
      Chart.link.attr('class', ChartUtils.setClass((d) => ({ unChecked: !ChartUtils.isCheckedLink(selectedGrid, d) })));

      return {
        ...state,
        selectedGrid,
      };
    }
    case SET_GRID_INDEXES: {
      const { indexes, grid } = action.payload;
      const selectedGrid = { ...state.selectedGrid };
      selectedGrid[grid] = indexes;
      Chart.node.attr('class', ChartUtils.setClass((d) => ({ unChecked: !ChartUtils.isCheckedNode(selectedGrid, d) })));
      Chart.link.attr('class', ChartUtils.setClass((d) => ({ unChecked: !ChartUtils.isCheckedLink(selectedGrid, d) })));
      return {
        ...state,
        selectedGrid,
      };
    }
    case LOADING: {
      const { isLoading } = action.payload;
      return {
        ...state,
        isLoading,
      };
    }
    case SET_FILTER: {
      const { key, value, setInitialFilter } = action.payload;
      const initialFilters = { ...state.initialFilters };
      const filters = { ...state.filters };

      _.set(filters, key, value);
      if (setInitialFilter) {
        _.set(initialFilters, key, [...value]);
      }
      // ChartUtils.setFilter(key, value);
      return {
        ...state,
        filters,
        initialFilters,
      };
    }
    case RESET_FILTER: {
      const { initialFilters } = state;
      return {
        ...state,
        filters: _.cloneDeep(initialFilters),
      };
    }
    case ONLINE_USERS: {
      return {
        ...state,
        onlineUsers: action.payload.onlineUsers,
      };
    }
    case TOGGLE_GRAPH_MAP: {
      return {
        ...state,
        showGraphMap: action.payload.open,
      };
    }
    case TOGGLE_SEARCH: {
      return {
        ...state,
        showSearch: action.payload.open,
      };
    }
    case TOGGLE_DELETE_STATE: {
      return {
        ...state,
        deleteState: action.payload.open,
      };
    }
    case AUTO_SCALE: {
      return {
        ...state,
        autoScale: action.payload.mode,
      };
    }
    default: {
      return state;
    }
  }
}
