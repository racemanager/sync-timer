"use strict";

var socket = io();

socket.on("connect", function () {
  // Events
  socket.on("done set up", function (data) {
    myTimerId = myTimerId ? myTimerId : data.timerId;
    var timerEl = document.getElementById("timerId");
    timerEl.innerText = myTimerId;
    socket.emit("get time", myTimerId);
  });

  socket.on("update timer", function (time) {
    if (time !== null) {
      updateDisplay(time.hours, time.minutes, time.seconds, time.centiseconds);
    }
  });

  socket.on("timer error", function () {
    showError();
  });

  socket.on("new user joining", function (data) {
    if (data.clientId !== socket.id) {
      console.log("User " + data.clientId + " has joined in.");
    }
  });

  socket.on("disconnect", function () {
    showError();
  });
});

var sendStartSignal = function () {
  if (socket.connected && myTimerId !== null) {
    socket.emit("start timer", myTimerId);
  }
};

var sendStopSignal = function () {
  if (socket.connected && myTimerId !== null) {
    socket.emit("stop timer", myTimerId);
  }
};

var sendResetSignal = function () {
  if (socket.connected && myTimerId !== null) {
    socket.emit("reset timer", myTimerId);
  }
};

var initialize = function () {
  socket.emit("set up", myTimerId);
};

var showError = function () {
  statusEl.classList.add("material-icons");
};
