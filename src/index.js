import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import reportWebVitals from './reportWebVitals';
import './helpers/Promise.allValues';
import App from './App';
import store from './store';

// import 'bootstrap/dist/css/bootstrap.min.css';
import 'rc-tooltip/assets/bootstrap.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-input-range/lib/css/index.css';
import 'react-datasheet/lib/react-datasheet.css';
//import 'react-image-crop/lib/ReactCrop.scss';
import './assets/styles/font-awesome.css';
import './assets/styles/style.scss';

ReactDOM.render((
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
), document.getElementById('root'));

reportWebVitals();

window.graphs = {
  version: '0.1.2',
};
