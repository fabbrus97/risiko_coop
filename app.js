
var express = require('express');
var app = express();
const bodyParser = require('body-parser');
//const { Socket } = require("socket.io");
const http = require('http');
const { dirname } = require('path');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const KEEP_ALIVE_NO_PLAYERS = 3600 //se non entrano utenti entro 60 minuti, cancella la lobby
const KEEP_ALIVE_PLAYERS = 3600*24 //se ci sono giocatori nella lobby, il tempo di vita è 24 ore

app.use(bodyParser.urlencoded({ extended: true }));

console.log("Server started.")

var password_timestamp = {}
var lobbylist = []

/** socket.io code **/
io.on('connection', (socket) => { 
  console.log(`User ${socket.id} connected`);
  //controlla i timestamp delle lobby, cancella quelle che hanno superato il keep_alive

  lobby2delete = []
  lobbylist.forEach( lobby => {
    let now = Date.now()
    let diff = (now - password_timestamp[lobby.name].timestamp)/1000

    if (lobby.numero_giocatori == 0){
      if (diff >= KEEP_ALIVE_NO_PLAYERS){
        lobby2delete.push(lobby.name)
      }
    } else if (lobby.numero_giocatori < lobby.giocatori_massimi){
      if (diff >= KEEP_ALIVE_PLAYERS){
        lobby2delete.push(lobby.name)
      }
    }
  })

  lobby2delete.forEach(name => {
    lobbylist.splice(lobbylist.find(l => l.name == name), 1)
    delete password_timestamp[name]

  })

  socket.emit("lobbylist", lobbylist)

  socket.on('disconnecting', () => {
    console.log(`User ${socket.id} disconnecting`)

    try {
      console.log("Le rooms dell'utente erano")
      console.log(socket.rooms)
    
      socket.rooms.forEach(function(room){
        
        lobby = lobbylist.find( l => l.name == room)
        if (lobby)
          lobby.numero_giocatori -= 1
      });
    } catch(e){
      console.log(e)
    }

    io.sockets.emit("lobbylist", lobbylist)

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

  socket.on("deletelobby", (name) => {
    console.log("Elimino la lobby ", name)
    try { //più giocatori possono provare a eliminare la lobby
      lobbylist.splice(lobbylist.find(l => l.name == name), 1)
      delete password_timestamp[name]
      socket.emit("lobbylist", lobbylist)

    } catch (e){

    }
  })

  socket.on("joingroup", (details) => {

    console.log(`User ${socket.id} joining room ${details["name"]}`)
    
    let lobby = lobbylist.find( l => l.name == details["name"])
    if (lobby)
      lobby.numero_giocatori += 1
    else 
      return;
    
    io.sockets.emit("lobbylist", lobbylist)

    let name = details["name"]
    let password = details["password"]

    // console.log(`Cheking lobby pwd ${password_timestamp[name]["password"]} with user pwd ${password}: ${password_timestamp[name]["password"] == password}`)
    if (password_timestamp[name] != null && password_timestamp[name]["password"] == password){
      socket.join(name);
      io.sockets.in(name).emit("user_joined", socket.id);
    }
  })

  socket.on("peerid", (data) => {
    console.log("peerid: invio " + data.peerid + " a " + data.to)
    // socket.rooms.forEach(room => {
    //   const r = {"data": data, "id": socket.id}
    //   io.sockets.in(room).emit("session_desc", r);
    // })
    const r = {"peerid": data["peerid"], "from": socket.id} 
    io.to(data["to"]).emit("connection_offer", r)
  })

});

/** express server code **/

app.get("/", function(req, res){
  console.log("Richiesta per la index")
  let theDate = new Date("2/11/2022 21:00:00")
  let now = Date.now();

  if (now < theDate){
    res.sendFile(__dirname + "/static/html/countdown.html")
    return;
  } else 
    res.sendFile(__dirname + "/static/index.html")
})

app.get('/newlobby', function(req, res){
  console.log(req.params)
})

app.get('/lobby', function(req, res){
    //lobby?name=mialobby
    let name = req.query["name"]
    let logged = req.query["logged"]
    if (password_timestamp[name] != null){
      
      if (password_timestamp[name]["password"] == ""){ //lobby aperta
      
        res.sendFile(__dirname + "/static/html/lobby.html")
        return;
      } else if (logged){
        res.sendFile(__dirname + "/static/html/lobby.html")
        return;
      }
      else {
      
        res.sendFile(__dirname + "/static/html/login.html")
        return;
      }
    } else if (name != null){
      
      res.sendFile(__dirname + "/static/html/404.html")
      return;
    }

    console.log("Serving lobby")
    //invia un json con tutti i dati delle lobby
    res.json(lobbylist)
    
})

app.post('/lobby', function(req, res){
  
  let name = req.body["name"]
  let pwd = req.body["pwd"]
  console.log("Cerco di accedere alla lobby " + name)
  if (!password_timestamp[name]){
    console.log("La lobby non esiste!")
    res.sendStatus(400)
    return;
  }

  console.log("La password corretta è " + password_timestamp[name]["password"])
  console.log("La password ricevuta è " + pwd)

  if (password_timestamp[name]["password"].startsWith(pwd) && password_timestamp[name]["password"].endsWith(pwd)){
    res.sendStatus(200)
  } else
    res.sendStatus(400) 
})


app.use(express.static('static'));

const port = 3000

server.listen(port, () => {  
    console.log('listening on *:' + port);
});
