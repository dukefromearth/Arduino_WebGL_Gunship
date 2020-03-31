// Dependencies.
/*jshint esversion: 6 *///
import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';
import SerialPort from 'serialport';

const __dirname = path.resolve(path.dirname(''));
const environment = process.env.ENV || "prod";
var num_users = 0;
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const port_num = 5000;

app.set('port', port_num);
app.use('/', express.static('./'));

// Routing
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, '/index.html'));
});

server.listen(port_num, function () {
    console.log(`Running as ${environment} environment`);
    console.log('Starting server on port', port_num);
});

io.on('connection', function (socket) {
    num_users++;
    socket.on('new player', function () {
        console.log("new player");
    });
});

//Set the serial port where your arduino is
const port = new SerialPort('/dev/cu.usbserial-143210', {
    baudRate: 115200
});

var wand = {
    x: 0,
    y: 0,
    z: 0,
    b1: 1,
    b2: 1
}

//Read from the serial port and parse into notes
port.on('readable', function () {
    let lineStream = port.read();
    lineStream = lineStream.toString();
    lineStream = JSON.parse(lineStream);
    wand = {};
    wand.x = lineStream[0];
    wand.y = lineStream[1];
    wand.z = lineStream[2];
    wand.b1 = lineStream[3];
    wand.b2 = lineStream[4];
});

//Clears all the notes from our note object
const clearWand = () => {
    wand = null;
}

//If a note note is hit, send the notes through the websocket.
const run = () => {
    if (wand) {
        io.emit('wand', wand);
        console.log(wand);
        clearWand();
    }
}

setInterval(function () {
    run();
}, 1000 / 120);