'use strict';

const { logExceptInTest } = require('../helpers');
const TIMERSTATE = require('../helpers/timerStates');

module.exports = (http, roomManager) => {
  const io = require('socket.io')(http);
  const rm = roomManager;
  const broadcastUpdate = (timer) => io.to(timer.id).emit('update timer', timer.time);

  rm.updateCallback = broadcastUpdate.bind(this);

  // Socket Logic
  io.on('connection', (socket) => {
    logExceptInTest(`User ${socket.id} connected`);

    // Events

    socket.on('set up', (timerId) => {
      // A failsafe to make sure a valid Timer Id is obtained at this point.
      // Being passed an invalid timerId (undefined, null) should not happen.
      const tId = timerId ? timerId : rm.createTimer();

      socket.join(tId, () => {
        rm.addClient(socket.id);
        rm.addClientToTimer(tId, socket.id);
        logExceptInTest(`User ${socket.id} registered`);
        io.to(tId).emit('new user joining', { clientId: socket.id });
        socket.emit('done set up', { timerId: tId });

        switch(rm.timerList[tId].timerRunning) {

          case TIMERSTATE.RUNNING:
            io.to(tId).emit('timer started');
            break;

          case TIMERSTATE.STOPPED:
          case TIMERSTATE.SUSPENDED:
            io.to(tId).emit('timer stopped'); 
            break;

          default:
            io.to(tId).emit('timer error');
        }
      });
    });
  
    socket.on('get time', (timerId) => {
      if (rm.timerExists(timerId)) {
        logExceptInTest(`User ${socket.id} is querying Timer ${timerId}`);
        socket.emit('update timer', rm.timerList[timerId].time);
      } else {
        logExceptInTest(`User ${socket.id} - Timer ${timerId} does not exist`);
        socket.emit('update timer', null);
      }
    });

    socket.on('start timer', (timerId) => {
      logExceptInTest(`User ${socket.id} started timer ${timerId}`);
      rm.timerList[timerId].startTimer();
      io.to(timerId).emit('timer started');
    });

    socket.on('stop timer', (timerId) => {
      logExceptInTest(`User ${socket.id} stopped timer ${timerId}`);
      rm.timerList[timerId].stopTimer();
      io.to(timerId).emit('timer stopped');
    });

    socket.on('reset timer', (timerId) => {
      logExceptInTest(`User ${socket.id} reset timer ${timerId}`);
      rm.timerList[timerId].resetTimer();
      io.to(timerId).emit('timer stopped');
    });

    socket.on('disconnect', () => {
      logExceptInTest(`User ${socket.id} disconnected`);
      rm.removeClient(socket.id);
    });
  });
};
