import axios from 'axios'
import { BackgroundController } from '../core'
import './auth'

console.log('background script loaded!')

function RPCHandler({ rpc, method, args, action }, sender, sendResponse) {
    if (rpc) {
        if (BackgroundController[method]) {
            Promise.resolve(BackgroundController[method](...args))
                .then(result => sendResponse({ ok: true, result }))
        } else {
            sendResponse({ ok: false, error: `no such method in controller: "${method}"` })
        }

        return true
    }
}

chrome.runtime.onMessageExternal.addListener(RPCHandler)
chrome.runtime.onMessage.addListener(RPCHandler)
