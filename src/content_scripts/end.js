console.log('content script loaded')

chrome.runtime.onMessage.addListener(({ action }, sender, sendResponse) => {
    console.log(action)
})
