
function onDocumentMouseDown( event ) {
  var intersects = getIntersects(event);
  if (intersects.length <= 0) return false;
  window.current = intersects[0];
  window.currentIndex = current.faceIndex;
}

function onDocumentMouseUp (event) {
  var intersects = getIntersects(event);
  if (intersects.length <= 0) return false;
}

function onDocumentMouseClick (event) {
  var intersects = getIntersects(event);
  if (intersects.length <= 0) return false;
  console.log('click')
  console.log(current.face)
  if (!window.currentVertex) {
    window.currentVertex = addSelect(current)
  } else {
    window.currentVertex = undefined
  }

}

var b_index = []
var b_positions_origin = []
function addSelect(current) {
  var a = geometry.vertices[current.face.a]
  var b = geometry.vertices[current.face.b]
  var c = geometry.vertices[current.face.c]
  var point = current.point

  var dis_a = point.distanceTo(a)
  var dis_b = point.distanceTo(b)
  var dis_c = point.distanceTo(c)
  var dis = [dis_a, dis_b, dis_c]

  var vi
  if (_.min(dis) == dis_a) vi = current.face.a
  if (_.min(dis) == dis_b) vi = current.face.b
  if (_.min(dis) == dis_c) vi = current.face.c
  var index = geometry.map[vi]
  var pos = geometry.vertices[vi]

  if (!b_index.includes(index)) {
    b_index.push(index)
    b_positions_origin.push(pos)
    showPoints(b_positions_origin)
    return undefined
  } else {
    return index
  }
}

var current_points = []
function showPoints (positions) {
  for (var i=0; i<current_points.length; i++) {
    var sphere = current_points[i]
    scene.remove(sphere)
  }

  var sphereGeometry = new THREE.SphereGeometry(0.01*size, 32, 32 );
  var sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xf5555, shading: THREE.FlatShading } );
  for (var i= 0; i<positions.length; i++) {
    var pos = positions[i]
    var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    sphere.position.set(pos.x, pos.y, pos.z)
    scene.add(sphere);
    current_points.push(sphere)
  }
}



function onDocumentMouseMove (event) {
  var intersects = getIntersects(event);
  // if (intersects.length <= 0) return false
  // window.current = intersects[0];
  if (window.currentVertex) {
    var index = currentVertex
    var i = b_index.indexOf(index)
    var b_positions = _.clone(b_positions_origin)
    var pos = getCurrentPos(event)
    b_positions[i] = pos
    computeArap(b_positions)
  }
}

function getCurrentPos (event) {
  var vector = new THREE.Vector3();
  vector.set(
    ( event.clientX / window.innerWidth ) * 2 - 1,
    - ( event.clientY / window.innerHeight ) * 2 + 1,
    0.5 );
  vector.unproject( camera );
  var dir = vector.sub( camera.position ).normalize();
  var distance = - camera.position.z / dir.z;
  var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
  return pos
}

function getIntersects (event) {
  event.preventDefault();
  mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObjects(objects);
  return intersects
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentTouchStart( event ) {
  event.preventDefault();
  event.clientX = event.touches[0].clientX;
  event.clientY = event.touches[0].clientY;
  onDocumentMouseDown( event );
}

