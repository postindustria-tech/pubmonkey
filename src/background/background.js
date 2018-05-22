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

chrome.runtime.onMessage.addListener(({ rpc, method, args }, sender, sendResponse) => {
    if (rpc === true) {
        if (Controller[method]) {
            Promise.resolve(Controller[method](...args))
                .then(result => sendResponse({ ok: true, result }))
        } else {
            sendResponse({ ok: false, error: `no such method in controller: "${method}"` })
        }

        return true
    }

    // chrome.tabs.query({
    //     url: 'https://app.mopub.com/*'
    // }, tabs => {
    //     chrome.tabs.sendMessage(
    //         tabs[0].id,
    //         { action: 'action' }//,
    //         // data => {
    //         //     console.log(data)
    //         // }
    //     )
    // })
})
