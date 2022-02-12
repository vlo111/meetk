import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducers from './reducers';
import { requestMiddleware } from '../helpers/redux-request';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducers,
  composeEnhancers(applyMiddleware(thunkMiddleware, requestMiddleware)),
);
window.store = store;

requestMiddleware.on.fail = ((err) => {
  if (err.response) {
    return err.response;
  }
  throw err;
});

export default store;
