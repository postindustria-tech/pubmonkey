import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { Orders, Backups } from '../components'

export const AppRouter = () => (
    <HashRouter>
        <Switch>
            <Route exact path="/" component={ Orders } />
            <Route path="/orders" component={ Orders } />
            <Route path="/backups" component={ Backups } />
        </Switch>
    </HashRouter>
)
