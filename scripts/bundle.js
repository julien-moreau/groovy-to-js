const Builder = require('systemjs-builder');
const dts = require('dts-bundle');
const fs = require('fs');
const path = require('path');

function bundle (name, options) {
  const builder = new Builder('./.build/src/');

  builder.config({
    paths: {
        '*': '*.js'
    }
  });

  builder
    .buildStatic('./.build/src/index.js', name, options)
    .catch(function (err) {
        console.log(err);
    });
}

bundle('./dist/groovy-to-js.js', {
  globalName: 'GTJ',
  format: 'cjs',
  sourceMaps: true,
  externals: ['js-beautify']
});

/*
bundle('./dist/groovy-to-js.min.js', {
  globalName: 'GTJ',
  format: 'cjs',
  minify: true,
  externals: ['js-beautify']
});
*/

// Bundle DTS
dts.bundle({
  name: 'groovy-to-js',
  main: './.build/src/index.d.ts',
  out: '../../index.d.ts'
});
