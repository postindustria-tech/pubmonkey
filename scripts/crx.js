import gulp from 'gulp'
import fs from 'fs'
import packer from 'gulp-crx-pack'
import manifest from '../build/manifest.json'
import { build } from './build'

export function crx(cb) {
    gulp.series(build, pack)(cb)
}

function pack() {
    return gulp.src('./build')
        .pipe(packer({
          privateKey: fs.readFileSync('./build.pem', 'utf8'),
          filename: manifest.name + '.crx'
        }))
        .pipe(gulp.dest('./build'));
}
