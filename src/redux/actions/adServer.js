import {createAction} from "redux-actions";

const setSwitcher = createAction('adServer--setSwitcher', type => ({type}));
const setSourceHandler = createAction('adServer--setSourceHandler', sourceHandler => ({sourceHandler}));
const setOrders = createAction('adServer--setOrders', orders => ({orders}));
const setOrdersAfter = createAction('adServer--setOrdersAfter', orders => ({orders}));
const setAdUnits = createAction('adServer--setAdUnits', adunits => ({adunits}));
const updateOrderStatus = createAction("adServer--updateOrderStatus", (status, key) => ({status, key}));

const adServerActions = {
    setSwitcher,
    setSourceHandler,
    setOrders,
    setOrdersAfter,
    setAdUnits,
    updateOrderStatus
};

export default adServerActions;
