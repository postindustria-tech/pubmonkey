export function parseSelects(selects) {
    let result = {}

    selects.forEach(select => {
        let value = select.childNodes
            .filter(({ tagName }) => tagName === 'option')
            .filter(({ rawAttrs }) => rawAttrs.indexOf('selected') !== -1)
            .map(({ rawAttrs }) => getAttr(rawAttrs, 'value')),
            name = getAttr(select.rawAttrs, 'name')

        if (name && value.length) {
            if (value.length === 1) {
                result[name] = value[0]
            } else {
                result[name] = value
            }
        }
    })

    return result
}

export function parseTextareas(textareas) {
    let result = {}

    textareas.forEach(textarea => {
        let value = textarea.text,
            name = getAttr(textarea.rawAttrs, 'name')

        if (name) {
            result[name] = value
        }
    })

    return result
}

export function parseInputs(inputs) {
    let result = {}

    inputs.forEach(({ rawAttrs }) => {
        let type = getAttr(rawAttrs, 'type'),
            name = getAttr(rawAttrs, 'name')

        if (type && name) {
            if (type === 'text' || type === 'hidden' || type === 'number') {
                result[name] = getAttr(rawAttrs, 'value')
            }

            if (type === 'checkbox') {
                let checked = rawAttrs.indexOf('checked') !== -1,
                    value = getAttr(rawAttrs, 'value')

                value = value || checked

                if (checked) {
                    if (result[name] == null) {
                        result[name] = value
                    } else {
                        if (Array.isArray(result[name])) {
                            result[name].push(value)
                        } else {
                            result[name] = [result[name], value]
                        }
                    }
                }
            }

            if (type === 'radio') {
                let checked = rawAttrs.indexOf('checked') !== -1,
                    value = getAttr(rawAttrs, 'value')

                if (checked) {
                    result[name] = value
                }
            }
        }
    })

    return result
}

function getAttr(rawAttrs, name) {
    if (getAttr.rx == null) {
        getAttr.rx = {}
    }

    if (getAttr.rx[name] == null) {
        getAttr.rx[name] = new RegExp(name + '="([^"]+)"')
    }

    let rx = getAttr.rx[name]

    if (rx.test(rawAttrs)) {
        return rawAttrs.match(rx)[1]
    } else {
        return ''
    }
}


export function isEmpty(value) {
   
    if (value === null || value === undefined) return true

    const type = typeof (value)
    if (Array.isArray(value) || type === 'string') {
        return !value.length
    }

    if (type === 'object') {
        return !Object.values(value).length
    }

    if (type === 'number') return false
    return true
}