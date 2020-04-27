// FRONTEND



//TODO: Setup Socket
// Create a socket object; 
// Emit new player; 
// Add socket event for when we receive wand input;
//Update our wand object

const socket = io();
socket.emit('new player');

//Triggers when we recieve a new hit from the server
socket.on('wand', function (wand_from_server) {
    wand = wand_from_server;
});

//TODO: Get wand position (Near position = mouse)
// Is there a wand.x and wand.y
// Our x and y are different on the arduino than than threejs, so swap them. 
// Test if the new position is off screen in x direction
// Test if the new position is off screen in y direction
// Test if there is a button click

if (wand.y && wand.x) {
    if (position.x + wand.y > -deviceInfo.screenCenterX() && position.x + wand.y < deviceInfo.screenCenterX()) {
        position.x += Math.floor(wand.y / 2);
    }
    if (position.y + wand.x > -deviceInfo.screenCenterY() && position.y + wand.x < deviceInfo.screenCenterY()) {
        position.y += Math.floor(wand.x);
    }
    if (!wand.b1 && Date.now() - timeAtLastShot > 200) {
        gunShip.onClick();
        timeAtLastShot = Date.now();
    }
} else {
    position = mouse;
}



// BACKEND

//Create a wand object
var wand = {
    x: null,
    y: null,
    z: null,
    b1: 1,
    b2: 1
}

//Check for connection 
io.on('connection', function (socket) {
    socket.on('new player', function () {
        console.log("new player");
    });
});

//Set the serial port where your arduino is
const port = new SerialPort('/dev/cu.usbserial-14140', {
    baudRate: 115200
});

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
