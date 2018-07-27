import gulp from 'gulp'
import { bundle } from './bundle'
import { styles } from './styles'
import { clear } from './clear'

export function build(cb) {
    gulp.series(clear, bundle, styles, copyFiles)(cb)
}

function copyFiles(cb) {
    gulp.series(
        copyFolder('images'),
        copyFolder('pages'),
        copyFolder('popup'),
        () => gulp.src([ 'src/manifest.json', 'src/index.html' ])
            .pipe(gulp.dest('./build'))
    )(cb)
}

function copyFolder(folder) {
    return function() {
        return gulp.src([
                `src/${folder}/**/*`,
                `!src/${folder}/**/*.js`,
                `!src/**/*.old`,
                `!src/**/*.scss`
            ])
            .pipe(gulp.dest(`./build/${folder}`))
    }
}
