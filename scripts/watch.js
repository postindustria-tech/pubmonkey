import gulp from 'gulp'
import {
    bundle,
    contentScriptsBundle,
    // backgroundScriptsBundle,
    popupScriptsBundle,
    pageScriptsBundle
} from './bundle'
import { pagesCSS } from './styles'
import { build } from './build'

export function watch(cb) {
    gulp.watch(['./src/content/*.js'], contentScriptsBundle)
    // gulp.watch(['./src/background/*.js', './src/core/**/*.js'], backgroundScriptsBundle)
    gulp.watch(['./src/popup/*.js'], popupScriptsBundle)
    gulp.watch(['./src/pages/**/*.js'], pageScriptsBundle)
    gulp.watch(['./src/pages/**/*.scss'], pagesCSS)
    gulp.watch(['./src/popup/*.html'], updatePopupFiles)
    gulp.watch(['./src/index.html'], updateIndexFile)
    gulp.series(build)(cb)
}

function updatePopupFiles() {
    return gulp.src(['src/popup/*'])
        .pipe(gulp.dest('./build/popup'))
}

function updateIndexFile() {
    return gulp.src(['src/index.html'])
        .pipe(gulp.dest('./build/'))
}
