const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/resources/html/index.html");
});

var blue_player = null;
var red_player = null;
var current_turn = "red";

io.on('connection', (socket) => {
    
    if (red_player == null) {
        console.log('red player connected');
        socket.emit("assign-team", "red");
        red_player = socket.id;
    } else if (blue_player == null) {
        console.log('blue player connected');
        socket.emit("assign-team", "blue");
        blue_player = socket.id;
    } else {
        console.log('spectator connected');
        socket.emit("assign-team", "spectator");
    }

    socket.on('action', (data) => {
        current_turn = current_turn == "red" ? "blue" : "red"
        data.current_turn = current_turn;
        io.emit('action', data);
    });

    socket.on('disconnect', () => {

        if (socket.id == red_player) {
            console.log('red player left')
            red_player = null;
            io.emit('reset');
        } else if (socket.id == blue_player) {
            console.log('blue player left')
            blue_player = null;
            io.emit('reset');
        } else {
            console.log('spectator left')
        }
    })

    if ((red_player != null && blue_player != null) && (socket.id == blue_player || socket.id == red_player)) {
        current_turn = Math.random() < 0.5 ? "red" : "blue";
        io.emit('start', {
            current_turn: current_turn
        });
    }

});

server.listen(3000, () => {
  console.log('Listening on port 3000');
});