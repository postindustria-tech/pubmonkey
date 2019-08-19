import { createAction } from 'redux-actions';

const setSwitcher= createAction('adServer--setSwitcher', type => ({ type }));
const setOrders= createAction('adServer--setOrders', orders => ({ orders }));

const adServerActions = {
    setSwitcher,
    setOrders
};

export default adServerActions