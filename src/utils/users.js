const users = [];

//Add User
const addUser = ({ id, username, room }) => {
  //Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Validate the data
  if (!username || !room) {
    return {
      error: "Please enter username and room 🛑",
    };
  }

  //Check for existing user
  const existingUser = users.find(
    (user) => user.username === username && user.room === room
  );

  if (existingUser) {
    return {
      error: "Username has been taken 😿",
    };
  }

  //Store User
  const user = { id, username, room };
  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);

  return user;
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  const userList = users.filter((user) => user.room === room);

  return userList;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
