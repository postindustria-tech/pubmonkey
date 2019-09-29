import gulp from 'gulp'
import sass from 'gulp-sass'
import postcss from 'gulp-postcss'
import cssnano from 'cssnano'
import concat from 'gulp-concat-css'

const isDev = process.env.NODE_ENV === 'development'

export function styles(cb) {
    gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/*')
        .pipe(gulp.dest('./build/pages/webfonts/'));
    gulp.series(pagesCSS)(cb)
}

export function pagesCSS() {
    let postcssPlugins = []

    if (!isDev) {
        postcssPlugins = [ cssnano() ]
    }

    return gulp.src('./src/pages/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('styles.css'))
        .pipe(postcss(postcssPlugins))
        .pipe(gulp.dest('./build/pages/css'))
}
