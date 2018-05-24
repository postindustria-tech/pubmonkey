import axios from 'axios'

// axios.get(`https://app.mopub.com/web-client/api/line-items/get?key=f297a06e85d84d2eb70cb26de591547d`)
//     .then(result => console.log(result))

console.log('background script loaded!')

let url = chrome.extension.getURL('pages/page.html')

chrome.tabs.query({ url }, tabs => {
  if (tabs.length) {
      chrome.tabs.update(tabs[0].id, { url, active: true })
  }
  else {
      chrome.tabs.create({ url })
  }
})

const Controller = new class {
    something(a, b) {
        console.log(b, a)

        return 42
    }
}

function RPCHandler({ rpc, method, args, action }, sender, sendResponse) {
    if (rpc) {
        if (Controller[method]) {
            Promise.resolve(Controller[method](...args))
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
