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
var wand = null;

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

// Set the serial port
const port = new SerialPort('/dev/cu.usbserial-14140', {
    baudRate: 115200
});

// Read from the serial port and parse it into wand
port.on('readable', function(){
    let lineStream = port.read();
    lineStream = lineStream.toString();
    lineStream = JSON.parse(lineStream);
    wand = {};
    wand.x = lineStream[0];
    wand.y = lineStream[1];
    wand.z = lineStream[2];
    wand.b1 = lineStream[3];
    wand.b2 = lineStream[4];
})

const clearWand = () => {
    wand = null;
}

io.on('connection', function(socket){
    socket.on('new player', function(){
        console.log('New Player: ', socket.id);
    });
});

const run = () => {
    if(wand){
        io.emit('wand', wand);
        console.log(wand);
        clearWand();
    }
}

setInterval(function(){
    run();
}, 1000/120);