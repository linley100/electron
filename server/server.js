const express = require('express');
const app = express();
// may need to change config to config.prod later on
const config = require('../webpack.config');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

// hands this compiler off to the middleware for hot reloading
const compiler = webpack(config);

const fs = require('fs');

app.use(webpackDevMiddleware(compiler, {
	noInfo: true,
	// public path simulates publicPath of config file
	publicPath: config.output.publicPath
}));
app.use(webpackHotMiddleware(compiler));

app.use(express.static('./dist'));

const PORT = process.env.port || 3000;
const server = app.listen(PORT);
const io = require('socket.io').listen(server);

var messages = [];

io.on('connection', function(socket) {
	let obj = fs.readFileSync('chatG.json', 'utf-8');
    messages = JSON.parse(obj);

	console.log('Alguien se ha conectado con Sockets');
	socket.emit('messages', messages);

	socket.on('new-message', function(data) {
		messages.push(data);

		fs.writeFile('chatG.json', JSON.stringify(messages,null,' '), function (err) {
	      	if (err) throw err;
		});

		io.sockets.emit('messages', messages);
  	});
});


console.log("Polling server is running at 'http://localhost:3000'");
