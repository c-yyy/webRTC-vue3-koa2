'use strict'

const socketServer = (app) => {
  const http = require('http').createServer()
  const io = require('socket.io')(http, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["accept", "authorization", "cache-control", "content-type", "dnt", "if-modified-since", "keep-alive", "origin", "user-agent", "x-requested-with", "token", "x-access-token"],
      credentials: true
    },
  })
  http.listen(3479)
  // http.listen(3479, '0.0.0.0')
  console.log('\x1b[32m', `----  http://127.0.0.1:${3479}  ----`)

  let lawyerList = []

  io.sockets.on('connection', socket => {
    const USERCOUNT = 3;

    socket.on('message', (room, data)=>{
      io.in(room).emit('message', room, data);
    });

    socket.on('setStatus', data => {
      console.log('status ', data)
      const { status, lawyer, uuid } = data
      setInterval(() => {
        
      }, 1e3);
      switch (status) {
        case 'free':
          lawyerList.findIndex(lawyer => lawyer.uuid === uuid) === -1 && lawyerList.push({ lawyer, uuid })
          break;
        default:
          lawyerList.splice(lawyerList.findIndex(lawyer => lawyer.uuid === uuid), 1)
          break;
      }
    })

    socket.on('wantLawyerList', () => {
      console.log('lawyerList', lawyerList)
      io.emit('lawyerList', lawyerList)
    })

    socket.on('clearLawyerList', () => {
      lawyerList = []
      console.log('clearLawyerList', lawyerList)
      io.emit('reset')
    })
  
    // 这里应该加锁
    socket.on('join', (room)=>{
      socket.join(room);
      const myRoom = io.sockets.adapter.rooms.get(room);
      const users = myRoom? myRoom.size : 0;
      console.debug(`房间, ${room}: ` + `人数, ${users}`, `Socket ID, ${socket.id}`);
  
      // 控制房间人数 USERCOUNT
      if(users < USERCOUNT){
        socket.emit('joined', room, socket.id); //发给除自己之外的房间内的所有人
        console.log('joined', room, socket.id)
        if(users > 1) {
          io.in(room).emit('otherJoin', room);
        }
      }else{
        socket.leave(room)
        socket.emit('full', room, socket.id);
      }

      //socket.emit('joined', room, socket.id); //发给自己
      //socket.broadcast.emit('joined', room, socket.id); //发给除自己之外的这个节点上的所有人
      //io.in(room).emit('joined', room, socket.id); //发给房间内的所有人
    });
  
    socket.on('leave', (room)=>{
      const myRoom = io.sockets.adapter.rooms.get(room);
      const users = myRoom? myRoom.size : 0;
      console.debug(`房间, ${room}: ` + `人数, ${users}`);
      socket.leave(room)
      io.in(room).emit('leaved', room, socket.id);
    });
  })

  io.sockets.on('disconnect', socket => {
    console.log(socket, 'you have been disconnected')
    socket.disconnect()
  })
}

module.exports = socketServer