import gulp from 'gulp'
import { bundle } from './bundle'
import { styles } from './styles'
import { clear } from './clear'

export function build(cb) {
    gulp.series(clear, bundle, styles, copyFiles)(cb)
}

function copyFiles(cb) {
    gulp.series(
        // copyFolder('images'),
        // copyFolder('pages'),
        // copyFolder('popup'),
        () => gulp.src([ 'src/images/*' ])
            .pipe(gulp.dest('./build/images')),
        // () => gulp.src([ 'src/pages/fonts/*' ])
        //     .pipe(gulp.dest('./build/pages/fonts')),
        () => gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/*')
            .pipe(gulp.dest('./build/pages/webfonts/')),
        () => gulp.src([ 'src/background/index.js' ])
            .pipe(gulp.dest('./build/background')),
        () => gulp.src([ 'src/manifest.json', 'src/index.html' ])
            .pipe(gulp.dest('./build'))
    )(cb)
}

// function copyFolder(folder) {
//     return function() {
//         return gulp.src([
//                 `src/${folder}/**/*`,
//                 `!src/${folder}/**/*.js`,
//                 `!src/**/*.old`,
//                 `!src/**/*.scss`
//             ])
//             .pipe(gulp.dest(`./build/${folder}`))
//     }
// }
