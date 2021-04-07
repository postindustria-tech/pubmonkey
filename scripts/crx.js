import gulp from 'gulp'
import fs from 'fs'
import packer from 'gulp-crx-pack'
import gulpzip from 'gulp-zip'
import { build } from './build'
import { name, version } from '../src/manifest.json'

const FILENAME = `${name.toLowerCase()}-${version}`

export function crx(cb) {
    gulp.series(build, packZIP, packCRX)(cb)
}

function packCRX() {
    return gulp.src('./build')
        .pipe(packer({
          privateKey: process.env.PRIVATE_KEY, //fs.readFileSync('./build.pem', 'utf8'),
          filename: FILENAME + '.crx'
        }))
        .pipe(gulp.dest('./build'))
}

function packZIP() {
    return gulp.src('./build/**/*')
        .pipe(gulpzip(FILENAME + '.zip'))
        .pipe(gulp.dest('./build'))
}
