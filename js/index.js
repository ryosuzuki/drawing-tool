paper.install(window);
// Keep global references to both tools, so the HTML
// links below can access them.
var lineTool, cloudTool, selected = 'lineTool', User = {}, userId = '';

window.onload = function() {
  paper.setup('draw');

  var group = new Group();
  pathStyle = {
    strokeColor: '#63d4ff',
    strokeWidth: 5
  };

  var points = [];
  var path;
  var onMouseDown = function(event) {
    path = new Path();
    path.style = pathStyle;

    path.add(event.point);
    group.addChild(path);
    points.push(event.point.x +'|'+ event.point.y);
  };

  var onMouseUp = function(event) {
    path.simplify(10);
    points.push(event.point.x +'|'+ event.point.y);
    points.length = 0;
  };

  lineTool = new Tool();
  lineTool.onMouseDown  = onMouseDown;
  lineTool.onMouseUp    = onMouseUp;

  lineTool.onMouseDrag = function(event) {
    if(typeof path == 'undefined'){
      path = new Path();
    }
    path.add(event.point);
    points.push(event.point.x +'|'+ event.point.y);
  };


}