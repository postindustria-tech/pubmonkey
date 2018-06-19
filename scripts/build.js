import gulp from 'gulp'
import { bundle } from './bundle'
import { styles } from './styles'
import { clear } from './clear'

export function build(cb) {
    gulp.series(clear, bundle, styles, copyFiles)(cb)
}

function copyFiles() {
    copyFolder('pages')
    copyFolder('popup')
    copyFolder('images')

    return gulp.src([ 'src/manifest.json', 'src/index.html' ])
        .pipe(gulp.dest('./build'))
}

function copyFolder(folder) {
    return gulp.src([
            `src/${folder}/**/*`,
            `!src/${folder}/**/*.js`,
            `!src/**/*.old`,
            `!src/**/*.scss`
        ])
        .pipe(gulp.dest(`./build/${folder}`))
}
