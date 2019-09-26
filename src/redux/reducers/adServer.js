import {handleActions} from "redux-actions";
import adServerActions from "../actions/adServer";
import {AD_SERVER_MOPUB} from "../../pages/constants/source";

const type = localStorage.getItem('type') || AD_SERVER_MOPUB;

export const adServerInitialState = {
    type: type,
    networkCode: null,
    sourceHandler: null,
    sourceHandlerReady: false,
    orders: [],
    adunits: [],
    dfpAuthModalOpen: false,
    dfpLoggedIn: false,
    dfpToken: null,
    customTargetingKeys: [],
    customTargetingValues: []
};

const adServerReduces = handleActions(
    {
        [adServerActions.setSwitcher]: (state, action) => ({
            ...state,
            type: action.payload.type,
            sourceHandlerReady: false
        }),
        [adServerActions.setNetworkCode]: (state, action) => ({
            ...state,
            networkCode: action.payload.networkCode
        }),
        [adServerActions.setSourceHandlerStatus]: (state, action) => ({
            ...state,
            sourceHandlerReady: action.payload.sourceHandlerReady
        }),
        [adServerActions.dfpLoggedIn]: (state, action) => ({
            ...state,
            dfpLoggedIn: action.payload.dfpLoggedIn
        }),
        [adServerActions.dfpLogIn]: (state, action) => ({
            ...state,
            dfpLoggedIn: true,
            dfpToken: action.payload.dfpToken
        }),
        [adServerActions.dfpLogOut]: (state, action) => ({
            ...state,
            // networkCode: null,
            sourceHandlerReady: false,
            dfpLoggedIn: false,
            dfpToken: null,
            orders: [],
            adunits: []
        }),
        [adServerActions.dfpAuthModalToggle]: (state, action) => ({
            ...state,
            dfpAuthModalOpen: !state.dfpAuthModalOpen,
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
        }),
        [adServerActions.dfpLoadInventory]: (state, action) => ({
            ...state,
            ...action.payload,
            advertiserId: action.payload.sourceAdvertisers && action.payload.sourceAdvertisers.length > 0 ? action.payload.sourceAdvertisers[0].id : null,
            sourceHandlerReady: true
        }),
        [adServerActions.dfpLoadAdvertiser]: (state, action) => ({
            ...state,
            ...action.payload
        })
    },
    adServerInitialState
);

export default adServerReduces;
