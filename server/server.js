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
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

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
const { Blockchain, Transaction } = require('./blockchain/blockchain');
var messages = [];

io.on('connection', function(socket) {
	let obj = fs.readFileSync('chatG.json', 'utf-8');
    messages = JSON.parse(obj);

	console.log('Alguien se ha conectado con Sockets');
	//socket.emit('messages', messages);

	socket.on('new-message', function(data) {
		messages.push(data);

		fs.writeFile('chatG.json', JSON.stringify(messages,null,' '), function (err) {
	      	if (err) throw err;
		});

		io.sockets.emit('messages', messages);
	  });
	  
	socket.on('blockchain', function(data) {
		let chain = new Blockchain();
		let bool = new Boolean();
		console.log("AAAAAAAAAAAAAA");
		console.log(data.usuario);
		if( (chain.compararUsuario(data.usuario)) ) {	
			bool = true;
			io.sockets.emit('inicio', bool);
		}else{
			bool = false;
			io.sockets.emit('inicio', bool);
		}	
  	});

	socket.on('registrar', function(data) {
		let chain = new Blockchain();
		let bool = new Boolean();
		if( chain.compararUsuario(data.usuario) ) {	
			bool = true;
			io.sockets.emit('registro', bool);
			console.log("Existe");
		}else{
			let myKey = ec.keyFromPrivate('7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf');
			let myWalletAddress = myKey.getPublic('hex');
			
			let tx1 = new Transaction(data.usuario, data.contra, myWalletAddress);
			tx1.signTransaction(myKey);
			chain.addTransaction(tx1);
			chain.minePendingTransactions(data.usuario);

			chain.escribirArchivo();

			bool = false;
			io.sockets.emit('registro', bool);
			console.log("No existe");
		}	
  	});

});


console.log("Polling server is running at 'http://localhost:3000'");
