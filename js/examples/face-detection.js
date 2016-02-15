
paper.install(window);

var start;
var end;
var lines = [];
var points = [];
var paths = [];

var pathStyle = {
  strokeColor: 'black',
  strokeWidth: 5,
  fullySelected: false
}

var vid = document.getElementById('videoel');
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');

var ctrack = new clm.tracker({useWebGL : true});
ctrack.init(pModel);
var origin;


window.onload = function () {
  paper.setup('canvas');

  var draft;
  var tool = new Tool();
  tool.onMouseDown = function (event) {
    if (draft) {
      draft.selected = false;
    }
    draft = new Path(pathStyle);
    draft.segments = [event.point];
    start = event.point;
  }

  tool.onMouseDrag = function (event) {
    draft.add(event.point);
  }

  tool.onMouseUp = function (event) {
    var segmentCount = draft.segments.length;
    draft.simplify(10);
    var newSegmentCount = draft.segments.length;
    var difference = segmentCount - newSegmentCount;
    var percentage = 100 - Math.round(newSegmentCount / segmentCount * 100);

    end = event.point;
    draft.remove();

    var path = new Path(pathStyle);
    points = [];
    path.add(new Point(start.x, start.y));
    path.add(new Point(end.x, end.y));
    paths.push(path);
  }

  view.onFrame = function (event) {
    var pos = ctrack.getCurrentPosition();
    if (paths[0] && origin && pos) {
      paths[0].segments[0].point.y = start.y + pos[19][1] - origin[19][1];
      paths[0].segments[1].point.y = end.y + pos[22][1] - origin[22][1];
    }
    if (paths[1] && origin && pos) {
      paths[1].segments[0].point.y = start.y + pos[18][1] - origin[18][1];
      paths[1].segments[1].point.y = end.y + pos[15][1] - origin[15][1];
    }

  }
  paper.view.draw();
}



function enablestart() {
  var startbutton = document.getElementById('startbutton');
  startbutton.value = "start";
  startbutton.disabled = null;
}

var insertAltVideo = function(video) {
  if (supports_video()) {
    if (supports_ogg_theora_video()) {
      video.src = "./media/cap12_edit.ogv";
    } else if (supports_h264_baseline_video()) {
      video.src = "./media/cap12_edit.mp4";
    } else {
      return false;
    }
    //video.play();
    return true;
  } else return false;
}
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
// check for camerasupport
if (navigator.getUserMedia) {
  // set up stream

  var videoSelector = {video : true};
  if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
    var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
    if (chromeVersion < 20) {
      videoSelector = "video";
    }
  };

  navigator.getUserMedia(videoSelector, function( stream ) {
    if (vid.mozCaptureStream) {
      vid.mozSrcObject = stream;
    } else {
      vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
    }
    vid.play();
  }, function() {
    insertAltVideo(vid);
    document.getElementById('gum').className = "hide";
    document.getElementById('nogum').className = "nohide";
    alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
  });
} else {
  insertAltVideo(vid);
  document.getElementById('gum').className = "hide";
  document.getElementById('nogum').className = "nohide";
  alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
}
vid.addEventListener('canplay', enablestart, false);

function startVideo() {
  // start video
  vid.play();
  // start tracking
  ctrack.start(vid);
  // start loop to draw face
  drawLoop();

  analysis();
}

function drawLoop() {
  requestAnimationFrame(drawLoop);
  overlayCC.clearRect(0, 0, 400, 300);
  //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
  if (ctrack.getCurrentPosition()) {
    if (!origin) origin = ctrack.getCurrentPosition();
    ctrack.draw(overlay);

  }
}

// update stats on every iteration
document.addEventListener('clmtrackrIteration', function(event) {
  // stats.update();
}, false);
