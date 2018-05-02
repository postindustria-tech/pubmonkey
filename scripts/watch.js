import gulp from 'gulp'
import { bundle } from './bundle'
import { build } from './build'

export function watch(cb) {
    gulp.watch(['./src/content_scripts/*'], bundle)
    gulp.watch(['./src/popup/*'], updatePopupFiles)
    gulp.series(build)(cb)
}

function updatePopupFiles() {
    return gulp.src(['src/popup/*'])
        .pipe(gulp.dest('./build/popup'))
}
