import adServerActions from "../actions/adServer";
import {put, takeEvery, all} from 'redux-saga/effects'
import SourceFactory from "../../pages/sources/Factory";

function* getOrders(action) {
    try {
        const {type} = action.payload;

        const sourceHandler = SourceFactory.getHandler(type);
        const orders = yield sourceHandler.getAllOrders() || [];

        yield  put(adServerActions.setOrders(orders))
    } catch (error) {
        console.log(error)
    }
}

function* handleChangeAdServerType() {
    yield takeEvery(adServerActions.setSwitcher, getOrders)
}

function* rootSaga() {
    yield all([
        handleChangeAdServerType()
    ])
}

export default rootSaga