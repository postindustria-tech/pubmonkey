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
        ADVERTISER_DEFAULT_NAME: adServer.ADVERTISER_DEFAULT_NAME,
        creativeFormats: adServer.creativeFormats,
        advertiserId: adServer.advertiserId
    })
);

const duplicateOrder = createSelector(
    rootSelector,
    adServer => ({
        orderName: adServer.orderName,
        lineItemInfo: adServer.lineItemInfo,
        defaultFields: adServer.defaultFields,
        rangeFrom: adServer.rangeFrom,
        rangeTo: adServer.rangeTo,
        adunitsSelected: adServer.adunitsSelected,
        title: adServer.title,
        advertiser: adServer.advertiser,
        advertiserId: adServer.advertiserId
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
    adunits,
    duplicateOrder
};

export default adServerSelectors;
