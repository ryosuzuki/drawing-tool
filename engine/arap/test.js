var fs = require('fs');
var repl = require('repl');
var dgpc = require('./index.js');
var filename = '../../demo.obj'

var json = {
  filename: filename,
  size: 500,
  b_index: [1, 2, 3],
  b_positions: []
}

var result = dgpc.getDeformation(json);

repl.start('> ').context.r = result;


