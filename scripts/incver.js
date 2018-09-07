import fs from 'fs'
import { version } from '../package.json'

export function incver(cb) {
    let next = version.split('.')

    next[2]++

    next = next.join('.')

    ;[
        './package.json',
        './package-lock.json',
        './src/manifest.json',
        './src/misc.json'
    ].forEach(filename => update(filename, next))

    cb()
}

function update(filename, version) {
    fs.writeFileSync(
        filename,
        String(fs.readFileSync(filename))
            .replace(/"version"\s*:\s*"([^"]+)"/, `"version": "${version}"`)
    )
}
