const EXTENSION_URL = chrome.extension.getURL('index.html')

chrome.browserAction.onClicked.addListener(() => {
    let url = EXTENSION_URL

    chrome.tabs.query({ url }, tabs => {
      if (tabs.length) {
          chrome.tabs.update(tabs[0].id, { active: true })
      } else {
          chrome.tabs.create({ url })
      }
    })

});
