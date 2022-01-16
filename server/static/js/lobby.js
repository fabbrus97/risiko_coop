const socket = io()

// const configuration = {
//     "iceServers": [{"urls": "stun:stun.l.google.com:19302"}]
// }


var pars = new URLSearchParams(document.location.search)
var lobby_name = pars.get("name")
var players_in_lobby = JSON.parse(localStorage.getItem(lobby_name)).n_giocatori
// var color = ""
var tanks = 35 - (players_in_lobby - 3)*5 //regola per calcolare il numero di carri per giocatore - in 3 35, in 4 30, etc.

socket.emit("joingroup", {"name": lobby_name, "password": ""})

var me = new Player(1, "", tanks, false);
var gs = new GlobalState(me); window.gs = gs;
var comm = new Communication(players_in_lobby, socket); window.comm = comm;

/* console.log("Sto per fare un'offerta per webrtc perché sono appena entrato in una room")
make_offer(); */
socket.on("user_joined", (id) => {
    if (socket.id == id){
        console .log(`Sono entrato nella stanza (con id ${id})`)
    } else {
        console.log(`Sto per fare un'offerta perché ${id} è entrato nella mia room`)
        comm.make_offer(id)
    }
});

socket.on("session_desc", async (offer_id) => {
    data = offer_id["data"]
    if (offer_id["id"] == socket.id){
        console.log( `Ho ricevuto un'offerta da me stesso (${socket.id}), la ignoro`)
    } else {
        //session_desc(offer_id)
        comm.session_desc(offer_id)
        
    }
})

socket.on("reply", (answer_id) => {
    data = answer_id["data"]
    if (answer_id["id"] == socket.id){
        console.log(`Ho ricevuto una risposta da me stesso (${socket.id}), la ignoro`)
    } else {
        console.log(`Ho ricevuto una risposta da ${answer_id["id"]} ad una mia offerta`)
        //prendi una connessione da myconnections
        comm.reply(answer_id)

    }
})






