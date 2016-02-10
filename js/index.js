
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

  tool.onMouseUp = function(event) {
    var segmentCount = draft.segments.length;
    draft.simplify(10);
    var newSegmentCount = draft.segments.length;
    var difference = segmentCount - newSegmentCount;
    var percentage = 100 - Math.round(newSegmentCount / segmentCount * 100);

    end = event.point;
    draft.remove();

    var path = new Path(pathStyle);
    points = [];
    if (!lines.length) {
      path.add(new Point(start.x, start.y));
      path.add(new Point(end.x, end.y));
    } else {
      var smin = Math.pow(10, 10);
      var emin = Math.pow(10, 10);
      var si;
      var ei;
      var sn;
      var en;
      for (var i=0; i<lines.length; i++) {
        var m = [distance(start, lines[i].start), distance(start, lines[i].end)];
        if (_.min(m) < 30 && _.min(m) < smin) {
          si = { i: i, t: m.indexOf(_.min(m)) == 0 ? 'start' : 'end' };
          sn = new Victor(lines[i].end.x-lines[i].start.x, lines[i].end.y-lines[i].start.y).normalize();
        }
        var m = [distance(end, lines[i].start), distance(end, lines[i].end)];
        if (_.min(m) < 30 && _.min(m) < emin) {
          ei = { i: i, t: m.indexOf(_.min(m)) == 0 ? 'start' : 'end' };
          en = new Victor(lines[i].end.x-lines[i].start.x, lines[i].end.y-lines[i].start.y).normalize();
        }
      }
      console.log(si);
      var sp = si ? lines[si.i][si.t] : new Point(start.x, start.y);
      var ep = ei ? lines[ei.i][ei.t] : new Point(end.x, end.y);
      var vec = new Victor(ep.x-sp.x, ep.y-sp.y);
      var normal = vec.clone().normalize();
      if (sn) {
        var dot = normal.dot(sn);
        console.log(dot);
        if (dot < 0.1 && dot > -0.1) {
          var d = sn.rotate(Math.PI/2).multiplyScalar(vec.length());
          d = d.dot(normal) >= 0 ? d : d.multiplyScalar(-1);
          var p = new Victor(sp.x, sp.y).add(d);
          ep = new Point(p.x, p.y);
        }
      }
      if (en) {
        var dot = normal.dot(en);
        console.log(dot);
        if (dot < 0.1 && dot > -0.1) {
          var d = en.rotate(Math.PI/2).multiplyScalar(vec.length());
          d = d.dot(normal) < 0 ? d : d.multiplyScalar(-1);
          var p = new Victor(ep.x, ep.y).add(d);
          sp = new Point(p.x, p.y);
        }
      }
      path.add(sp);
      path.add(ep);
    }
    console.log(points);
    paths.push(path);
    lines.push({
      start: _.first(path.segments).point,
      end:   _.last(path.segments).point,
    });
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













