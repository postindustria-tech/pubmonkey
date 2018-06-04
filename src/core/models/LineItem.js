import HTMLParser from 'fast-html-parser'
import { parseSelects, parseInputs, parseTextareas } from '../helpers'

export class LineItemModel {
    data = {}

    constructor(data, key) {
        if (typeof data === 'object') {
            this.fromJSON(data)
        }

        if (typeof data === 'string') {
            this.fromHTML(data, key)
        }
    }

    static createFromJSON(json) {
        return new LineItemModel(json)
    }

    static createFromHTML(html, key) {
        return new LineItemModel(html, key)
    }

    fromJSON(json) {
        this.data = json

        return this
    }

    fromHTML(html, key = '') {
        let DOM = HTMLParser.parse(html),
            inputs = parseInputs(DOM.querySelectorAll('#order_and_line_item_form input')),
            selects = parseSelects(DOM.querySelectorAll('#order_and_line_item_form select')),
            textareas = parseTextareas(DOM.querySelectorAll('#order_and_line_item_form textarea'))

        this.data = {
            ...inputs,
            ...textareas,
            ...selects,
            impression_caps: html.match(/impression_caps\:.+"(.+)".+,/)[1],
            key
        }

        return this
    }

    toJSON() {
        return this.data
    }

    toFormData() {
        let formData = new FormData,
            { data } = this

        Object.keys(data).forEach(key => {
            if (
                ['form-0-weekdays', 'adunits', 'targeted_countries'].includes(key)
                && Array.isArray(data[key])
            ) {
                data[key].forEach(value => formData.append(key, value))
            } else {
                formData.append(key, data[key])
            }
        })

        return formData
    }
}
