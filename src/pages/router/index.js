import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { OrdersList, BackupsList, BackupView, OrderView, AdUnitsList } from '../components'

export const AppRouter = () => (
    <HashRouter>
        <Switch>
            <Route exact path="/" component={ OrdersList } />
            <Route path="/orders" component={ OrdersList } />
            {/* <Route path="/order/:key" component={ OrderView } /> */}
            {/* <Route path="/backups" component={ BackupsList } /> */}
            <Route path="/adunits" component={ AdUnitsList } />
            {/* <Route path="/backup/preview" exact component={ BackupView } /> */}
            {/* <Route path="/backup/:id/order/:key" component={ BackupView } />
            <Route path="/backup/:id" component={ BackupView } /> */}
        </Switch>
    </HashRouter>
)
