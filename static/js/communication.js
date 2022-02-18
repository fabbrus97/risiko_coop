class Communication{

    /**
     * 
     * @param {int} players 
     */
    constructor(players, socket){
        this.socket = socket;
        this.turno = 1
        this.players_in_lobby = players
        this.peerconnections = []

        this.queue = []; //coda di utenti a cui dobbiamo inviare un'offerta
        
        
    }

    //tutti i messaggi devono avere un campo 'command' che specifica cosa fare e 'turno' (il
    //turno del giocatore che ha mandato il messaggio), il resto del formato del messaggio
    //dipende da command
    static receivedMessage(msg){
        msg = JSON.parse(msg)
        console.log(msg)
        if (msg.command == "announce_turn"){
            console.log("È un giocatore " + msg.id + " che pubblica il suo turno (" + msg.turno + ")")
            window.comm.peerconnections.find( p => p.socketid == msg.id).turno = msg.turno

            //questa condizione serve perché se un giocatore annuncia il proprio turno  in fase di collegamento, allora non ho ancora players in 
            //window.gs; ma il turno potrebbe essere anche annunciato se un giocatore si sta ricollegando e in quel caso devo modificare la variabile
            //'missing'
            let p = window.gs.players.find(p => p.turno == msg.turno)
            if (p)
                p.missing = false
           
            if (window.comm.peerconnections.find( p => (p.conn && !p.conn.open) || !p.turno) || window.gs.players.length == players_in_lobby){
                return; //ci manca il turno di qualche giocatore oppure abbiamo già tutti i turni
            }

            for(let p in window.comm.peerconnections){
                let peer = window.comm.peerconnections[p]
                var player = new Player(peer.turno, "", window.gs.me().tanks, true)
                window.gs.addPlayer(player)
                console.log("Giocatore " + peer.turno + " aggiunto alla lista")

            }

            
            if (!window.gs.me().ps.getObjective()){
                window.gs.me().start_playing();
            } else {
            }
            
        
            
        } else {

            window.gs.action(msg)
        }
    }

    sendMessage(msg){
        for (let i in this.peerconnections){
            var tries = 10000;
            while (this.peerconnections[i].conn && !this.peerconnections[i].conn.open && tries > 0){
                tries = tries - 1;
            }
            if (tries > 0)
                this.peerconnections[i].conn.send(JSON.stringify(msg))
        }
    }

    //devo farlo se un nuovo utente entra nella lobby
    async make_offer(id){

        const localConnection = new Peer({host: "YOUR_PEERJS_SERVER", port: 9000, config: {iceServers: [{
            urls: ['turn:YOUR_TURN_SERVER'],
            username: 'username',
            credential: 'pwd'
        }, {
          urls: ['stun:YOUR_STUN_SERVER'],
          username: 'username',
          credential: 'pwd'}]}}); 

        this.peerconnections.push(localConnection)

        localConnection.socketid = id

        localConnection.on('open', function(peerid) {
            console.log('My peer ID is: ' + peerid);
            //allochiamo un oggetto Peer apposta per id, e diciamo a id di collegarsi a noi
            //che siamo peerid
            socket.emit("peerid", {"peerid": peerid, "to": id})
        });

        localConnection.on('connection', function(conn){
            localConnection.conn = conn
            console.log("Incoming connection..")
                conn.on('data', function(data){
                    Communication.receivedMessage(data)
                })
                conn.on('open', function(){
            console.log("Connected!")
                if (window.gs.turn == 0){
                    wait_players_modal(window.comm.peerconnections.length + 1)
                }

                let openChannels = 0
                for (let peer in window.comm.peerconnections){
                    if (window.comm.peerconnections[peer].conn && window.comm.peerconnections[peer].conn.open)
                        openChannels += 1
                    else 
                        break;
                }
                console.log("I canali aperti sono " + openChannels)
                if (openChannels == players_in_lobby - 1){
                    let lobby = JSON.parse(localStorage.getItem(lobby_name))
                    if (lobby.ps)
                        lobby.ps.turno = window.comm.turno
                    else 
                        lobby.ps = {"turno": window.comm.turno}
                    console.log("Comm: setto ps in localStorage")
                    console.log(lobby.ps)
                    localStorage.setItem(lobby_name, JSON.stringify(lobby))
                    window.comm.sendMessage({"command": "announce_turn", "turno": window.comm.turno, "id": socket.id})
                }
            })
            conn.on('close', function(){
                window.comm.handleCloseConnection(window.comm.peerconnections.find( p => p.conn.open == false).conn.peer)
            })

        })
        
        
    }

    connection_offer(peer_socket_id){ 
        let remoteConnection = new Peer({host: "YOUR_PEERJS_SERVER", port: 9000, config: {iceServers: [{
            urls: ['turn:YOUR_TURN_SERVER'],
            username: 'username',
            credential: 'password'
        }, {
          urls: ['stun:YOUR_STUN_SERVER'],
          username: 'username',
          credential: 'password'}]}});
        
        let id = peer_socket_id.peerid
        remoteConnection.socketid = peer_socket_id.from

        this.peerconnections.push(remoteConnection)

        remoteConnection.on('open', function(peerid) {
            console.log('My peer ID is: ' + peerid);

	        console.log("Provo a collegarmi al peer " + id)

            var conn = remoteConnection.connect(id);

            remoteConnection.conn = conn

            conn.on('data', function(data){
                Communication.receivedMessage(data)
            })
            conn.on('open', function(){ 
                let ps = JSON.parse(localStorage.getItem(lobby_name)).ps
                if (!ps){
                    window.comm.turno += 1
                } else {
                    window.comm.turno = ps.turno
                    window.gs.me().turno = window.comm.turno
                    window.gs.me().color = ps.color
                    window.gs.me().ps.setObjective(ps.obj)
                    window.gs.me().ps.cards = ps.cards
                    window.gs.me().ready = true
                    window.gs.me().tanks = 0
                }
                window.gs.me().turno = window.comm.turno

                if (window.gs.turn == 0){
                    wait_players_modal(window.comm.peerconnections.length + 1)
                }


                let openChannels = 0
                for (let peer in window.comm.peerconnections){
                    if (window.comm.peerconnections[peer].conn && window.comm.peerconnections[peer].conn.open)
                        openChannels += 1
                    else 
                        break;
                }

                if (openChannels == players_in_lobby - 1 || (ps && ps.obj)){
                    window.comm.sendMessage({"command": "announce_turn", "turno": window.comm.turno, "id": socket.id})

                    if (ps){
                        //mi sono ricollegato con tutti i giocatori dopo una disconnessione,
                        //annuncio chi ero e chiedo loro di mandarmi lo stato attuale
                        let color = ps.color
                        console.log("Ero già collegato in precedenza, faccio una richiesta per lo stato globale")
                        window.comm.sendMessage({"command": "status_report", "color": color, "turno": ps.turno})
                    } else {
                        ps = {"turno": 0}
                        ps.turno = window.comm.turno
                        let lobby = JSON.parse(localStorage.getItem(lobby_name))
                                lobby.ps = ps
                                console.log("Comm: setto ps in localStorage")
                                console.log(lobby.ps)
                                localStorage.setItem(lobby_name, JSON.stringify(lobby))
                    }
                }
            })
            conn.on('close', function(){
                window.comm.handleCloseConnection(window.comm.peerconnections.find( p => p.conn.open == false).conn.peer)
            })

	});
        
    }

    remake_offer(id){
        let badpeerindex = this.peerconnections.findIndex( p => p.conn.open == false)
        this.peerconnections.splice(badpeerindex, 1)
        this.make_offer(id)
    }

    handleCloseConnection(id){
        //caso facile: siamo tutti collegati con data channel open
        /* trova il giocatore che si è disconnesso
            aggiorna tutti i turni diminuendo di 1 quelli che erano dopo
            (es. si disconnette 2, allora 3 diventa 2, 4 diventa 3, etc.)
            TRANNE se siamo al turno 0: allora la distribuzione delle carte sui bloccherà
            quando il giocatore rientrerà, il giocatore 1 ricomincierà da capo
            (resettando available_cards etc.)
        */
        console.log("Un giocatore si è disconnesso! (id: " + id + ") proprio in mezzo al turno di " + window.gs.player_turn)

        if (window.gs.turn == 0){
            window.gs.end_game("Un giocatore si è disconnesso nella fase iniziale")
            return
        }

        if (window.gs.turn != 0){
            console.log("Non è il turno 0, quindi possiamo continuare a giocare")
            let peerIndex = this.peerconnections.findIndex( p => p.conn.peer == id)
            if (peerIndex >= 0 && !this.peerconnections[peerIndex].conn.open){

                let lostPlayer = this.peerconnections[peerIndex].turno
                console.log("Era il giocatore di turno " + lostPlayer)
                let pl = window.gs.players.find(p => p.turno == lostPlayer)
                pl.missing = true
                pl.tanks = 0
                pl.combo_tanks = 0

                let badpeerindex = this.peerconnections.findIndex( p => p.conn.open == false)
                this.peerconnections.splice(badpeerindex, 1)

                //contiamo i peer effettivamente rimasti:
                let alivePeers = 0
                window.gs.players.forEach( p=> {
                        if (!p.missing){
                            alivePeers += 1
                        }
                })

                if (alivePeers < 3){
                    window.gs.end_game("Troppi giocatori disconnessi")
                }

                if (window.gs.player_turn == lostPlayer){
                    //trova il giocatore successivo non missing e inizia il suo turno
                    
                    
                    let nextPlayer = (lostPlayer%players_in_lobby) + 1
                    while(window.gs.players.find(p => p.turno == nextPlayer).missing)
                        nextPlayer = (nextPlayer%players_in_lobby) + 1

                    window.gs.player_turn = nextPlayer
                    
                    let firstPlayer = 1
                    while(window.gs.players.find( p => p.turno == firstPlayer).missing){
                        firstPlayer = firstPlayer + 1    
                    }
                    
                    if (firstPlayer == nextPlayer)
                        window.gs.turn += 1

                    
                    if (window.gs.me().turno == nextPlayer){
                        window.gs.me().start_turn();
                    }

                } else {
                    console.log("Il giocatore disconnesso non stava giocando, non bisogna modificare i turni")
                    //controlliamo se il giocatore disconnesso doveva tirare i dadi per la difesa da un attacco
                    if (window.gs.me().attacking){
                        if (pl.countries[window.attacked_nation] > 0){
                            //il giocatore disconnesso era sotto attacco
                            window.comm.sendMessage({"command": "attack", "values": window.gs.attack_dices, "attacking": window.attacking_nation, "attacked": window.attacked_nation, "from": window.gs.me().turno})

                        }
                    }
                }
                
            }
        }

       
    }

}
