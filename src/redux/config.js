import {combineReducers, createStore, applyMiddleware} from 'redux'
import adServerReduces, {adServerInitialState} from "./reducers/adServer";
import logger from "redux-logger";
import createSagaMiddleware from 'redux-saga'
import rootSaga from "./saga";

const mainReducer = combineReducers({
    adServer: adServerReduces
});

const sagaMiddleware = createSagaMiddleware();

const mainInitialState = {
    adServer: adServerInitialState
};

const store = createStore(mainReducer, mainInitialState, applyMiddleware(logger, sagaMiddleware));

sagaMiddleware.run(rootSaga);

export default store