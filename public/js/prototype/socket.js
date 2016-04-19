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
    console.log('Server: ' + e.data);
  };
})