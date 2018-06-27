// chrome.runtime.sendMessage({ action: 'popup_opened' })

let url = chrome.extension.getURL('index.html')

chrome.tabs.query({ url }, tabs => {
  if (tabs.length) {
      chrome.tabs.update(tabs[0].id, { active: true })
  }
  else {
      chrome.tabs.create({ url })
  }
})
