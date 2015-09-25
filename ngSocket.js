/*
* ngSocket.js
* https://github.com/chrisenytc/ng-socket
*
* Copyright (c) 2013 Christopher EnyTC, David Prothero
* Licensed under the MIT license.
*/

// Module Copyright (c) 2013 Michael Benford
// Edited by Daniel Melchior

// Module for provide Socket.io support

define(["socket.io"], function (io) {
	"use strict";

	angular.module("ngSocket", [])
	.provider("$socket", socketProvider);
	
	function socketProvider() {
		var url;
		var token;
		
		this.setUrl = setUrl;
		this.getUrl = getUrl;
		this.setToken = setToken;
		this.$get = ["$rootScope", socketFactory];
		
		function setUrl(value) {
			url = value;
		}
		
		function getUrl() {
			return url;
		}
		
		function setToken(value) {
			token = value;
		}
		
		function socketFactory($rootScope) {
			var socket;
			
			var service = {
				checkToken: checkToken,
				addListener: addListener,
				on: addListener,
				once: addListenerOnce,
				removeListener: removeListener,
				removeAllListeners: removeAllListeners,
				emit: emit
			};
			
			return service;
			////////////////////////////////
			
			function initializeSocket(cb) {
				//Check if socket is undefined
				if (typeof socket === "undefined") {
					if (url !== "undefined") {
						socket = io.connect(url);
					} else {
						socket = io.connect();
					}

					socket.on("connect", function() {
						socket.emit("authenticate", {
							token: token
						});
						socket.on("tokenCorrect", function() {
							angularCallback(cb(true));
						});
						socket.on("tokenWrong", function() {
							angularCallback(cb(false));
						});
					});
				}
			}
			
			function checkToken(cb) {
				initializeSocket(cb);
			}
			
			function angularCallback(callback) {
				return function () {
					if (callback) {
						var args = arguments;
						$rootScope.$apply(function () {
							callback.apply(socket, args);
						});
					}
				};
			}
			
			function addListener(name, scope, callback) {
				initializeSocket();
				
				if (arguments.length === 2) {
					scope = null;
					callback = arguments[1];
				}
				
				socket.on(name, angularCallback(callback));
			
				if (scope !== null) {
					scope.$on("$destroy", function () {
						removeListener(name, callback);
					});
				}
			}
			
			function addListenerOnce(name, callback) {
				initializeSocket();
				socket.once(name, angularCallback(callback));
			}
			
			function removeListener(name, callback) {
				initializeSocket();
				socket.removeListener(name, angularCallback(callback));
			}
			
			function removeAllListeners(name) {
				initializeSocket();
				socket.removeAllListeners(name);
			}
			
			function emit(name, data, callback) {
				initializeSocket();
				socket.emit(name, data, angularCallback(callback));
			}
		}
	}
});
