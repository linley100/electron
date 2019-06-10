'use strict';
import io from 'socket.io-client';

var socket = io.connect('http://localhost:3000', { 'forceNew': true });

socket.on('messages', function(data) {
  console.log(data);
  render(data);
})

function addMessage(e) {
	console.log("AAAAAAA");

	var message = {
		author: document.getElementById('username').value,
		text: document.getElementById('texto').value
	};

	socket.emit('new-message', message);
	
	return false;
}

function render (data) {
	var html = data.map(function(elem, index) {
	return(`<div>
	          <strong>${elem.author}</strong>:
	          <em>${elem.text}</em>
	        </div>`);
	}).join(" ");

	document.getElementById('messages').innerHTML = html;
}
