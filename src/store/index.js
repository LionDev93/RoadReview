import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { combineReducers } from "redux";

import placesReducer from "./reducers/placesReducer";
import sagas from './sagas'

// create the saga middleware
const sagaMiddleware = createSagaMiddleware();
// mount it on the Store
const store = createStore(
  combineReducers({
    placesReducer
  }),
  applyMiddleware(sagaMiddleware)
);

// then run the saga
sagaMiddleware.run(sagas);

export default store;