var fs = require('fs');
var repl = require('repl');
var dgpc = require('./index.js');
var filename = 'demo.obj'

/*
  vertex of 47
  x: 0.6578133702278137
  y: 0.7436342835426331
  z: 0
 */
var b_index = [1034, 47]
var b_positions = [
  { x: 0.4568122625350952, y: 0.12011616677045822, z: 0 },
  { x: 0.8, y: 0.5, z: 0 }
]
var json = {
  filename: filename,
  size: 1349,
  b_index: b_index,
  b_positions: b_positions
}

var result = dgpc.getDeformation(json);

repl.start('> ').context.r = result;


