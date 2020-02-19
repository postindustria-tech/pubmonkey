import React from 'react'
import ReactDOM from 'react-dom'
import {AppRouter} from './router'

import './auth'
import './sources'

ReactDOM.render(
    <AppRouter/>,
    document.getElementById('root')
)
