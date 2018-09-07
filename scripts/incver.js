import fs from 'fs'
import { version } from '../package.json'

export function incver(cb) {
    // let next = String(version.replace(/(\d+\.\d+\.)(\d+)/, (_, major, build) => major + (Number(build) + 1)))
    let next = version.split('.')

    next[2]++

    next = next.join('.')

    inc('./package-lock.json', next)

    // let a = String(fs.readFileSync('./package.json'))
    //
    // console.log(Number(a.match(/"version"\s*:\s*"([.0-9]+)"\s*,/)[1].split('.')[2]) + 1)

    cb()
}

function update(filename, version) {
    fs. String(fs.readFileSync(filename)).replace(/"version"\s*:\s*"([^"]+)"\s*,/, `"version": "${version}",`)


}
