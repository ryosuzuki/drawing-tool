window.loadSvg = require('load-svg')
window.parsePath = require('extract-svg-path').parse
window.svgMesh3d = require('svg-mesh-3d')

window.reindex= require('mesh-reindex');
window.unindex= require('unindex-mesh');
window.createGeom = require('three-simplicial-complex')(THREE)

window.meshLaplacian = require('mesh-laplacian')
window.csrMatrix = require('csr-matrix')
window.drawTriangles = require('draw-triangles-2d')