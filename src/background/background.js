import axios from 'axios'
import { BackgroundController } from '../core'

console.log('background script loaded!')

chrome.webRequest.onCompleted.addListener(({ tabId }) => {
    let url = chrome.extension.getURL('index.html')

    chrome.tabs.query({ url }, tabs => {
      if (tabs.length) {
          chrome.tabs.update(tabs[0].id, { url, active: true })
      }
      else {
          chrome.tabs.create({ url })
      }
    })

}, {
    urls: [ 'https://app.mopub.com/dashboard/*' ]
})

chrome.webRequest.onHeadersReceived.addListener(({ statusCode }) => {
    if (statusCode === 302) {
        let url = 'https://app.mopub.com/account/login/'

        chrome.tabs.query({ url }, tabs => {
          if (tabs.length) {
              chrome.tabs.update(tabs[0].id, { url, active: true })
          }
          else {
              chrome.tabs.create({ url })
          }
        })
    }
}, { urls: [ 'https://app.mopub.com/web-client/api/orders/query' ]})

// BackgroundController.getAllOrders().catch(console.log)

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

// chrome.tabs.query({
//     url: '*://app.mopub.com/*'
// }, tabs => {
//     tabs.forEach(({ id }) => {
//         let port = chrome.tabs.connect(id)
//         port.postMessage({ aa: 22 })
//     }
//         // chrome.tabs.sendMessage(
//         //     id, { action: 'init_extension', id: chrome.runtime.id }
//         // )
//     )
// })
