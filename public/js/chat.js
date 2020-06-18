const socket = io();

//Elements
const $messageForm = document.getElementById("input-form");
const $messageFormButton = document.getElementById("form-button");
const $messageFormInput = document.getElementById("message-input");
const $locationButton = document.getElementById("location-button");
const $messageList = document.getElementById("message-list");
const $sidebar = document.getElementById("sidebar");

//Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

//Get the Query Parameters
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("username");
const room = urlParams.get("room");

/* ---- FUNCTION for auto scroll */
const autoscroll = () => {
  //get the new message element
  const $newMessage = $messageList.lastElementChild;

  //height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //Visible Height
  const visibleHeight = $messageList.offsetHeight;

  //Height of messages container
  const containerHeight = $messageList.scrollHeight;

  //How far have i scrolled
  const scrollOffset = $messageList.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messageList.scrollTop = $messageList.scrollHeight;
  }
};

socket.on("message", (msg) => {
  console.log(msg);

  const html = Mustache.render(messageTemplate, {
    message: msg.text,
    username: msg.username,
    createdAt: moment(msg.createdAt).format("ddd, h:mm a"),
  });

  $messageList.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

// to send a message
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", true);

  const formData = new FormData($messageForm);
  const message = formData.get("message");

  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return alert(error);
    }

    console.log("Message delivered !! 🦢");
  });
});

//to get the user location
$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Your browser does not support GeoLocation");
  }

  $locationButton.setAttribute("disabled", true);

  navigator.geolocation.getCurrentPosition((position) => {
    const coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    //callback function is the acknowledgement
    socket.emit("sendLocation", coordinates, () => {
      $locationButton.removeAttribute("disabled");
      console.log("Location was shared");
    });
  });
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });

  $sidebar.innerHTML = html;
});

socket.on("locationMessage", (locMessage) => {
  //console.log(locMessage);

  const html = Mustache.render(locationTemplate, {
    url: locMessage.url,
    username: locMessage.username,
    createdAt: moment(locMessage.createdAt).format("ddd, h:mm a"),
  });

  $messageList.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    window.location.href = "/";
  }
});
