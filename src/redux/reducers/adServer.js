import {handleActions} from "redux-actions";
import adServerActions from "../actions/adServer";
import {AD_SERVER_MOPUB} from "../../pages/constants/source";

export const adServerInitialState = {
    type: AD_SERVER_MOPUB,
    networkCode: null,
    sourceHandler: null,
    orders: [],
    adunits: []
};

const adServerReduces = handleActions(
    {
        [adServerActions.setSwitcher]: (state, action) => ({
            ...state,
            type: action.payload.type
        }),
        [adServerActions.setNetworkCode]: (state, action) => ({
            ...state,
            networkCode: action.payload.networkCode
        }),
        [adServerActions.setSourceHandler]: (state, action) => ({
            ...state,
            orders: [],
            adunits: [],
            sourceHandler: action.payload.sourceHandler
        }),
        [adServerActions.setOrders]: (state, action) => ({
            ...state,
            orders: action.payload.orders
        }),
        [adServerActions.setOrdersAfter]: (state, action) => ({
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
