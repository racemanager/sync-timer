"use strict";

var m;
var s;
var c;

var statusEl;

var displayReady = false;

var startTimer = function () {
  sendStartSignal();
};

var stopTimer = function () {
  sendStopSignal();
};

var resetTimer = function () {
  sendResetSignal();
};

var updateDisplay = function (hours, minutes, seconds, centiseconds) {
  if (displayReady) {
    m.innerText = minutes;
    s.innerText = seconds;
    c.innerText = centiseconds;
  }
};

var getDisplayElements = function () {
  m = document.getElementById("minutes");
  s = document.getElementById("seconds");
  c = document.getElementById("centiseconds");
  statusEl = document.getElementById("running-state");
  displayReady = true;
  initialize();
};
