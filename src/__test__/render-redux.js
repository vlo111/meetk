import Enzyme, { mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import * as redux from 'react-redux';
import { Provider } from 'react-redux';
import React from 'react';
import { requestMiddleware } from '../helpers/redux-request';

const middlewares = [thunk, requestMiddleware];
const mockStore = configureMockStore(middlewares);

Enzyme.configure({ adapter: new Adapter() });

export default (
  component,
) => {
  const store = mockStore();

  const spy = jest.spyOn(redux, 'useSelector');

  spy.mockReturnValue({ addNodeParams: 'test' });

  return mount(
    <Provider store={store}>
      {component}
    </Provider>,
  );
};
