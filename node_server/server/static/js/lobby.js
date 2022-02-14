
const socket = io()

// const configuration = {
//     "iceServers": [{"urls": "stun:stun.l.google.com:19302"}]
// }


var pars = new URLSearchParams(document.location.search)
var lobby_name = pars.get("name")
var game = JSON.parse(localStorage.getItem(lobby_name))
var players_in_lobby = game.n_giocatori
// var color = ""
var tanks = 35 - (players_in_lobby - 3)*5 //regola per calcolare il numero di carri per giocatore - in 3 35, in 4 30, etc.

//Nota: se non siamo mai stati nella lobby, JSON.parse genera un'eccezione
//Se siamo stati nella lobby e stiamo provando a prendere il posto di un altro giocatore, 
//allora - siccome il suo obiettivo è segreto - gli altri non possono saperlo
//però arrivati a fine partita, vedendo che ci sono due giocatori con lo stesso obiettivo la
//partita sarà annullata

var comm = new Communication(players_in_lobby, socket); window.comm = comm;
var me = new Player(1, "", tanks, false);
var gs = new GlobalState(me); window.gs = gs;

socket.emit("joingroup", {"name": lobby_name, "password": game.password ? game.password : ""})

socket.on("user_joined", (id) => {
    if (socket.id == id){
        console .log(`Sono entrato nella stanza (con id ${id})`)
    } else {
        if (window.comm.peerconnections.length == players_in_lobby - 1){

            //siamo al completo, però potrebbe essere un giocatore che si era scollegato e sta provando a ricollegarsi
            window.comm.peerconnections.forEach( peer => {
                if(peer.channel && peer.channel.readyState == "closed"){
                    //insieme all'offerta di collegamento, dobbiamo togliere 
                    // la vecchia connessione chiusa e mandargli lo stato attuale
                    console.log(`Rifaccio un'offerta perché ${id} si è riconnesso alla room`)
                    comm.remake_offer(id) 
                    //Nota: se droppano 2 peer (es. turno 3 e turno 5), i giocatori rimasti
                    //quando uno si ricollega non possono sapere chi era, deve dirglielo il giocatore
                    //stesso appena si apre il canale
                } else if (!peer.channel){
                    /*se tutti i peer sono nella stanza, ci sono 3 casi: 
                        - un giocatore si è disconnesso e peer.channel.readyState è "closed" (caso sopra)
                        - la stanza è al completo, siamo tutti connessi e un estraneo si vuole imbucare (non riceve inviti)
                        - la stanza è al completo, ma non siamo ancora tutti collegati (questo caso)
                    */
                    console.log(`Sto per fare un'offerta perché ${id} è entrato nella mia room`)
                    comm.make_offer(id)

                }
            })
        } else {    
            console.log(`Sto per fare un'offerta perché ${id} è entrato nella mia room`)
            comm.make_offer(id)
        }
    }
});

socket.on("connection_offer", async (data) => {
    console.log("Ricevuto peerid, devo iniziare la procedura di collegamento...")
    if (data.from == socket.id){
        console.log("Ricevuta offerta da me stesso, la ignoro")
    } else {
        comm.connection_offer(data)    
    }
    
})







