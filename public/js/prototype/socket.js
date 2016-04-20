var ws = null;

$(function () {
  console.log("trying to open a websocket")
  var host = "localhost"
  var port = 8080
  var url = "ws://" + host + ":" + port + "/p5websocket"

  if ('MozWebSocket' in window) ws = new MozWebSocket (url);
  else ws = new WebSocket (url);

  // When the connection is open, send some data to the server
  ws.onopen = function () {
    console.log("opened")
    ws.send('Ping'); // Send the message 'Ping' to the server
  };
  // oh, it did close
  ws.onerror = function (e) {
    console.log('WebSocket did close ',e);
  };

  // Log errors
  ws.onerror = function (error) {
    console.log('WebSocket Error ' + error);
  };
  // Log messages from the server
  ws.onmessage = function (e) {
    var data = JSON.parse(e.data)
    var x = data.point[0]
    var y = data.point[1]
    $('#log').text('Point x:' + x + ', y:' + y)
    if (window.currentVertex) {
      var index = currentVertex
      var i = b_index.indexOf(index)
      var b_positions = _.clone(b_positions_origin)
      var pos = getKinectPos(x, y)
      b_positions[i] = pos
      computeArap(b_positions)
    }
  };
})

function getKinectPos (x, y) {
  var vector = new THREE.Vector3();
  vector.set(
    ( x / 640 ) * 2 - 1,
    - ( y / 520 ) * 2 + 1,
    0.5 );
  vector.unproject( camera );
  var dir = vector.sub( camera.position ).normalize();
  var distance = - camera.position.z / dir.z;
  var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
  return pos
}

