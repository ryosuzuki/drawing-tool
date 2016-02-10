
paper.install(window);

var start;
var end;
var lines = [];
var points = [];

var pathStyle = {
  strokeColor: 'black',
  strokeWidth: 5,
  fullySelected: false
}

window.onload = function () {
  paper.setup('canvas');

  var path;
  var tool = new Tool();
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
    points = [];
    if (!lines.length) {
      line.add(new Point(start.x, start.y));
      line.add(new Point(end.x, end.y));
    } else {
      var sp;
      var ep;
      var smin = Math.pow(10, 10);
      var emin = Math.pow(10, 10);
      var si;
      var ei;
      for (var i=0; i<lines.length; i++) {
        var m = [distance(start, lines[i].start), distance(start, lines[i].end)];
        if (_.min(m) < 30 && _.min(m) < smin) {
          si = { i: i, t: m.indexOf(_.min(m)) == 0 ? 'start' : 'end' }
        }
        var m = [distance(end, lines[i].start), distance(end, lines[i].end)];
        if (_.min(m) < 30 && _.min(m) < emin) {
          ei = { i: i, t: m.indexOf(_.min(m)) == 0 ? 'start' : 'end' }
        }
      }
      console.log(si);
      line.add(si ? lines[si.i][si.t] : new Point(start.x, start.y));
      line.add(ei ? lines[ei.i][ei.t] : new Point(end.x, end.y));
    }
    console.log(points);
    lines.push({
      start: _.first(line.segments).point,
      end:   _.last(line.segments).point,
    });

    // var line = new Path(pathStyle);
    // if (!points.length) {
    //   line.add(new Point(start.x, start.y));
    //   line.add(new Point(end.x, end.y));
    // } else {
    //   var min = _.min(points);
    //   var index = points.indexOf(min);

    //   var i = Math.floor(index/4);
    //   var p = (index%2 == 0) ? 'start' : 'end';
    //   if (index%4 < 2) {
    //     line.add(lines[i][p]);
    //     line.add(end);
    //   } else {
    //     line.add(start);
    //     line.add(lines[i][p]);
    //   }
    //   // 0 -> start - lines[0].start
    //   // 1 -> start - lines[0].end
    //   // 2 -> end   - lines[0].start
    //   // 3 -> end   - lines[0].end
    //   // 4 -> start - lines[1].start
    //   // 5 -> start - lines[1].end
    //   // 6 -> end   - lines[1].start
    //   // 7 -> end   - lines[1].end
    //   // ...

    // }

  }

}

function distance (p1, p2) {
  return Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y));
}













