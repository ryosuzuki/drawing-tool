var smoother = new Smoother([0.9995, 0.9995], [0, 0], 0)
var canvas = document.getElementById('canvas-video')
var context = canvas.getContext('2d')
var video = document.createElement('video')
var detector

var fist_pos_old
var angle = [0, 0]


window.onload = function () {
try {
  compatibility.getUserMedia({video: true}, function(stream) {
    try {
      video.src = compatibility.URL.createObjectURL(stream);
    } catch (error) {
      video.src = stream;
    }
    compatibility.requestAnimationFrame(play);
  }, function (error) {
    alert("WebRTC not available");
  });
} catch (error) {
  alert(error);
}

function hogeArap (dx, dy) {
  if (dx*dx + dy*dy > 0.2) return false

  console.log(fist_pos_old[0]/video.videoWidth)
  var pos = [fist_pos_old[0]/video.videoWidth, fist_pos_old[1]/video.videoHeight]
  var b_index = [map[942], map[78]]
  /*
    vertex of 47
    x: 0.6578133702278137
    y: 0.7436342835426331
    z: 0
   */



  var b_positions
  b_positions = [
    geometry.uniq[map[942]].vertex,
    new THREE.Vector3(pos[0], 0.5, 0)
  ]

  /*
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
  */
  var size = geometry.uniq.length
  var json = {
    size: size,
    b_index: b_index,
    b_positions: b_positions
  }
  socket.emit('update-arap', json)
  running = true
  toggle = !toggle
}


function play() {
  compatibility.requestAnimationFrame(play);
  if (video.paused) video.play();

  canvas.width = ~~(100 * video.videoWidth / video.videoHeight);
  canvas.height = 100;
  context.drawImage(video, 0, 0, canvas.clientWidth, canvas.clientHeight)

  if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {

    if (!detector) {
      var width = ~~(140 * video.videoWidth / video.videoHeight);
      var height = 140;
      detector = new objectdetect.detector(width, height, 1.1, objectdetect.handfist);
    }

    angle = smoother.smooth(angle);
    document.getElementById('transform_a').setAttribute('rotation', '0 1 0 ' + angle[0]);
    document.getElementById('transform_b').setAttribute('rotation', '1 0 0 ' + angle[1]);

    var coords = detector.detect(video, 1);

    if (coords[0]) {
      var coord = coords[0];

      coord[0] *= video.videoWidth / detector.canvas.width;
      coord[1] *= video.videoHeight / detector.canvas.height;
      coord[2] *= video.videoWidth / detector.canvas.width;
      coord[3] *= video.videoHeight / detector.canvas.height;

      var fist_pos = [coord[0] + coord[2] / 2, coord[1] + coord[3] / 2];
      if (fist_pos_old) {
        var dx = (fist_pos[0] - fist_pos_old[0]) / video.videoWidth,
        dy = (fist_pos[1] - fist_pos_old[1]) / video.videoHeight;

        if (dx*dx + dy*dy < 0.2) {
          angle[0] += 5.0 * dx;
          angle[1] += 5.0 * dy;

        }
        fist_pos_old = fist_pos;
        if (Math.abs(dy) > 0.15) {
          computeArap()
        }

      } else if (coord[4] > 2) {
        fist_pos_old = fist_pos;
      }

      context.beginPath();
      context.lineWidth = '2';
      context.fillStyle = fist_pos_old ? 'rgba(0, 255, 255, 0.5)' : 'rgba(255, 0, 0, 0.5)';
      context.fillRect(
        coord[0] / video.videoWidth * canvas.clientWidth,
        coord[1] / video.videoHeight * canvas.clientHeight,
        coord[2] / video.videoWidth * canvas.clientWidth,
        coord[3] / video.videoHeight * canvas.clientHeight);
      context.stroke();
    } else fist_pos_old = null;
  }
}
}