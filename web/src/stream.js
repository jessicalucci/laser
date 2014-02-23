var Worker = require('./worker.js');

/**
 * Stream constructor.
 *
 * @param {io} io from socket.io
 * @api public
 */

function Stream (io, jobs) {
	var _worker;
	var _io = io;
	var _jobs = jobs;
	var _arduinoSocket;
	var _testSocket;
	setupIO();
	setupWorker();

	/**
	 * Creates a worker.
	 *
	 * @api private
	 */

	function setupWorker () {
		_worker = new Worker(_jobs);
		_worker.start();
	};

	/**
	 * Listens for connections on io.
	 *
	 * @api private
	 */

	function setupIO () {
		_io.sockets.on('connection', function (socket) {
			console.log('socket connection made');
			_worker.addClient(socket);

			(function (socket) {

				socket.on('arduino', function (data) {
					_arduinoSocket = socket;
				});

				socket.on('TEST', function (data) {
					_testSocket = socket;
				});

				//TODO(jessica) : pass in donation amount for priority
				socket.on('requestControl', function (data) {
					console.log('creating new control job');
					_worker.addJob(socket.id, data.donationAmount);
				});

				socket.on('left', function (data) {
					console.log('left');
					_arduinoSocket.emit('arduinoLeft');
					_testSocket.emit('testLeft');
				});

				socket.on('right', function (data) {
					console.log('right');
					_arduinoSocket('arduinoRight');
				});

				socket.on('up', function (data) {
					console.log('up');
					_arduinoSocket.emit('arduinoUp');
				});

				socket.on('down', function (data) {
					console.log('down');
					_arduinoSocket.emit('arduinoDown');
				});

				socket.on('disconnect', function () {
					console.log('socket disconnected');
					_worker.updateHash(socket.id);
				});


			})(socket);
			
		});
	};
}

/**
 * Export the constructor.
 */

module.exports = Stream;
