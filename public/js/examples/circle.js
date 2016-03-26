
paper.install(window);

var start;
var end;
var lines = [];
var points = [];
var paths = [];
var draft;
var pathStyle = {
  strokeColor: 'black',
  strokeWidth: 5,
  fullySelected: true
}


window.onload = function () {
  paper.setup('canvas');

  console.log('hoge')

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

  tool.onMouseUp = function(event) {
    var segmentCount = draft.segments.length;
    draft.simplify(1);
    var newSegmentCount = draft.segments.length;
    var difference = segmentCount - newSegmentCount;
    var percentage = 100 - Math.round(newSegmentCount / segmentCount * 100);

    end = event.point;

    draft.remove();
    var num = draft.segments.length;
    var total = 0;
    for (var i=0; i<num-2; i++) {
      var a = draft.segments[i];
      var b = draft.segments[(i+1)%num];
      var c = draft.segments[(i+2)%num];
      pv = a.point.subtract(b.point);
      nv = b.point.subtract(c.point);
      var angle = pv.getAngleInRadians(nv);
      total += angle;
    }
    console.log(total);

    if (total < 1) {
      var from = new Point(draft.segments[0].point);
      var to = new Point(draft.segments[num-1].point);
      var path = new Path.Line(from, to);
      path.style = pathStyle;
    } else if (total < 5) {
      var from = new Point(draft.segments[0].point);
      var to = new Point(draft.segments[num-1].point);
      var through = new Point(draft.segments[Math.floor(num/2)].point);
      var path = new Path.Arc(from, through, to);
      path.style = pathStyle;
    } else {
      var x = draft.segments.map(function (seg) {
        return seg.point.x;
      })
      var y = draft.segments.map(function (seg) {
        return seg.point.y;
      });
      var rectangle = new Rectangle(
        new Point(_.min(x), _.min(y)),
        new Point(_.max(x), _.max(y))
      );
      var path = new Path.Ellipse(rectangle);
      path.style = pathStyle;
    }
  }

}

Mousetrap.bind('command+z', function() {
  undo();
});

function undo () {
  _.last(paths).remove();
  paths.pop()
}

function dot (v1, v2) {
  return v1.x*v2.x + v1.y+v2.y;
}

function distance (p1, p2) {
  return Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y));
}
