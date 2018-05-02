import rimraf from 'rimraf'

export function clear(cb) {
    rimraf('./build', () =>
        rimraf('./scripts/temp/*.json', cb)
    )
}
