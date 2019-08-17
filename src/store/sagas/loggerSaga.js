import { all, take, put, select } from 'redux-saga/effects';

function* watchAndLog() {
  while (true) {
    const action = yield take('*');
    const state = yield select();

    console.log('action', action);
    console.log('state after', state);
  }
}

export default function*() {
  yield all([watchAndLog()]);
}
