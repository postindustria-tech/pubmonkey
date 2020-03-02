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

let middlewares

if (process.env.NODE_ENV === 'development') {
    middlewares = applyMiddleware(logger, sagaMiddleware);
} else {
    middlewares = applyMiddleware(sagaMiddleware);
}

const store = createStore(mainReducer, mainInitialState, middlewares);

sagaMiddleware.run(rootSaga);

export default store
