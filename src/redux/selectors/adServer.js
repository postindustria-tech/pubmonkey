import {createSelector} from "reselect";

const rootSelector = state => state.adServer;

const switcherType = createSelector(
    rootSelector,
    adServer => adServer.type
);

const sourceHandler = createSelector(
    rootSelector,
    adServer => adServer.sourceHandler
);

const sourceHandlerStatus = createSelector(
    rootSelector,
    adServer => adServer.sourceHandlerReady
);

const networkCode = createSelector(
    rootSelector,
    adServer => adServer.networkCode
);

const dfpAuthModalOpen = createSelector(
    rootSelector,
    adServer => adServer.dfpAuthModalOpen
);

const createOrderModalOpen = createSelector(
    rootSelector,
    adServer => adServer.createOrderModalOpen
);

const orders = createSelector(
    rootSelector,
    adServer => adServer.orders
);

const ordersLoaded = createSelector(
    rootSelector,
    adServer => adServer.ordersLoaded
);

const adunits = createSelector(
    rootSelector,
    adServer => adServer.adunits
);

const dfpLoggedIn = createSelector(
    rootSelector,
    adServer => adServer.dfpLoggedIn
);

const dfpToken = createSelector(
    rootSelector,
    adServer => adServer.dfpToken
);

const dfpInventory = createSelector(
    rootSelector,
    adServer => ({
        sourceAdvertisers: adServer.sourceAdvertisers,
        customTargetingKeys: adServer.customTargetingKeys,
        customTargetingValues: adServer.customTargetingValues,
        creativeFormats: adServer.creativeFormats,
        networkClasses: adServer.networkClasses,
        advertiserId: adServer.advertiserId,
        ADVERTISER_DEFAULT_NAME: adServer.ADVERTISER_DEFAULT_NAME
    })
);

const filterOrderStatus = createSelector(
    rootSelector,
    adServer => ({
        filter: adServer.filter,
        updatedFiltersAt: adServer.updatedFiltersAt,
        STATUS_OPTIONS: adServer.STATUS_OPTIONS,
    })
);

const duplicateOrder = createSelector(
    rootSelector,
    adServer => ({
        orderName: adServer.orderName,
        timestamp: adServer.timestamp,
        lineItemInfo: adServer.lineItemInfo,
        defaultFields: adServer.defaultFields,
        rangeFrom: adServer.rangeFrom,
        rangeTo: adServer.rangeTo,
        adUnitsSelected: adServer.adUnitsSelected,
        title: adServer.title,
        advertiser: adServer.advertiser,
        advertiserId: adServer.advertiserId
    })
);

const getAdvertiser = createSelector(
    rootSelector,
    adServer => ({
        advertiser: adServer.advertiser,
    })
);

const adServerSelectors = {
    switcherType,
    sourceHandler,
    sourceHandlerStatus,
    networkCode,
    createOrderModalOpen,
    dfpAuthModalOpen,
    dfpLoggedIn,
    dfpToken,
    dfpInventory,
    orders,
    ordersLoaded,
    adunits,
    duplicateOrder,
    filterOrderStatus,
    getAdvertiser,
};

export default adServerSelectors;
