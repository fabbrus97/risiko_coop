
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
  console.log('a user connected');
  //TODO controlla i timestamp delle lobby, cancella quelle che hanno superato il keep_alive

  socket.emit("lobbylist", lobbylist)

  socket.on('disconnect', () => {
    console.log("User disconnected")
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
    let name = details["name"]
    let password = details["password"]

    if (password_timestamp[name] != null && password_timestamp[name]["password"] == password){
      socket.join(name);
      io.sockets.in(name).emit("userjoined");
    }
  })

  socket.on("offer", (data) => {
    socket.rooms.forEach(room => {
      io.sockets.in(room).emit("session_desc", data);
    })
  })

  socket.on("answer", (data) => {
    socket.rooms.forEach(room => {
      io.sockets.in(room).emit("reply", data);
    })
  })

});

/** express server code **/

app.use(express.static('public'));

app.get('/newlobby', function(req, res){
  console.log(req.params)
})

app.get('/lobby', function(req, res){
    //lobby?name=mialobby
    let name = req.query["name"]
    if (password_timestamp[name] != null){
      console.log("qualcuno ha richiesto una lobby")
      if (password_timestamp[name]["password"] == ""){ //lobby aperta
        console.log("Buone notizie ciurmaglia! la lobby è aperta")
        res.sendFile(__dirname + "/private/lobby.html")
        return;
      } else {
        console.error("Password richiesta per la lobby")
        res.sendFile(__dirname + "/private/login.html")
        return;
      }
    } else {
      console.error("La lobby non esiste")
      //TODO
      res.sendFile(__dirname + "/private/404.html")
    }

    console.log("Serving lobby")
    //invia un json con tutti i dati delle lobby
    res.json(lobbylist)
    
})

server.listen(3000, () => {  
    console.log('listening on *:3000');
});