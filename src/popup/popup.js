window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('backup_orders').addEventListener('click', () => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            chrome.tabs.sendMessage(
                    tabs[0].id,
                    { action: 'backup_orders' }//,
                    // data => { alert(data) }
            )
        })
    })

    document.getElementById('restore_orders').addEventListener('click', () => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            chrome.tabs.sendMessage(
                    tabs[0].id,
                    { action: 'restore_orders' }
            )
        })
    })
})
