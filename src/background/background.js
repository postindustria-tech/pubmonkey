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

chrome.runtime.onMessage.addListener(({ action }, sender, sendResponse) => {
    console.log(action)

    chrome.tabs.query({
        url: 'https://app.mopub.com/*'
    }, tabs => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { action: 'lal' }//,
            // data => {
            //     console.log(data)
            // }
        )
    })
})
