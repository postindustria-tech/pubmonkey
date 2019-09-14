import adServerActions from "../actions/adServer";
import {put, takeEvery, all, select, } from 'redux-saga/effects'
import SourceFactory from "../../pages/sources/Factory";
import adServerSelectors from "../selectors/adServer";

function* getOrders(action) {
    try {
        const sourceHandler = yield select(adServerSelectors.sourceHandler);
        if (sourceHandler.isReady()) {
            const orders = yield sourceHandler.getAllOrders() || [];
            yield put(adServerActions.setOrders(orders));
            yield getOrdersAfter(sourceHandler)
        }
    } catch (error) {
        console.log(error)
    }
}

function* getOrdersAfter(sourceHandler) {
    try {
        const ordersOriginal = yield select(adServerSelectors.orders);
        const orders = yield sourceHandler.getOrdersAfter(ordersOriginal) || ordersOriginal;
        yield put(adServerActions.setOrdersAfter(orders));
        // yield getAdditionalDFPParameters(sourceHandler);
    } catch (error) {
        console.log(error)
    }
}

function* getAdditionalDFPParameters(sourceHandler) {
    try {
        // const orders = yield sourceHandler.getOrdersAfter(ordersOriginal) || ordersOriginal;
        // yield put(adServerActions.setOrdersAfter(orders));
    } catch (error) {
        console.log(error)
    }
}

function* getAdUnits(action) {
    try {
        const sourceHandler = yield select(adServerSelectors.sourceHandler);
        if (sourceHandler.isReady()) {
            const adunits = yield sourceHandler.getAdUnits() || [];
            yield put(adServerActions.setAdUnits(adunits))
        }
    } catch (error) {
        console.log(error)
    }
}

function* setSourceHandler(action) {
    try {
        const {type} = action.payload;
        const sourceHandler = SourceFactory.getHandler(type);
        yield put(adServerActions.setSourceHandler(sourceHandler))
    } catch (error) {
        console.log(error)
    }
}

function* handleChangeAdServerType() {
    yield takeEvery(adServerActions.setSwitcher, setSourceHandler);

    yield takeEvery(adServerActions.setSourceHandler, getOrders);
    yield takeEvery(adServerActions.setSourceHandler, getAdUnits);

    yield takeEvery(adServerActions.setNetworkCode, getOrders);
    yield takeEvery(adServerActions.setNetworkCode, getAdUnits);
}

function* rootSaga() {
    yield all([
        handleChangeAdServerType()
    ])
}

export default rootSaga