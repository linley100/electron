'use strict';
import io from 'socket.io-client';

var socket = io.connect('http://localhost:3000', { 'forceNew': true });

socket.on('messages', function(data) {
	renderLogin(data);
})

function renderChat (data) {
	var html = data.map(function(elem, index) {
	return(`<div>
	          <strong>${elem.author}</strong>:
	          <em>${elem.text}</em>
	        </div>`);
	}).join(" ");

	document.getElementById('messages').innerHTML = html;
}