gulp-crx-pack
=============

Pack Chrome Extension in the pipeline.

[![Build Status](https://travis-ci.org/PavelVanecek/gulp-crx.svg?branch=master)](https://travis-ci.org/PavelVanecek/gulp-crx) [![npm version](https://badge.fury.io/js/gulp-crx-pack.svg)](https://badge.fury.io/js/gulp-crx-pack)

Usage
-----

Pipe the folder with chrome extension source code into the plugin.

    var crx = require('gulp-crx-pack');
    var manifest = require('./extension-src/manifest.json');

    gulp.task('crx', function() {
      return gulp.src('./extension-src')
        .pipe(crx({
          privateKey: fs.readFileSync('./certs/key', 'utf8'),
          filename: manifest.name + '.crx'
        }))
        .pipe(gulp.dest('./build'));
    });

Install
-------

    npm install gulp-crx-pack --save-dev

Autoupdating
------------

See https://developer.chrome.com/extensions/autoupdate

You can use `gulp-crx-pack` to generate the `.xml` file too. Pass two more options:
- `codebase`: The URL to final `.crx` file
- `updateXmlFilename`: Name of the xml file.

Example:

    var crx = require('gulp-crx-pack');
    var manifest = require('./extension-src/manifest.json');

    gulp.task('crx', ['prepackage'], function() {

      // http://example.com/extension.crx
      var codebase = manifest.codebase

      var updateXmlFilename = 'update.xml'

      return gulp.src('./extension-src')
        .pipe(crx({
          privateKey: fs.readFileSync('./certs/key', 'utf8'),
          filename: manifest.name + '.crx',
          codebase: codebase,
          updateXmlFilename: updateXmlFilename
        }))
        .pipe(gulp.dest('./build'));
    });
