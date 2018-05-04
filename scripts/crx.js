import gulp from 'gulp'
import fs from 'fs'
import packer from 'gulp-crx-pack'
import { build } from './build'

export function crx(cb) {
    gulp.series(build, pack)(cb)
}

function pack() {
    return gulp.src('./build')
        .pipe(packer({
          privateKey: fs.readFileSync('./build.pem', 'utf8'),
          filename: 'build.crx'
        }))
        .pipe(gulp.dest('./build'));
}
