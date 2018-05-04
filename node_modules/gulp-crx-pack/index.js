'use strict';

var ChromeExtension = require('crx');
var through = require('through2');
var merge = require('merge');
var File = require('vinyl')
var PluginError = require('plugin-error')

module.exports = function(opt) {

  function transform(file, encoding, done) {

    // TODO proper support for streaming files
    // if (!file.isNull()) return done(null, file);

    var options = merge({
    }, opt);

    var that = this;
    var crx = new ChromeExtension(options)

    var onError = function(err) {
      console.error(err)
      done(new PluginError('gulp-crx', err))
    }

    crx.load(file.path).then(function() {
      crx.pack()
        .then(function(crxBuffer) {
          that.push(new File({
            path: options.filename,
            contents: crxBuffer
          }))

          if (options.updateXmlFilename) {
            var xmlBuffer = crx.generateUpdateXML()
            that.push(new File({
              path: options.updateXmlFilename,
              contents: xmlBuffer
            }))
          }
          done()
        })
        .catch(onError)
    })
    .catch(onError)

  }

  return through.obj(transform);

}
