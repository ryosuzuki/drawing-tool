var path;

var textItem = new PointText({
  content: 'Click and drag to draw a line.',
  point: new Point(20, 30),
  fillColor: 'black',
});

function onMouseDown(event) {
  if (path) {
    path.selected = false;
  }

  path = new Path({
    segments: [event.point],
    strokeColor: 'black',
    strokeWidth: 5,
    // fullySelected: true
  });
}


function onMouseDrag(event) {
  path.add(event.point);
  textItem.content = 'Segment count: ' + path.segments.length;
}

function onMouseUp(event) {
  var segmentCount = path.segments.length;
  path.simplify(10);
  // path.fullySelected = true;
  var newSegmentCount = path.segments.length;
  var difference = segmentCount - newSegmentCount;
  var percentage = 100 - Math.round(newSegmentCount / segmentCount * 100);
  textItem.content = difference + ' of the ' + segmentCount + ' segments were removed. Saving ' + percentage + '%';

}
