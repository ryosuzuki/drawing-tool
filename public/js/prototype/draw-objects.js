var objects = [];
var materials = [];
THREE.ImageUtils.crossOrigin = '';

var a = new THREE.Vector3(1, 0, 0);
var b = new THREE.Vector3(0, 0, 1);
var c = new THREE.Vector3(0, 1, 0);
var ab = new THREE.Vector3();
var bc = new THREE.Vector3();
ab.subVectors(b, a);
bc.subVectors(c, b);

var normal = new THREE.Vector3();
normal.crossVectors(ab, bc)
normal.normalize()
var objects = [];

var material = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  wireframe: false
})

var mesh;

function toggleWireframe () {
  material.wireframe = !material.wireframe;
  mesh.material = material;
  mesh.material.needsUpdate = true
}

function loadSVG (type) {
  scene.remove(mesh)
  for (var i=0; i<lines.length; i++) {
    scene.remove(lines[i])
  }
  var file = '/public/assets/human.svg'
  if (type == 'mickey') file = '/public/assets/mickey.svg'
  if (type == 'donald') file = '/public/assets/donald.svg'

  loadSvg(file, function (err, svg) {
    console.log(svg)
    d = $('path', svg).attr('d');
    console.log('Start svgMesh3d')
    mesh = svgMesh3d(d, {
      scale: 1,
      simplify: 1,
      randomization: 100,
    });

    complex = reindex(unindex(mesh.positions, mesh.cells));
    drawSVG(complex)

  })
}

function drawSVG (complex) {
  console.log('Start drawSVG')
  var geometry = new createGeom(complex)
  window.geometry = geometry;
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh);
  objects.push(mesh)

  Q.fcall(computeUniq(geometry))
  .then(createObj(geometry))

  // Q.fcall(computeUniq())
  // .then(computeLaplacian())
  // .then(computeSkeleton())
//  .then(redraw())
}


$(function () {
  socket.on('res-update-arap', function (result) {
    console.log(result)
    var positions = result.positions
    window.positions = positions
    updateVertexPositions(positions)
  })
})

var nm
function updateVertexPositions (positions) {
  var vertices = []
  for (var i=0; i<positions.length/3; i++) {
    vertices[i] = new THREE.Vector3(positions[3*i], positions[3*i+1], positions[3*i+2])
  }

  var g = new THREE.Geometry()
  for (var i=0; i<geometry.faces.length; i++) {
    var face = geometry.faces[i]
    var num = g.vertices.length
    g.vertices.push(vertices[map[face.a]])
    g.vertices.push(vertices[map[face.b]])
    g.vertices.push(vertices[map[face.c]])
    g.faces.push(new THREE.Face3(num, num+1, num+2))
  }
  scene.remove(mesh)
  scene.remove(nm)
  nm = new THREE.Mesh(g, material)
  scene.add(nm)

}


toggle = false
function computeArap () {

  var b_index = [map[942], map[78]]
  /*
    vertex of 47
    x: 0.6578133702278137
    y: 0.7436342835426331
    z: 0
   */

  var b_positions
  if (toggle) {
    b_positions = [
      geometry.uniq[map[942]].vertex,
      new THREE.Vector3(0.8, 0.5, 0)
    ]
  } else {
    b_positions = [
      geometry.uniq[map[942]].vertex,
      new THREE.Vector3(0.6578133702278137, 0.7436342835426331, 0)
    ]
  }
  // var b_positions = [
  //   geometry.uniq[map[942]].vertex,
  //   new THREE.Vector3(0.8, 0.5, 0)
  // ]
  var size = geometry.uniq.length
  var json = {
    size: size,
    b_index: b_index,
    b_positions: b_positions
  }
  socket.emit('update-arap', json)

  toggle = !toggle

}


function createObj (geometry) {
  var json = {
    uniq: geometry.uniq,
    faces: geometry.faces,
    map: geometry.map,
    filename: 'demo.obj'
  }
  socket.emit('connection', json)
}


function redraw () {
  scene.remove(mesh)
  console.log('Start redraw')
  svgMesh = svgMesh3d(d, {
    scale: 10,
    simplify: 0.1,
    randomization: 1000,
  });
  complex = reindex(unindex(svgMesh.positions, svgMesh.cells));
  var geometry = new createGeom(complex)
  window.geometry = geometry;
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh);
}


function drawPoint (vec) {
  var sphere = new THREE.SphereGeometry(0.1, 32, 32 );
  var mesh = new THREE.Mesh(sphere, material);
  if (pos) mesh.position.set(pos.x, pos.y, pos.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  window.mesh = mesh;
}

function drawShape (points) {
  var geometry = new THREE.Geometry();
  for (var i=0; i<points.length; i++) {
    var point = points[i];
    var v = new THREE.Vector3(point.x, point.y, 0);
    geometry.vertices.push(v);
  }
  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

var heartShape = new THREE.Shape();

heartShape.moveTo( 0, 0 );
heartShape.bezierCurveTo( 25, 25, 20, 0, 0, 0 );
heartShape.bezierCurveTo( 30, 0, 30, 35,30,35 );
heartShape.bezierCurveTo( 30, 55, 10, 77, 25, 95 );
heartShape.bezierCurveTo( 60, 77, 80, 55, 80, 35 );
heartShape.bezierCurveTo( 80, 35, 80, 0, 50, 0 );
heartShape.bezierCurveTo( 35, 0, 25, 25, 25, 25 );

var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

shape = heartShape;
// var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
var geometry = new THREE.ShapeGeometry( shape);

var mesh = new THREE.Mesh( geometry, material );
  scene.add(mesh);

}

function drawSphere (rad, pos) {
  var sphere = new THREE.SphereGeometry(rad, 32, 32 );
  var mesh = new THREE.Mesh(sphere, material);
  if (pos) mesh.position.set(pos.x, pos.y, pos.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  window.mesh = mesh;
}

function drawCylinder (length, angle) {
  var cylinder = new THREE.CylinderGeometry(size*0.1, size*0.1, length, 10)
  var mesh = new THREE.Mesh(cylinder, material);
  if (angle) mesh.rotateX(angle);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

function drawBox () {
  box = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, size),
    new THREE.MeshBasicMaterial({vertexColors: THREE.FaceColors })
  );
  box.geometry.verticesNeedUpdate = true;
  box.dynamic = true;
  box.castShadow = true;
  box.receiveShadow = true;
  scene.add(box);
  objects.push(box);
  window.geometry = box.geometry
  mesh = box;
}






