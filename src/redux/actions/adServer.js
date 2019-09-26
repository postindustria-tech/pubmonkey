import {createAction} from "redux-actions";

const setSwitcher = createAction('adServer--setSwitcher', type => ({type}));
const setSourceHandler = createAction('adServer--setSourceHandler', sourceHandler => ({sourceHandler}));
const setAdvertiser = createAction('adServer--setAdvertiser', advertiser => ({advertiser}));
const setNetworkCode = createAction('adServer--setNetworkCode', networkCode => ({networkCode}));
const setOrders = createAction('adServer--setOrders', orders => ({orders}));
const setOrdersAfter = createAction('adServer--setOrdersAfter', orders => ({orders}));
const setAdUnits = createAction('adServer--setAdUnits', adunits => ({adunits}));
const updateOrderStatus = createAction("adServer--updateOrderStatus", (status, key) => ({status, key}));
const dfpLogIn = createAction("adServer--dfpLogIn", dfpToken => ({dfpToken}));
const dfpLogOut = createAction("adServer--dfpLogOut");
const dfpAuthModalToggle = createAction("adServer--dfpAuthModalToggle");
const dfpLoggedIn = createAction('adServer--dfpLoggedIn', dfpLoggedIn => ({dfpLoggedIn}));

const dfpLoadInventory = createAction('adServer--dfpLoadInventory', payload => (payload));
const dfpLoadAdvertiser = createAction('adServer--dfpLoadAdvertiser', payload => (payload));

const adServerActions = {
    setSwitcher,
    setSourceHandler,
    setAdvertiser,
    setNetworkCode,
    setOrders,
    setOrdersAfter,
    setAdUnits,
    updateOrderStatus,
    dfpLogIn,
    dfpLogOut,
    dfpAuthModalToggle,
    dfpLoggedIn,
    dfpLoadInventory,
    dfpLoadAdvertiser
};

export default adServerActions;
