import {
  CLEAR_GROUP_PLACES,
  GET_GROUP,
  POST_GROUP,
  SET_PLACES,
  ADD_NEW_ITEM,
} from '../action-types';

export const setPlaces = values => ({
  type: SET_PLACES,
  payload: values,
});

export const postGroup = values => ({
  type: POST_GROUP,
  payload: values,
});

export const getGroup = values => ({
  type: GET_GROUP,
  payload: values,
});

export const clearGroupPlaces = values => ({
  type: CLEAR_GROUP_PLACES,
  payload: values,
});

export const addNewItem = values => ({
  type: ADD_NEW_ITEM,
  payload: values,
});
