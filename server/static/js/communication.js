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
                console.log("Comm: CI MANCA UN TURNO! o li abbiamo tutti (announce_turn outdated)")
                return; //ci manca il turno di qualche giocatore oppure abbiamo già tutti i turni
            }

            for(let p in window.comm.peerconnections){
                let peer = window.comm.peerconnections[p]
                var player = new Player(peer.turno, "", window.gs.me().tanks, true)
                window.gs.addPlayer(player)
                console.log("Giocatore " + peer.turno + " aggiunto alla lista")

            }

            
            if (!window.gs.me().ps.getObjective()){
                console.log("Comm: ci siamo tutti, possiamo iniziare!")
                window.gs.me().start_playing();
            } else {
                console.log("Connessione a giocatori ripristinata, attendo che mi aggiornino e mi chiamino")
            }
            
        
            
        } else {
            console.log("Non so che roba sia, lo passo a gs")

            window.gs.action(msg)
        }
    }

    sendMessage(msg){
        console.log("Devo mandare " + this.peerconnections.length + " messaggi")
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

        const localConnection = new Peer({host: "arianna.cs.unibo.it", port: 9000, config: {iceServers: [{
            urls: ['turn:arianna.cs.unibo.it:3478'],
            username: 'simone',
            credential: 'KXGmwR52QNE'
        }, {
          urls: ['stun:arianna.cs.unibo.it'],
          username: 'simone',
          credential: 'KXGmwR52QNE'}]}}); 

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
                    console.log("Makeoffer: l'ultimo canale si è aperto, invio il mio turno al mondo!")
                    window.comm.sendMessage({"command": "announce_turn", "turno": window.comm.turno, "id": socket.id})
                }
            })
            conn.on('close', function(){
                //TODO forse serve peer.on('disconnected', function() { ... });
                //oppure 'close'eventpeer.on('close', function() { ... }); 
                //inoltre la documentazione dice che conn.on('close') non è supportato in firefox
                window.comm.handleCloseConnection(window.comm.peerconnections.find( p => p.conn.open == false).conn.peer)
            })

        })
        
        
    }

    connection_offer(peer_socket_id){ 
	console.log("Procedura di connessione iniziata!")
        let remoteConnection = new Peer({host: "arianna.cs.unibo.it", port: 9000, config: {iceServers: [{
            urls: ['turn:arianna.cs.unibo.it:3478'],
            username: 'simone',
            credential: 'KXGmwR52QNE'
        }, {
          urls: ['stun:arianna.cs.unibo.it'],
          username: 'simone',
          credential: 'KXGmwR52QNE'}]}});
        
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
	        console.log("Siamo collegati!")
                let ps = JSON.parse(localStorage.getItem(lobby_name)).ps
                if (!ps){
                    console.log("Comm: prima volta in questa lobby")
                    window.comm.turno += 1
                } else {
                    console.log("Comm: Hey, sono già stato qua!")
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
                                console.log("Makeoffer: l'ultimo canale si è aperto, invio il mio turno al mondo!")
                    }
                }
            })
            conn.on('close', function(){
                //TODO forse serve peer.on('disconnected', function() { ... });
                //oppure 'close'eventpeer.on('close', function() { ... }); 
                //inoltre la documentazione dice che conn.on('close') non è supportato in firefox
                window.comm.handleCloseConnection(window.comm.peerconnections.find( p => p.conn.open == false).conn.peer)
            })

	});
        
    }

    peerTimeOut(id){
        let peerIndex = window.comm.peerconnections.findIndex( p => p.conn.peer == id)
        let queueIndex = window.comm.queue.findIndex( p => p == id)
        if (peerIndex >= 0 && window.comm.peerconnections[peerIndex].conn && window.comm.peerconnections[peerIndex].conn.open == false){
            window.comm.peerconnections.splice(peerIndex, 1)
            if (window.gs.turn == 0){
                window.gs.end_game("Timeout utente")
            }
        }
        if (queueIndex >= 0 ) {
            window.comm.queue.splice(queueIndex, 1)
        }

    }

    remake_offer(id){
        console.log("Eliminamo la connessione col canale chiuso")
        let badpeerindex = this.peerconnections.findIndex( p => p.conn.open == false)
        console.log("La connessione è la numero " + badpeerindex)
        console.log("Adesso ho " + this.peerconnections.length + " connessioni")
        this.peerconnections.splice(badpeerindex, 1)
        console.log("Dopo la cancellazione, ho " + this.peerconnections.length + " connessioni")

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
        //TODO mostra messaggio che qualcuno si è disconesso
        console.log("Un giocatore si è disconnesso! (id: " + id + ") proprio in mezzo al turno di " + window.gs.player_turn)

        if (window.gs.turn == 0){
            window.gs.end_game("Un giocatore si è disconnesso nella fase iniziale")
            return
        }

        if (window.gs.turn != 0){
            console.log("Non è il turno 0, quindi possiamo continuare a giocare")
            let peerIndex = this.peerconnections.findIndex( p => p.conn.peer == id)
            console.log("Il giocatore disconnesso per me era (indice in peerconnections) " + peerIndex)
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

                // if (this.peerconnections[peerIndex].turno >= lostPlayer){
                //     this.peerconnections[peerIndex].turno -= 1
                // }

                /*let me = null
                window.gs.players.forEach( p => {
                    if (p.turno == this.turno)
                        me = p
                    if (p.turno > lostPlayer){
                        console.log("Il giocatore " + p.turno + " (" + p.color + ") scende di un turno")
                        p.turno -= 1
                    } else if (p.turno == lostPlayer){
                        console.log("Al giocatore " + p.color + " viene resettato il turno")
                        p.turno = 0
                    }
                })
                */
                if (window.gs.player_turn == lostPlayer){
                    //trova il giocatore successivo non missing e inizia il suo turno
                    /*let actual_players = this.players_in_lobby;
                    window.gs.players.forEach( p => { if (p.turno == 0){ actual_players -= 1}})

                    if (window.gs.player_turn - 1 == actual_players){
                        window.gs.player_turn = 1
                        window.gs.turn += 1
                            // L'istruzione sopra è in 'case "next":', però next() non viene chiamato in questo caso
                            // Ci si potrebbe chiedere perché non metterlo in start_turn(): la risposta è che se 1 aumenta il turno
                            // e perde la connessione, quando 2 comincerà il suo turno, siccome sarà ri-diventato 1, ri-aumenterà
                            // il turno (che verrebbe aumentato due volte di fila erroneamente)
                            
                        if (window.gs.me().turno == 1){
                            window.gs.me().start_turn()
                        }
                    } else if (window.gs.player_turn == me.turno && window.gs.player_turn == lostPlayer ){
                            window.gs.me().start_turn()
                    } else if (window.gs.player_turn - lostPlayer >= 1){
                        window.gs.player_turn -= 1
                    }
                    //se invece era un turno precedente (es. sono 3 e si disconnette 2, io divento 2)
                    //posso continuare a giocare e non devo ri-iniziare il mio turno
                */
                    
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

       //caso difficile: un giocatore si disconnette prima di aprire un datachannel perché questo evento non viene triggerato
       //quando si fa l'offerta di connessione, se non c'è risposta entro un minuto elimina il peer   
       
       
    }

}
