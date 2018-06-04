import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { Orders } from '../components'

export const AppRouter = () => (
    <HashRouter>
        <Switch>
            <Route exact path="/" component={ Orders } />
            <Route path="/orders" component={ Orders } />
        </Switch>
    </HashRouter>
)
