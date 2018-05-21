window.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tabs => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { action: 'get_order_id' },
            data => {
                if (data === false) {
                    document.getElementById('backup_current_order').setAttribute('disabled', 'disabled')
                }
            }
        )
    })

    document.getElementById('backup_current_order').addEventListener('click', () => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { action: 'backup_current_order' }
            )
        })
    })

    document.getElementById('restore_backup').addEventListener('click', () => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { action: 'restore_backup' }
            )
        })
    })

    // document.getElementById('backup_orders').addEventListener('click', () => {
    //     chrome.tabs.query({
    //         active: true,
    //         currentWindow: true
    //     }, tabs => {
    //         chrome.tabs.sendMessage(
    //             tabs[0].id,
    //             { action: 'backup_orders' }//,
    //             // data => { alert(data) }
    //         )
    //     })
    // })
    //
    // document.getElementById('restore_orders').addEventListener('click', () => {
    //     chrome.tabs.query({
    //         active: true,
    //         currentWindow: true
    //     }, tabs => {
    //         chrome.tabs.sendMessage(
    //             tabs[0].id,
    //             { action: 'restore_orders' }
    //         )
    //     })
    // })
})
