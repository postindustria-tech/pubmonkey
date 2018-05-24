import gulp from 'gulp'
import { bundle } from './bundle'
import { clear } from './clear'

export function build(cb) {
    gulp.series(clear, copyFiles, bundle)(cb)
}

function copyFiles() {
    return gulp.src([
            'src/**/*',
            '!src/**/*.old',
            '!src/content/*.js',
            '!src/popup/*.js',
            '!src/pages/*.js',
            '!src/background/*.js'
        ])
        .pipe(gulp.dest('./build'))
}
