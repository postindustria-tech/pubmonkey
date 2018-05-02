import gulp from 'gulp'
import gutil from 'gulp-util'
import browserify from 'browserify'
import browserifyInc from 'browserify-incremental'
import babelify from 'babelify'
import source from 'vinyl-source-stream'

const isDev = true

var bundler

export function bundle() {
    let bundler = getBundler()

    return bundler
        .bundle()
        .on('error', function (err) {
            gutil.log(err.message);
            this.emit('end');
        })
        .pipe(source('content_scripts/end.js'))
        .pipe(gulp.dest('./build'))
}

function getBundler() {
    if (bundler != null) {
        return bundler
    }

    browserifyInc.args.debug = isDev

    bundler = browserify(Object.assign(browserifyInc.args, {
        entries: [ 'src/content_scripts/end.js' ]
    }))

    bundler.transform(
        babelify.configure({
            presets: ['stage-0', 'es2015'],
            extensions: ['.js']
        })
    )

    if (isDev) {
        browserifyInc(bundler, {
            cacheFile: './scripts/temp/bundle.json'
        })
    }

    return bundler
}
