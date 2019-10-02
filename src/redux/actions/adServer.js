import {createAction} from "redux-actions";

const setSwitcher = createAction('adServer--setSwitcher', type => ({type}));
const setSourceHandler = createAction('adServer--setSourceHandler', sourceHandler => ({sourceHandler}));
const setSourceHandlerStatus = createAction('adServer--setSourceHandlerStatus', sourceHandlerReady => ({sourceHandlerReady}));
const setAdvertiser = createAction('adServer--setAdvertiser', advertiser => ({advertiser}));
const setNetworkCode = createAction('adServer--setNetworkCode', networkCode => ({networkCode}));
const setOrders = createAction('adServer--setOrders', orders => ({orders}));
const refreshOrders = createAction("adServer--refreshOrders");
const setOrdersAfter = createAction('adServer--setOrdersAfter', orders => ({orders}));
const setAdUnits = createAction('adServer--setAdUnits', adunits => ({adunits}));
const updateOrderStatus = createAction("adServer--updateOrderStatus", (status, key) => ({status, key}));
const dfpLogIn = createAction("adServer--dfpLogIn", dfpToken => ({dfpToken}));
const dfpLogOut = createAction("adServer--dfpLogOut");
const dfpAuthModalToggle = createAction("adServer--dfpAuthModalToggle");
const dfpLoggedIn = createAction('adServer--dfpLoggedIn', dfpLoggedIn => ({dfpLoggedIn}));

const loadInventory = createAction('adServer--loadInventory', payload => (payload));
const loadAdvertiser = createAction('adServer--loadAdvertiser', payload => (payload));

const createOrderModalToggle = createAction("adServer--createOrderModalToggle", orderKey => ({orderKey}));

const adServerActions = {
    setSwitcher,
    setSourceHandler,
    setSourceHandlerStatus,
    setAdvertiser,
    setNetworkCode,
    setOrders,
    setOrdersAfter,
    refreshOrders,
    setAdUnits,
    updateOrderStatus,
    dfpLogIn,
    dfpLogOut,
    dfpAuthModalToggle,
    dfpLoggedIn,
    loadInventory,
    loadAdvertiser,
    createOrderModalToggle
};

export default adServerActions;
