window.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#backup_orders')[0].addEventListener('click', e => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            chrome.tabs.sendMessage(
                    tabs[0].id,
                    { action: 'backup_orders' }//,
                    // (data) => { alert(data) }
            )
        })
    })
})
