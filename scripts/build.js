import gulp from 'gulp'
import { bundle } from './bundle'
import { clear } from './clear'

export function build(cb) {
    gulp.series(clear, bundle, copyFiles)(cb)
}

function copyFiles() {
    copyFolder('pages')
    copyFolder('popup')
    copyFolder('images')

    return gulp.src([ 'src/manifest.json' ])
        .pipe(gulp.dest('./build'))
}

function copyFolder(folder) {
    return gulp.src([
            `src/${folder}/**/*`,
            `!src/${folder}/**/*.js`,
            `!src/**/*.old`
        ])
        .pipe(gulp.dest(`./build/${folder}`))
}
