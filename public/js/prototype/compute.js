function computeSkeleton () {
  var map = geometry.map;

  total = []
  external = []
  internal = []
  for (var i=0; i<geometry.faces.length; i++) {
    var face = geometry.faces[i];
    var v = [map[face.a], map[face.b], map[face.c]].sort()

    var e0 = v[0] + '-' + v[1]
    var e1 = v[0] + '-' + v[2]
    var e2 = v[1] + '-' + v[2]
    total.push(e0)
    total.push(e1)
    total.push(e2)
    if (!external.includes(e0)) {
      external.push(e0)
    } else {
      var index = external.indexOf(e0)
      external.splice(index, 1)
      internal.push(e0)
    }

    if (!external.includes(e1)) {
      external.push(e1)
    } else {
      var index = external.indexOf(e1)
      external.splice(index, 1)
      internal.push(e1)
    }

    if (!external.includes(e2)) {
      external.push(e2)
    } else {
      var index = external.indexOf(e2)
      external.splice(index, 1)
      internal.push(e2)
    }
  }
  lines = []
  for (var i=0; i<geometry.faces.length; i++) {
    var points = new THREE.Geometry();

    var face = geometry.faces[i];
    var v = [map[face.a], map[face.b], map[face.c]].sort()
    var e0 = v[0] + '-' + v[1]
    var e1 = v[0] + '-' + v[2]
    var e2 = v[1] + '-' + v[2]

    var vec = new THREE.Vector3();
    var count = 0;
    if (internal.includes(e0)) {
      var a = uniq[v[0]].vertex
      var b = uniq[v[1]].vertex
      var ab = vec.clone().addVectors(a, b).multiplyScalar(1/2);
      points.vertices.push(ab)
      count++
    }
    if (internal.includes(e1)) {
      var a = uniq[v[0]].vertex
      var c = uniq[v[2]].vertex
      var ac = vec.clone().addVectors(a, c).multiplyScalar(1/2);
      points.vertices.push(ac)
      count++
    }
    if (internal.includes(e2)) {
      var b = uniq[v[1]].vertex
      var c = uniq[v[2]].vertex
      var bc = vec.clone().addVectors(b, c).multiplyScalar(1/2);
      points.vertices.push(bc)
      count++
    }

    if (points.vertices.length >= 2) {
      var mat = new THREE.PointsMaterial( {
        size: 0.5,
        // transparent: true,
        // opacity: 0.7,
        color: 0x00ffff
      } );
      var line = new THREE.Line(points, mat)
      scene.add(line)
      lines.push(line)
    }
  }


}

function computeLaplacian () {
  console.log('Start computeLaplacian')
  var map = geometry.map;
  var positions = geometry.uniq.map( function (u) {
    var v = u.vertex;
    return [v.x, v.y, v.z];
  })
  var cells = geometry.faces.map( function (face) {
    return [map[face.a], map[face.b], map[face.c]]
  })
  list = meshLaplacian(cells, positions);
  laplacian = csrMatrix.fromList(list)
  laplacian = laplacian.toDense()
  geometry.laplacian = laplacian
  return geometry
}
