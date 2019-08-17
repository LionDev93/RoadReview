import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux';
import store from './store';

import 'semantic-ui-css/semantic.min.css';
import './css/index.css';

import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

ReactDOM.render(
  <Provider store={store}>
    <App />
    <NotificationContainer />
  </Provider>,
  document.getElementById('root'),
);
registerServiceWorker();
