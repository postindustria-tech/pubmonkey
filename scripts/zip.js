import gulp from 'gulp'
import gulpzip from 'gulp-zip'
import {build} from './build'
import {name, version} from '../src/manifest.json'

const FILENAME = `${name.toLowerCase()}-${version}`

export function zip(cb) {
    gulp.series(build, packZIP)(cb)
}

function packZIP() {
    return gulp.src('./build/**/*')
        .pipe(gulpzip(FILENAME + '.zip'))
        .pipe(gulp.dest('./build'))
}
