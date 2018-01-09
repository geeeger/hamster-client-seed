const es      = require('event-stream');
const gutil   = require('gulp-util');
const path    = require('path');
const revHash = require('rev-hash');
var addHeader = function(headerText, data, strict) {
  data = Object.assign(data || {},{_pkg:{date:new Date()}});
  headerText = (headerText ? ''+headerText+'\n' : '')
  var headerTexts = {
      js: headerText + [
          '/**',
          ' * @Source <%= _pkg.path %>',
          ' */',
          ''].join('\n'),
      css: headerText = headerText + [
          '/**',
          ' * @Source <%= _pkg.path %>',
          ' */',
          ''].join('\n'),
      html: headerText = headerText + [
          '<!--',
          ' @Source <%= _pkg.path %>',
          ' -->',
          ''].join('\n'),
      default: headerText = headerText + [
          '/**',
          ' * @Source <%= _pkg.path %>',
          ' */',
          ''].join('\n')
  }
  return es.map(function(file, cb){

    var header = headerTexts[path.extname(file.path).replace(/^\./g, '')];

    data._pkg.path = path.relative('static/', file.path);
    file.contents = Buffer.concat([
      new Buffer(gutil.template(header ? header : '', Object.assign({file : file}, data))),
      strict ? file.contents : new Buffer(file.contents.toString("utf8").replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1'))
    ]);
    cb(null, file);
  });
};

module.exports = addHeader;