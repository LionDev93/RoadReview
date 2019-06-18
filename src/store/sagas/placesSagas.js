import { all, take, put, select } from "redux-saga/effects";
import {GET_GROUP, POST_GROUP, SET_GROUP_PLACES} from "../action-types";
import gcp_config from "../../GCP_configs";
import fetchStream from "fetch-readablestream";

const onPostGroupSaga = function*() {
  while (true) {
    try {
      const action = yield take(POST_GROUP);
      let headers = new Headers();
      headers.set(
        "Authorization",
        "Basic " + btoa(gcp_config.username + ":" + gcp_config.password)
      );
      headers.set("Accept", "application/json");
      headers.set("Content-Type", "application/json");
      fetchStream("https://roadio-master.appspot.com/v1/edit_group", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(action.payload)
      });
    } catch (e) {
      console.log(e);
    }
  }
};

const onGetGroupSage = function*() {
  while (true) {
    try {
      const { payload } = yield take(GET_GROUP);
      let headers = new Headers();
      headers.set(
        "Authorization",
        "Basic " + btoa(gcp_config.username + ":" + gcp_config.password)
      );
      let response = yield fetch(
        `https://roadio-master.appspot.com/v1/fetch_group?group_name=${
          payload.groupName
        }&lat=${payload.lat}&lon=${payload.lng}&radius=${payload.radius}`,
        {
          method: "GET",
          headers: headers
        }
      );
      response = yield response.json();
      yield put({
        type: SET_GROUP_PLACES,
        payload: response
      });
    } catch (e) {
      console.log(e);
    }
  }
};

export default function*() {
  yield all([onPostGroupSaga(), onGetGroupSage()]);
}
