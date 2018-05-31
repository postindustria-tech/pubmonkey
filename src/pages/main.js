import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route, Switch } from 'react-router-dom'

const HelloWorld = () => (<div>hello world</div>)
const Test = () => (<div>test</div>)

const AppRouter = () => (
    <HashRouter>
        <Switch>
            <Route exact path="/" component={ HelloWorld } />
            <Route path="/test" component={ Test } />
        </Switch>
    </HashRouter>
)

ReactDOM.render(
    <AppRouter/>,
    document.getElementById('root')
)


// console.log('page script loaded!')

// const RPCController = new Proxy({}, {
//     get(target, method) {
//         return (...args) =>
//             new Promise((resolve, reject) =>
//                 chrome.runtime.sendMessage(
//                     { rpc: true, method, args },
//                     ({ ok, result, error }) =>
//                         ok ? resolve(result) : reject(error)
//                 )
//             )
//     }
// })

// RPCController.abc()

// RPCController.getLineItem('f297a06e85d84d2eb70cb26de591547d').then(result => console.log(11,result))
