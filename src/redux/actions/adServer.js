import { createAction } from 'redux-actions';

const setSwitcher = createAction('adServer--setSwitcher', type => ({ type }));
const setOrders = createAction('adServer--setOrders', orders => ({ orders }));
const setAdUnits = createAction('adServer--setAdUnits', adunits => ({ adunits }));

const adServerActions = {
    setSwitcher,
    setOrders,
    setAdUnits
};

export default adServerActions