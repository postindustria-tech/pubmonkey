import {handleActions} from "redux-actions";
import adServerActions from "../actions/adServer";
import {AD_SERVER_MOPUB} from "../../pages/constants/source";

export const adServerInitialState = {
    type: AD_SERVER_MOPUB,
    orders: [],
    adunits: []
};

const adServerReduces = handleActions(
    {
        [adServerActions.setSwitcher]: (state, action) => ({
            ...state,
            type: action.payload.type
        }),
        [adServerActions.setOrders]: (state, action) => ({
            ...state,
            orders: action.payload.orders
        }),
        [adServerActions.setAdUnits]: (state, action) => ({
            ...state,
            adunits: action.payload.adunits
        }),
        [adServerActions.updateOrderStatus]: (state, action) => ({
            ...state,
            orders: state.orders.map(order => {
                if (order.key === action.payload.key) {
                    order.status = action.payload.status;
                }
                return order;
            })
        })
    },
    adServerInitialState
);

export default adServerReduces;
