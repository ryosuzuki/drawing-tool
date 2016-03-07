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

function computeUniq () {
  console.log('Start computeUniq')
  var vertices = geometry.vertices;
  var map = new Array(vertices.length);
  var uniq = [];
  var epsilon = Math.pow(10, -6);
  for (var i=0; i<vertices.length; i++) {
    var vertex = vertices[i];
    var bool = true;
    var index;
    for (var j=0; j<uniq.length; j++) {
      var e = uniq[j];
      if (
        Math.abs(vertex.x - e.vertex.x) < epsilon
        && Math.abs(vertex.y - e.vertex.y) < epsilon
        && Math.abs(vertex.z - e.vertex.z) < epsilon
        // vertex.equals(e.vertex)
      ) {
        bool = false;
        e.index.push(i);
        map[i] = j;
        break;
      }
    }
    if (bool) {
      uniq.push({ index: [i], vertex: vertex, id: uniq.length });
      map[i] = uniq.length-1;
    }
  }
  var faces = geometry.faces;
  var edges = new Array(uniq.length);
  var sides = new Array(uniq.length);
  for (var j=0; j<uniq.length; j++) {
    edges[j] = [];
    sides[j] = [];
  }
  for (var i=0; i<faces.length; i++) {
    var face = faces[i];
    var a = map[face.a];
    var b = map[face.b];
    var c = map[face.c];

    edges[a].push(a)
    edges[a].push(b)
    edges[a].push(c)
    edges[a] = _.uniq(edges[a])
    sides[a].push(i);
    uniq[a].edges = edges[a];

    edges[b].push(b)
    edges[b].push(a)
    edges[b].push(c)
    edges[b] = _.uniq(edges[b])
    uniq[b].edges = edges[b];

    edges[c].push(c)
    edges[c].push(a)
    edges[c].push(b)
    edges[c] = _.uniq(edges[c]);
    uniq[c].edges = edges[c];

    if (!uniq[a].faces) uniq[a].faces = [];
    if (!uniq[b].faces) uniq[b].faces = [];
    if (!uniq[c].faces) uniq[c].faces = [];
    uniq[a].faces.push(i);
    uniq[b].faces.push(i);
    uniq[c].faces.push(i);
    uniq[a].faces = _.uniq(uniq[a].faces);
    uniq[b].faces = _.uniq(uniq[b].faces);
    uniq[c].faces = _.uniq(uniq[c].faces);
  }
  geometry.uniq = uniq;
  geometry.map = map;
  geometry.edges = edges;

  window.uniq = uniq;
  window.map = map;
  window.edges = edges;
  window.faces = geometry.faces;

  console.log('Finish computeUniq')
  return geometry;
}