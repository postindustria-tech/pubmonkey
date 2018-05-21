import gulp from 'gulp'
import {
    bundle,
    contentScriptsBundle,
    backgroundScriptsBundle,
    popupScriptsBundle,
    pageScriptsBundle
} from './bundle'
import { build } from './build'

export function watch(cb) {
    // gulp.watch(['./src/**/*.js'], bundle)
    gulp.watch(['./src/content_scripts/*.js'], contentScriptsBundle)
    gulp.watch(['./src/background/*.js'], backgroundScriptsBundle)
    gulp.watch(['./src/popup/*.js'], popupScriptsBundle)
    gulp.watch(['./src/pages/*.js'], pageScriptsBundle)
    gulp.watch(['./src/popup/*.html'], updatePopupFiles)
    gulp.watch(['./src/pages/*.html'], updatePagesFiles)
    gulp.series(build)(cb)
}

function updatePopupFiles() {
    return gulp.src(['src/popup/*'])
        .pipe(gulp.dest('./build/popup'))
}

function updatePagesFiles() {
    return gulp.src(['src/pages/*'])
        .pipe(gulp.dest('./build/pages'))
}
