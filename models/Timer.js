"use strict";

const { padDisplay } = require("../helpers");
const TIMERSTATE = require("../helpers/timerStates");
const timerTickInterval = 10; // hundreds, ie. 01:36.65

class Timer {
  constructor(updateCallback, id) {
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.centiseconds = 0;
    this.timerRunning = TIMERSTATE.STOPPED;
    this.timerLoop = undefined;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.clients = [];
    this.updateCallback = updateCallback;
    this.id = id;

    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.updateTimer = this.updateTimer.bind(this);
  }

  startTimer() {
    if (this.timerRunning !== TIMERSTATE.RUNNING) {
      this.startTime = Date.now();
      this.timerLoop = setInterval(this.updateTimer, timerTickInterval);
      this.timerRunning = TIMERSTATE.RUNNING;
    }
  }

  stopTimer() {
    if (this.timerRunning === TIMERSTATE.RUNNING) {
      this.elapsedTime += Date.now() - this.startTime;
      this.timerRunning = TIMERSTATE.SUSPENDED;

      if (this.timerLoop !== undefined && this.timerLoop._repeat) {
        clearInterval(this.timerLoop);
      }
    }
  }

  updateTimer() {
    let now = Date.now();
    let timeDiff = now - this.startTime + this.elapsedTime; // in milliseconds

    this.hours = Math.floor(timeDiff / 3600000);
    this.minutes = Math.floor((timeDiff - this.hours * 3600000) / 60000);
    this.seconds = Math.floor(
      (timeDiff - this.hours * 3600000 - this.minutes * 60000) / 1000
    );
    this.centiseconds = Math.floor(timeDiff / 10) % 100; // get hundreds

    if (this.updateCallback) {
      this.updateCallback(this);
    }
  }

  resetTimer() {
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.centiseconds = 0;
    this.elapsedTime = 0;
    this.timerRunning = TIMERSTATE.STOPPED;

    if (this.timerLoop !== undefined && this.timerLoop._repeat) {
      clearInterval(this.timerLoop);
    }

    if (this.updateCallback) {
      this.updateCallback(this);
    }
  }

  addClient(clientId) {
    if (!this.clients.includes(clientId)) {
      this.clients.push(clientId);
      return true;
    }

    return false;
  }

  removeClient(clientId) {
    if (this.clients.includes(clientId)) {
      this.clients.splice(this.clients.indexOf(clientId), 1);
      return true;
    }

    return false;
  }

  get time() {
    return {
      hours: padDisplay(this.hours, 2),
      minutes: padDisplay(this.minutes, 2),
      seconds: padDisplay(this.seconds, 2),
      centiseconds: padDisplay(this.centiseconds, 2),
    };
  }
}

module.exports = Timer;
