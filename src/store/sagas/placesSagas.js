import { all, take, put, select } from 'redux-saga/effects';
import {
  GET_GROUP,
  POST_GROUP,
  SET_GROUP_PLACES,
  POST_RESULT,
} from '../action-types';
import gcp_config from '../../GCP_configs';
import fetchStream from 'fetch-readablestream';
import { NotificationManager } from 'react-notifications';
const onPostGroupSaga = function*() {
  while (true) {
    try {
      console.log('postGroup called');
      const action = yield take(POST_GROUP);
      let headers = new Headers();
      headers.set(
        'Authorization',
        'Basic ' + btoa(gcp_config.username + ':' + gcp_config.password),
      );
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');
      yield fetchStream('https://roadio-master.appspot.com/v1/edit_group', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(action.payload),
      });
      NotificationManager.success('Updated~');
      yield put({
        type: POST_RESULT,
        payload: Math.random() * 100,
      });
    } catch (e) {
      console.log(e);
      yield put({
        type: POST_RESULT,
        payload: Math.random() * 100,
      });
    }
  }
};

const onGetGroupSage = function*() {
  while (true) {
    try {
      console.log('getGroup called');
      const { payload } = yield take(GET_GROUP);
      let headers = new Headers();
      headers.set(
        'Authorization',
        'Basic ' + btoa(gcp_config.username + ':' + gcp_config.password),
      );
      let response = yield fetch(
        `https://roadio-master.appspot.com/v1/fetch_group?group_name=${payload.groupName}&lat=${payload.lat}&lon=${payload.lng}&radius=${payload.radius}`,
        {
          method: 'GET',
          headers: headers,
        },
      );
      response = yield response.json();
      console.log('get group:', response);
      NotificationManager.success('GroupItems: ' + response.group_items.length);
      yield put({
        type: SET_GROUP_PLACES,
        payload: response,
      });
      yield put({
        type: POST_RESULT,
        payload: Math.random() * 100,
      });
    } catch (e) {
      console.log(e);
      yield put({
        type: SET_GROUP_PLACES,
        payload: null,
      });
      yield put({
        type: POST_RESULT,
        payload: Math.random() * 100,
      });
    }
  }
};

export default function*() {
  yield all([onPostGroupSaga(), onGetGroupSage()]);
}
