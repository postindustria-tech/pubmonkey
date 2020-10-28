import React from "react";
import {HashRouter, Route, Switch} from "react-router-dom";
import {BackupsList, BackupView, OrderView} from "../components";
import AdUnitsList from "../components/AdUnits/index";
import OrdersList from "../components/Orders/List";
import MediationGroups from "../components/Mediation/Groups";
import HomeScreen from "../components/HomeScreen";
import store from "../../redux/config";
import {Provider} from "react-redux";

export const AppRouter = () => (
    <Provider store={store}>
        <HashRouter>
            <Switch>
                <Route exact path="/" component={HomeScreen}/>
                <Route path="/orders" component={OrdersList}/>
                {/* <Route path="/order/:key" component={ OrderView } /> */}
                {/*<Route path="/backups" component={BackupsList}/>*/}
                <Route path="/adunits" component={AdUnitsList}/>
                {/*<Route path="/backup/preview" exact component={BackupView}/>*/}
                {/*<Route path="/backup/:id/order/:key" component={BackupView}/>*/}
                {/*<Route path="/backup/:id" component={BackupView}/>*/}
                <Route path="/mediation" component={MediationGroups}/>
            </Switch>
        </HashRouter>
    </Provider>
);
