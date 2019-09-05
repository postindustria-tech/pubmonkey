import {createAction} from "redux-actions";

const setSwitcher = createAction('adServer--setSwitcher', type => ({type}));
const setOrders = createAction('adServer--setOrders', orders => ({orders}));
const setAdUnits = createAction('adServer--setAdUnits', adunits => ({adunits}));
const updateOrderStatus = createAction("adServer--updateOrderStatus", (status, key) => ({status, key}));

const adServerActions = {
    setSwitcher,
    setOrders,
    setAdUnits,
    updateOrderStatus
};

export default adServerActions;
