import gulp from 'gulp'
import sass from 'gulp-sass'
import concat from 'gulp-concat-css'

export function styles(cb) {
    gulp.series(pagesCSS)(cb)
}

export function pagesCSS() {
    return gulp.src('./src/pages/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('styles.css'))
        .pipe(gulp.dest('./build/pages/css'))
}
