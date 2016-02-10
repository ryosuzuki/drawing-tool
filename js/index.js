
paper.install(window);

var path;
var start;
var end;
var line;

var pathStyle = {
  strokeColor: 'black',
  strokeWidth: 5,
  fullySelected: false
}

window.onload = function () {
  paper.setup('canvas');

  tool = new Tool();
  tool.onMouseDown = function (event) {
    if (path) {
      path.selected = false;
    }
    path = new Path(pathStyle);
    path.segments = [event.point];
    start = event.point;
  }

  tool.onMouseDrag = function (event) {
    path.add(event.point);
  }

  tool.onMouseUp = function(event) {
    var segmentCount = path.segments.length;
    path.simplify(10);
    var newSegmentCount = path.segments.length;
    var difference = segmentCount - newSegmentCount;
    var percentage = 100 - Math.round(newSegmentCount / segmentCount * 100);

    end = event.point;
    path.remove();

    var line = new Path(pathStyle);
    line.add(new Point(start.x, start.y));
    line.add(new Point(end.x, end.y));

  }

}


