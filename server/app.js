
var express = require('express');
var app = express();
const http = require('http');
const { dirname } = require('path');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const KEEP_ALIVE_NO_PLAYERS = 3600 //se non entrano utenti entro 60 minuti, cancella la lobby
const KEEP_ALIVE_PLAYERS = 3600*24 //se ci sono giocatori nella lobby, il tempo di vita è 24 ore

console.log("Server started.")

var password_timestamp = {}
var lobbylist = []

/** socket.io code **/
io.on('connection', (socket) => { 
  console.log(`User ${socket.id} connected`);
  //TODO controlla i timestamp delle lobby, cancella quelle che hanno superato il keep_alive

  socket.emit("lobbylist", lobbylist)

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`)
  });

  socket.on("newlobby", (lobby) => {
    let name = lobby["name"]
    let maxplayer = lobby["maxplayer"]
    let password = lobby["password"]
    
    name_taken = false
    lobbylist.forEach(existing_lobby => {
      if (existing_lobby["name"].startsWith(name) && existing_lobby["name"].endsWith(name)){
        name_taken = true
      }
    })
    if (!name_taken){
      lobbylist.push({        
        "name": name,
        "numero_giocatori": 0,
        "giocatori_massimi": maxplayer,
        "password": !(password.length == 0 )
      })
  
      password_timestamp[name] = {"password": password, "timestamp": Date.now()}
  
      io.emit("lobbylist", lobbylist)
    }
    
  })

  socket.on("joingroup", (details) => {

    console.log(`User ${socket.id} joining room ${details["name"]}`)

    let name = details["name"]
    let password = details["password"]

    console.log(`Cheking lobby pwd ${password_timestamp[name]["password"]} with user pwd ${password}: ${password_timestamp[name]["password"] == password}`)
    if (password_timestamp[name] != null && password_timestamp[name]["password"] == password){
      socket.join(name);
      io.sockets.in(name).emit("user_joined", socket.id);
    }
  })

  socket.on("offer", (data) => {
    // socket.rooms.forEach(room => {
    //   const r = {"data": data, "id": socket.id}
    //   io.sockets.in(room).emit("session_desc", r);
    // })
    const r = {"data": data["offer"], "id": socket.id}
    io.to(data["to"]).emit("session_desc", r)
  })

  socket.on("answer", (data) => {
    // const r = {"data": data, "id": socket.id}
    // socket.rooms.forEach(room => {
    //   io.sockets.in(room).emit("reply", r);
    // })
    const r = {"data": data["answer"], "id": socket.id}
    io.to(data["to"]).emit("reply", r)
  })

});

/** express server code **/

app.use(express.static('static'));

app.get('/newlobby', function(req, res){
  console.log(req.params)
})

app.get('/lobby', function(req, res){
    //lobby?name=mialobby
    let name = req.query["name"]
    if (password_timestamp[name] != null){
      
      if (password_timestamp[name]["password"] == ""){ //lobby aperta
      
        res.sendFile(__dirname + "/static/lobby.html")
        return;
      } else {
      
        res.sendFile(__dirname + "/static/login.html")
        return;
      }
    } else if (name != null){
      
      res.sendFile(__dirname + "/static/404.html")
      return;
    }

    console.log("Serving lobby")
    //invia un json con tutti i dati delle lobby
    res.json(lobbylist)
    
})

server.listen(3000, () => {  
    console.log('listening on *:3000');
});