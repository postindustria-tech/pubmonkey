import React from 'react'
import ReactDOM from 'react-dom'
import {AppRouter} from './router'

import './sources'
import './auth'


ReactDOM.render(
    <AppRouter/>,
    document.getElementById('root')
)
