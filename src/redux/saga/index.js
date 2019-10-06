import adServerActions from "../actions/adServer";
import {put, takeEvery, all, select} from "redux-saga/effects";
import SourceFactory from "../../pages/sources/Factory";
import adServerSelectors from "../selectors/adServer";
import {AD_SERVER_DFP, AD_SERVER_MOPUB} from "../../pages/constants/source";
import {isEmpty} from "../../pages/helpers";

function* getOrders(action) {
    try {
        const sourceHandler = yield select(adServerSelectors.sourceHandler);
        const ready = yield sourceHandler.isReady();
        if (ready) {
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
        const orders = yield sourceHandler.getOrdersAfter(ordersOriginal) || ordersOriginal;
        yield put(adServerActions.setOrdersAfter(orders));
    } catch (error) {
        console.log(error);
    }
}

function* getAdUnits(action) {
    try {
        const sourceHandler = yield select(adServerSelectors.sourceHandler);
        const ready = yield sourceHandler.isReady();
        if (ready) {
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
        // yield setSourceHandlerAfter();
    } catch (error) {
        console.log(error);
    }
}

function* setSourceHandlerAfter() {
    try {
        const sourceHandler = yield select(adServerSelectors.sourceHandler);
        const type = yield select(adServerSelectors.switcherType);

        const params = {
            ADVERTISER_DEFAULT_NAME: sourceHandler.ADVERTISER_DEFAULT_NAME,
            STATUS_OPTIONS: sourceHandler.STATUS_OPTIONS
        };

        if (type === AD_SERVER_DFP) {
            const dfpLoggedIn = sourceHandler.getToken() !== null;
            yield put(adServerActions.dfpLoggedIn(dfpLoggedIn));

            if (dfpLoggedIn) {
                const sourceAdvertisers = yield sourceHandler.getAllAdvertisers() || [];
                yield put(adServerActions.loadInventory({
                    sourceAdvertisers,
                    ...params
                }));
            }
        }
        if (type === AD_SERVER_MOPUB) {
            const ready = yield sourceHandler.isReady();
            if (ready) {
                yield put(adServerActions.loadInventory({
                    ...params
                }));
                yield put(adServerActions.setSourceHandlerStatus(true));
            }
        }
    } catch (error) {
        console.log(error);
    }
}

function* setNetworkCode() {
    try {
        const sourceHandler = yield select(adServerSelectors.sourceHandler);
        const ready = yield sourceHandler.isReady();
        if (ready) {
            yield put(adServerActions.setSourceHandler(sourceHandler));
        }
    } catch (error) {
        console.log(error);
    }
}

function* loadAdvertiser(action) {
    try {
        let {advertiser} = action.payload;
        const sourceHandler = yield select(adServerSelectors.sourceHandler);
        const type = yield select(adServerSelectors.switcherType);

        let customTargetingValues = [],
            customTargetingKeys = [];

        const ready = yield sourceHandler.isReady();
        if (ready) {
            if (advertiser === undefined) {
                advertiser = Object.keys(sourceHandler.ADVERTISER_DEFAULT_NAME)[0];
            }

            sourceHandler.setAdvertiser(advertiser);

            if (type === AD_SERVER_DFP) {
                customTargetingKeys = yield sourceHandler.getCustomTargetingKeys(sourceHandler.getAdvertiser().customTargetingKey)
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
            }

            yield put(adServerActions.loadAdvertiser({
                customTargetingKeys,
                customTargetingValues,
                creativeFormats: sourceHandler.getAdvertiser().CREATIVE_FORMATS
            }));
        }
    } catch (error) {
        console.log(error);
    }
}

function* setCreateOrderModalToggle(action) {
    try {
        const {orderKey} = action.payload;
        const type = yield select(adServerSelectors.switcherType);
        const sourceHandler = yield select(adServerSelectors.sourceHandler);
        const createOrderModalOpen = yield select(adServerSelectors.createOrderModalOpen);

        let params = {};

        // Duplicate order
        if (orderKey !== undefined && !createOrderModalOpen) {
            params = yield sourceHandler.getOrderWithLineItems(orderKey)
                .then(order => {
                    console.log(order);
                    let adUnitKeys = [],
                        defaultLineItemInfo = sourceHandler.lineItemInfo,
                        values = {},
                        defaultFields = [],
                        arrays = [],
                        rangeFrom = 999999999,
                        rangeTo = 0;
                    if (!isEmpty(order.lineItems)) {
                        for (let key in defaultLineItemInfo) {
                            values[key] = [];
                        }

                        order.lineItems.forEach(lineItem => {
                            for (let key in defaultLineItemInfo) {
                                if (!lineItem.hasOwnProperty(key)) {
                                    continue;
                                }
                                let value = lineItem[key];
                                if (Array.isArray(value)) {
                                    if (arrays.indexOf(key) === -1) {
                                        arrays.push(key);
                                    }
                                    value = value.join('###');
                                }
                                if (values[key].indexOf(value) === -1) {
                                    values[key].push(value);
                                }
                            }
                        });

                        for (let key in defaultLineItemInfo) {
                            if (values.hasOwnProperty(key) && values[key].length === 1) {
                                values[key] = values[key].shift();
                            } else {
                                values[key] = defaultLineItemInfo[key];
                                defaultFields.push(key);
                            }
                        }

                        order.lineItems.forEach(lineItem => {
                            if (lineItem.bid > rangeTo) {
                                rangeTo = lineItem.bid;
                            }
                            if (lineItem.bid < rangeFrom) {
                                rangeFrom = lineItem.bid;
                            }
                            adUnitKeys = [...adUnitKeys, ...lineItem.adUnitKeys].unique();
                        });
                    }

                    if (isEmpty(values)) {
                        values = lineItemInfo;
                    } else {
                        for (let i in arrays) {
                            const key = arrays[i];
                            if (!isEmpty(values[key])) {
                                values[key] = values[key].split('###');
                            } else {
                                values[key] = [];
                            }
                        }
                    }

                    let advertiser = {};
                    switch (type) {
                        case AD_SERVER_MOPUB:
                            advertiser['advertiser'] = sourceHandler.getAdvertiserByName(order.advertiser);
                            // this.changeAdvertiser(advertiser.advertiser);
                            break;
                        case AD_SERVER_DFP:
                            advertiser['advertiserId'] = order.advertiserId;
                            break;
                    }

                    return {
                        orderName: order.name,
                        lineItemInfo: values,
                        defaultFields: defaultFields,
                        rangeFrom: rangeFrom,
                        rangeTo: rangeTo,
                        adunitsSelected: adUnitKeys,
                        title: "Duplicate Order",
                        ...advertiser
                    }
                });
        }

        yield put(adServerActions.setCreateOrderModalToggle({
            ...params,
            createOrderModalOpen: !createOrderModalOpen
        }));

    } catch (error) {
        console.log(error);
    }
}

function* handleChangeAdServerType() {
    // Change type of adServer
    yield takeEvery(adServerActions.setSwitcher, setSourceHandler);

    yield takeEvery(adServerActions.setSourceHandler, setSourceHandlerAfter);
    yield takeEvery(adServerActions.setSourceHandler, getOrders);
    yield takeEvery(adServerActions.setSourceHandler, getAdUnits);
    yield takeEvery(adServerActions.setSourceHandler, loadAdvertiser);

    // Set up a new network code in modal
    yield takeEvery(adServerActions.setNetworkCode, setNetworkCode);
    // Gave permission for google account
    yield takeEvery(adServerActions.dfpLogIn, setNetworkCode);

    // Changed advertiser in create order modal
    yield takeEvery(adServerActions.setAdvertiser, loadAdvertiser);

    // Refresh Orders list after some changes
    yield takeEvery(adServerActions.refreshOrders, getOrders);

    //
    yield takeEvery(adServerActions.createOrderModalToggle, setCreateOrderModalToggle);
}

function* rootSaga() {
    yield all([handleChangeAdServerType()]);
}

export default rootSaga;
