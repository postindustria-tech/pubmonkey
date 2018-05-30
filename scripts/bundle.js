import gulp from 'gulp'
import gutil from 'gulp-util'
import browserify from 'browserify'
import browserifyInc from 'browserify-incremental'
import babelify from 'babelify'
import source from 'vinyl-source-stream'

const isDev = true

var bundler = {}

export function bundle(cb) {
    gulp.series(
        contentScriptsBundle,
        backgroundScriptsBundle,
        popupScriptsBundle,
        pageScriptsBundle
    )(cb)
}

export function contentScriptsBundle() {
    return customBundle('content/content.js')
}

export function backgroundScriptsBundle() {
    return customBundle('background/background.js')
}

export function popupScriptsBundle() {
    return customBundle('popup/popup.js')
}

export function pageScriptsBundle() {
    return customBundle('pages/main.js')
}

function customBundle(dest) {
    let bundler = getBundler(dest)

    return bundler
        .bundle()
        .on('error', function (err) {
            gutil.log(err.message)
            this.emit('end')
        })
        .pipe(source(dest))
        .pipe(gulp.dest('./build'))
}

function getBundler(dest) {
    if (bundler[dest] != null) {
        return bundler[dest]
    }

    let fileName = dest.replace(/.+\/(.+).js$/, '$1')

    browserifyInc.args.debug = isDev

    bundler[dest] = browserify(Object.assign(browserifyInc.args, {
        entries: [
            `src/${dest}`
        ]
    }))

    bundler[dest].transform(
        babelify.configure({
            plugins: [
                'transform-es2015-modules-commonjs',
                'transform-class-properties',
                'syntax-object-rest-spread'
            ],
            extensions: [ '.js' ]
        })
    )

    if (isDev) {
        browserifyInc(bundler[dest], {
            cacheFile: `./scripts/temp/${fileName}.json`
        })
    }

    return bundler[dest]
}
