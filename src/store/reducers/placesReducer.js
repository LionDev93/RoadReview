import initialState from "../initialState";
import injectReducer from "../injectReducer";
import {
  CLEAR_GROUP_PLACES,
  SET_GROUP_PLACES,
  SET_PLACES
} from "../action-types";

const handlers = {
  [SET_PLACES]: (state, { payload }) => ({
    ...state,
    data: payload
  }),
  [SET_GROUP_PLACES]: (state, { payload }) => ({
    ...state,
    group: payload
  }),
  [CLEAR_GROUP_PLACES]: (state, { payload }) => ({
    ...state,
    group: null
  })
};

export default injectReducer(initialState.placesReducer, handlers);
