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
  color: 0xeeeeee
  // wireframe: true
})

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






