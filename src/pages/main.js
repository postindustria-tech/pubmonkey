import './extensions'
import React from 'react'
import ReactDOM from 'react-dom'
import {AppRouter} from './router'

import './sources'
import './auth'
import './authAdMob'


ReactDOM.render(
    <AppRouter/>,
    document.getElementById('root')
)
