import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { combineReducers } from 'redux';

import placesReducer from './reducers/placesReducer';
import sagas from './sagas';

// create the saga middleware
const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// mount it on the Store
const store = createStore(
  combineReducers({
    placesReducer,
  }),
  composeEnhancers(applyMiddleware(sagaMiddleware)),
);

// then run the saga
sagaMiddleware.run(sagas);

export default store;
