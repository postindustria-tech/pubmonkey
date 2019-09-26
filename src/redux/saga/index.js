import adServerActions from "../actions/adServer";
import {put, takeEvery, all, select} from "redux-saga/effects";
import SourceFactory from "../../pages/sources/Factory";
import adServerSelectors from "../selectors/adServer";
import {AD_SERVER_DFP} from "../../pages/constants/source";

function* getOrders(action) {
    try {
        const sourceHandler = yield select(adServerSelectors.sourceHandler);
        if (sourceHandler.isReady()) {
            const orders = yield sourceHandler.getAllOrders() || [];
            yield put(adServerActions.setOrders(orders));
            yield getOrdersAfter(sourceHandler);
        } else {
            console.log("sourceHandler isn't ready");
        }
    } catch (error) {
        console.log(error);
    }
}

function* getOrdersAfter(sourceHandler) {
    try {
        const ordersOriginal = yield select(adServerSelectors.orders);
        const orders = yield sourceHandler.getOrdersAfter(ordersOriginal) ||
        ordersOriginal;
        yield put(adServerActions.setOrdersAfter(orders));
    } catch (error) {
        console.log(error);
    }
}

function* getAdUnits(action) {
    try {
        const sourceHandler = yield select(adServerSelectors.sourceHandler);
        if (sourceHandler.isReady()) {
            const adunits = yield sourceHandler.getAdUnits() || [];
            yield put(adServerActions.setAdUnits(adunits));
        }
    } catch (error) {
        console.log(error);
    }
}

function* setSourceHandler(action) {
    try {
        const {type} = action.payload;

        localStorage.setItem("type", type);
        const sourceHandler = SourceFactory.getHandler(type);
        yield put(adServerActions.setSourceHandler(sourceHandler));
        // if (type === AD_SERVER_DFP && !sourceHandler.getNetworkCode()) {
        //     yield put(adServerActions.dfpAuthModalToggle());
        // }
        if (type === AD_SERVER_DFP) {
            const dfpLoggedIn = sourceHandler.getToken() !== null;
            yield put(adServerActions.dfpLoggedIn(dfpLoggedIn));

            if (dfpLoggedIn) {
                const sourceAdvertisers = yield sourceHandler.getAllAdvertisers() || [];
                yield put(adServerActions.dfpLoadInventory({
                    sourceAdvertisers,
                    ADVERTISER_DEFAULT_NAME: sourceHandler.ADVERTISER_DEFAULT_NAME
                }));
            }
        }
    } catch (error) {
        console.log(error);
    }
}

function* setNetworkCode() {
    try {
        const sourceHandler = yield select(adServerSelectors.sourceHandler);

        yield put(adServerActions.setSourceHandler(sourceHandler));
    } catch (error) {
        console.log(error);
    }
}

function* loadAdvertiser(action) {
    try {
        let {advertiser} = action.payload;
        const sourceHandler = yield select(adServerSelectors.sourceHandler);

        if (sourceHandler.isReady()) {
            if (advertiser === undefined) {
                advertiser = Object.keys(sourceHandler.ADVERTISER_DEFAULT_NAME)[0];
            }

            sourceHandler.setAdvertiser(advertiser);

            let customTargetingValues = [];
            let customTargetingKeys = yield sourceHandler.getCustomTargetingKeys(sourceHandler.getAdvertiser().customTargetingKey)
                .then(keys => {
                    keys = keys.map(({id}) => {
                        return id;
                    });
                    return keys;
                });

            yield Promise.all(customTargetingKeys.map(async id => {
                await sourceHandler.getCustomTargetingValues(id)
                    .then(values => {
                        values = values.map(({id, name}) => {
                            return {id, name};
                        });
                        return values;
                    })
                    .then(values => (customTargetingValues = values));
            }));

            yield put(adServerActions.dfpLoadAdvertiser({
                customTargetingKeys,
                customTargetingValues,
                creativeFormats: sourceHandler.getAdvertiser().CREATIVE_FORMATS
            }));
        }
    } catch (error) {
        console.log(error);
    }
}

function* handleChangeAdServerType() {
    yield takeEvery(adServerActions.setSwitcher, setSourceHandler);

    yield takeEvery(adServerActions.setSourceHandler, getOrders);
    yield takeEvery(adServerActions.setSourceHandler, getAdUnits);
    yield takeEvery(adServerActions.setSourceHandler, loadAdvertiser);

    yield takeEvery(adServerActions.setNetworkCode, setNetworkCode);
    yield takeEvery(adServerActions.dfpLogIn, setNetworkCode);

    yield takeEvery(adServerActions.setAdvertiser, loadAdvertiser);
}

function* rootSaga() {
    yield all([handleChangeAdServerType()]);
}

export default rootSaga;
