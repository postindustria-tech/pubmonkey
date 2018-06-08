import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { OrdersList, BackupsList, BackupView } from '../components'

export const AppRouter = () => (
    <HashRouter>
        <Switch>
            <Route exact path="/" component={ OrdersList } />
            <Route path="/orders" component={ OrdersList } />
            <Route path="/backups" component={ BackupsList } />
            <Route path="/backup/preview" exact component={ BackupView } />
            <Route path="/backup/:date" component={ BackupView } />
        </Switch>
    </HashRouter>
)
