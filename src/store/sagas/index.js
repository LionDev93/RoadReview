import placesSaga from "./placesSagas";
import watchAndLog from "./loggerSaga";
import { all } from "redux-saga/effects";

export default function*() {
  yield all([placesSaga(), watchAndLog()]);
}
