
var fs = require('fs');
var path = require('path');
var http = require('http');
var route = require('koa-route');
var views = require('co-views');
var serve = require('koa-static');
var favicon = require('koa-favicon');
var parser = require('koa-bodyparser');
var koa = require('koa');

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

function *index () {
  this.body = yield this.render('index');
}
function *show (id) {
  this.body = yield this.render(id);
}


app.listen(port);

module.exports = app;
