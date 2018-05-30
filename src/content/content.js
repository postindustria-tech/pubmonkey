import $ from 'jquery'
import { RPCController } from './rpc'

console.log('content script loaded')

window.onload = () => {
    if (location.pathname === '/orders') {
        // console.log('orders page')
        //
        // let heading = $('table:eq(0)'),
        //     table = $('table:eq(1)'),
        //     selectAll = $('<input type="checkbox"/>').css({
        //         position: 'absolute',
        //         left: -22,
        //         top: 4,
        //         cursor: 'pointer'
        //     })
        //
        // selectAll.click(e => e.stopPropagation())
        //
        // heading.find('th:eq(0)').prepend(selectAll)
        //
        // console.log(table.html())
    }
}

chrome.runtime.onMessage.addListener(e => {
    console.log('mounting controls')
    mountControls()
})

var checkboxes = {}

function mountControls() {
    $('table:eq(0) th:eq(0)')
        .append(
            $('<input type="checkbox" class="_ex-checkbox heading"/>')
                .click(function(e) {
                    e.stopPropagation()

                    let checked = $(this).is(':checked')

                    Object.keys(checkboxes).forEach(key => {
                        checkboxes[key].checked = checked
                        checkboxes[key].el.prop({ checked })
                    })
                    console.log(checkboxes)
                })
        )

    $('table:eq(1) tbody tr')
        .slice(1)
        .find('td:eq(0)').each((id, el) => {
            let key = $('a', el).attr('href').replace(/.+key=(.+)$/, '$1'),
                current = {
                    checked: false,
                    el: $('<input type="checkbox" class="_ex-checkbox"/>')
                            .click(() => {
                                current.checked = !current.checked
                                console.log(checkboxes)
                            }
                            )
                }

            current.el.prependTo(el)
            checkboxes[key] = current
        })
}

$('head').append(`
    <style>
        ._ex-checkbox {
            position: absolute;
            left: -2px;
            margin-top: 4px;
            cursor: pointer;
        }

        ._ex-checkbox.heading {
            left: -22px;
            margin-top: 14px;
        }

        ._ex-checkbox.heading:hover::before {
            content: "select all";
            position: relative;
            top: -18px;
            text-align: center;
            white-space: nowrap;
        }
    </style>
`)
