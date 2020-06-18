const path = require("path");
const http = require("http");

const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

/* ------ END OF IMPORTS------ */

const port = process.env.PORT || 3000;

const publicDirPath = path.join(__dirname, "../public");
app.use(express.static(publicDirPath));

let count = 0;

io.on("connection", (socket) => {
  //a user joins a particular room
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Architect", "Welcome!! 🎅"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Architect", `${user.username} has joined the room 🤵`)
      );

    // update the sidebar
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Dont use bad words 😣");
    }

    const user = getUser(socket.id);

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Architect", `${user.username} has left 🙌`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("sendLocation", (coordinates, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`
      )
    );
    callback();
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
