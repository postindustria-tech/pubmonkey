import adServerActions from "../actions/adServer";
import {put, takeEvery, all} from 'redux-saga/effects'
import SourceFactory from "../../pages/sources/Factory";

function* getOrders(action) {
    try {
        const {type} = action.payload;

        const sourceHandler = SourceFactory.getHandler(type);
        const orders = yield sourceHandler.getAllOrders() || [];

        yield put(adServerActions.setOrders(orders))
    } catch (error) {
        console.log(error)
    }
}

function* getAdUnits(action) {
    try {
        const {type} = action.payload;

        const sourceHandler = SourceFactory.getHandler(type);
        const adunits = yield sourceHandler.getAdUnits() || [];

        yield put(adServerActions.setAdUnits(adunits))
    } catch (error) {
        console.log(error)
    }
}

function* handleChangeAdServerType() {
    yield takeEvery(adServerActions.setSwitcher, getOrders);
    yield takeEvery(adServerActions.setSwitcher, getAdUnits);
}

function* rootSaga() {
    yield all([
        handleChangeAdServerType()
    ])
}

export default rootSaga