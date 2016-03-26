

var fs = require('fs')
var path = require('path')
var http = require('http')
var route = require('koa-route')
var views = require('co-views')
var favicon = require('koa-favicon')
var serve = require('koa-static')
var parser = require('koa-bodyparser')
var co = require('co')
var Q = require('q')
var koa = require('koa.io')

var app = koa();
var server = http.createServer(app.callback());
var port = process.env.PORT || 3000;



app.use(serve('.'));
app.use(favicon('/assets/favicon.ico'));
app.use(parser({
  strict: false,
  jsonLimit: '500mb'
}));
app.use( function *(next) {
  this.render = views('views', {
    map: { html: 'swig' },
  });
  yield next;
});
app.use(route.get('/', index));
app.use(route.get('/:id', show));

app.io.route('connection', function *(next, json) {
  console.log('connected')
  var uniq = json.uniq
  var faces = json.faces
  var map = json.map
  var str = '';
  for (var i=0; i<uniq.length; i++) {
    str += 'v ' +
    uniq[i].vertex.x + ' ' +
    uniq[i].vertex.y + ' ' +
    uniq[i].vertex.z + '\n';
  }
  for (var i=0; i<faces.length; i++) {
    str += 'f ' +
    (map[faces[i].a] + 1) + ' ' +
    (map[faces[i].b] + 1) + ' ' +
    (map[faces[i].c] + 1) + '\n'
  }
  console.log('create obj file')
  fs.writeFileSync('data/demo.obj', str, 'utf8')
})



function *index () {
  this.body = yield this.render('index');
}
function *show (id) {
  this.body = yield this.render(id);
}


app.listen(port);

module.exports = app;
