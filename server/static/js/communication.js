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
            window.comm.peerconnections.find( p => p.remotePeer == msg.id).turno = msg.turno

            //questa condizione serve perché se un giocatore annuncia il proprio turno  in fase di collegamento, allora non ho ancora players in 
            //window.gs; ma il turno potrebbe essere anche annunciato se un giocatore si sta ricollegando e in quel caso devo modificare la variabile
            //'missing'
            let p = window.gs.players.find(p => p.turno == msg.turno)
            if (p)
                p.missing = false
           
            if (window.comm.peerconnections.find( p => (p.channel && p.channel.readyState != "open") || !p.turno) || window.gs.players.length == players_in_lobby){
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
            while (this.peerconnections[i].channel && this.peerconnections[i].channel.readyState != "open" && tries > 0){
                tries = tries - 1;
            }
            if (tries > 0)
                this.peerconnections[i].channel.send(JSON.stringify(msg))
        }
    }

    //devo farlo se un nuovo utente entra nella lobby
    async make_offer(id){

        
        if (! this.queue.find( p => p == id)){
            console.log("coda: metto in coda " + id)
            this.queue.push(id)
        } else {
            console.log("Coda: l'utente " + id + " è già in coda, non sarà riaggiunto")
            return
        }

        console.log("Coda: Adesso la coda è lunga " + this.queue.length)
        if (this.queue.length > 1){
            console.log("Coda: Sto gestendo un utente, al momento non posso fare un'offerta")
            return;
        }
        console.log("Coda: posso procedere con l'invio dell'offerta")

        const localConnection = new RTCPeerConnection()

        localConnection.remotePeer = id

        localConnection.onicecandidate = e =>  {
            console.log(" NEW ice candidnat!! on localconnection reprinting SDP " )
            let player = window.gs.me() //contiene turno e colore
            
            player = {/*"colore": player.getColor(), "turno": this.turno, */ "id": this.socket.id}
            socket.emit("offer", {"offer": localConnection.localDescription, "to": id, "player": player})
            //abbiamo fatto l'offerta, adesso impostiamo un timeout: se non riceviamo risposta entro 60 secondi, 
            //eliminiamo il peer
            setTimeout(this.peerTimeOut, 60*1000, id)
        }

        const sendChannel = localConnection.createDataChannel("sendChannel");
        sendChannel.onmessage = e =>  {
            Communication.receivedMessage(e.data)
        }
        sendChannel.onopen    = e => {
            console.log("open!!!!");

            if (window.gs.turn == 0){
                wait_players_modal(this.peerconnections.length + 1)
            }

            let len = this.peerconnections.length
                // this.peerconnections[len - 1].turno = len + 1

            // this.peerconnections[len-1].turno = len + 1 //turno di quello che è appena entrato nel canale
            // var player = new Player(player_data.turno, "", window.gs.me().tanks, true)
            //var player = new Player(len+1, "", window.gs.me().tanks, true)
            //window.gs.addPlayer(player)

            // if (this.peerconnections.length + 1 == players_in_lobby){
            //     window.gs.me().start_playing();
            // }
            let openChannels = 0
            for (let peer in this.peerconnections){
                // allChannelsOpen = allChannelsOpen && this.peerconnections[peer].channel && this.peerconnections[peer].channel.readyState == "open"
                // if (!allChannelsOpen)
                //     break
                if (this.peerconnections[peer].channel && this.peerconnections[peer].channel.readyState == "open")
                    openChannels += 1
                else 
                    break;
            }
            // if (allChannelsOpen){
            if (openChannels == this.players_in_lobby - 1){
                let lobby = JSON.parse(localStorage.getItem(lobby_name))
                if (lobby.ps)
                    lobby.ps.turno = this.turno
                else 
                    lobby.ps = {"turno": this.turno}
                console.log("Comm: setto ps in localStorage")
                console.log(lobby.ps)
                localStorage.setItem(lobby_name, JSON.stringify(lobby))
                console.log("Makeoffer: l'ultimo canale si è aperto, invio il mio turno al mondo!")
                this.sendMessage({"command": "announce_turn", "turno": this.turno, "id": this.socket.id})
            }
        }
        sendChannel.onclose =e => {
            console.log("closed!!!!!!")
            this.handleCloseConnection(this.peerconnections.find( p => p.channel.readyState == "closed").remotePeer)
        };

        localConnection.channel = sendChannel

        localConnection.createOffer().then(o => {
            localConnection.setLocalDescription(o).then( o => {
                this.peerconnections.push(localConnection)
            })
            
        })        
    }

    peerTimeOut(id){
        let peerIndex = window.comm.peerconnections.findIndex( p => p.remotePeer == id)
        let queueIndex = window.comm.queue.findIndex( p => p == id)
        if (peerIndex >= 0 && window.comm.peerconnections[peerIndex].channel && window.comm.peerconnections[peerIndex].channel.readyState != "open"){
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
        let badpeerindex = this.peerconnections.findIndex( p => p.channel.readyState != "open")
        console.log("La connessione è la numero " + badpeerindex)
        console.log("Adesso ho " + this.peerconnections.length + " connessioni")
        this.peerconnections.splice(badpeerindex, 1)
        console.log("Dopo la cancellazione, ho " + this.peerconnections.length + " connessioni")

        
        this.make_offer(id)
    }

    session_desc(offer_id){
        console.log("Ricezione offerta: controlliamo se l'utente " + offer_id["id"] + " è già presente")
        data = offer_id["data"]
        let newpeer = true;
        this.peerconnections.forEach(peer => {
            console.log("ricezione offerta: Mi sto collegando/sono collegato a " + peer.remotePeer)
            if (peer.remotePeer == offer_id["id"]){
                console.log("ricezione offerta: il peer non è nuovo")
                newpeer = false
            }
        })
        
        if (!newpeer){
            console.log(`Ho ricevuto un'offerta da un utente a cui sono già collegato (${offer_id["id"]}), la ignoro`)
            return
        }

        console.log(`Ho ricevuto un'offerta da ${offer_id["id"]}, creo una connessione con la sua offerta e gli mando una risposta`)

        const remoteConnection = new RTCPeerConnection()

        remoteConnection.remotePeer = offer_id["id"]
        let player_data = offer_id["player"]
        remoteConnection.turno = null //player_data.turno  //valore placeholder
        //global state e communicator devono sapere entrambi qual è il turno di ogni giocatore
        //per identificarli sia dal colore (gs) sia dal socket (comm)

        /*remoteConnection.onicecandidate = e =>  {
            console.log(" NEW ice candidnat!! on localconnection reprinting SDP " )
        }*/

        remoteConnection.ondatachannel= (e) => {
            const receiveChannel = e.channel;
            receiveChannel.onmessage = e =>  {
                Communication.receivedMessage(e.data)
            }
            receiveChannel.onopen = (e) => {

                //Nota: questo valore va settato appena tutti i giocatori sono entrati nella lobby
                let ps = JSON.parse(localStorage.getItem(lobby_name)).ps
                if (!ps){
                    console.log("Comm: prima volta in questa lobby")
                    this.turno += 1
                } else {
                    console.log("Comm: Hey, sono già stato qua!")
                    this.turno = ps.turno
                    window.gs.me().turno = this.turno
                    window.gs.me().color = ps.color
                    window.gs.me().ps.setObjective(ps.obj)
                    window.gs.me().ps.cards = ps.cards
                    window.gs.me().ready = true
                    window.gs.me().tanks = 0
                }
                window.gs.me().turno = this.turno

                console.log("open!!!! Cleaning up...");
                console.log(e)

                let i = 0;
                while (true){
                    if (this.peerconnections[i].remotePeer == offer_id["id"] && this.peerconnections[i].channel == null){
                    // || (this.peerconnections[i].channel && this.peerconnections[i].channel.readyState != "open")){
                        this.peerconnections.splice(i, 1)
                    } else {
                        i++
                    }

                    if (i == this.peerconnections.length)
                        break
                }

                if (window.gs.turn == 0){
                    wait_players_modal(this.peerconnections.length + 1)
                }
                
                // var player = new Player(remoteConnection.turno, "", window.gs.me().tanks, true)
                // window.gs.addPlayer(player)
                
                let openChannels = 0
                for (let peer in this.peerconnections){
                    // allChannelsOpen = allChannelsOpen && this.peerconnections[peer].channel && this.peerconnections[peer].channel.readyState == "open"
                    // if (!allChannelsOpen)
                    //     break
                    if (this.peerconnections[peer].channel && this.peerconnections[peer].channel.readyState == "open")
                        openChannels += 1
                    else 
                        break;
                }
                if (/*allChannelsOpen*/ openChannels == this.players_in_lobby - 1 || (ps && ps.obj)){
                    this.sendMessage({"command": "announce_turn", "turno": this.turno, "id": this.socket.id})
                    
                    if (ps){
                        //mi sono ricollegato con tutti i giocatori dopo una disconnessione,
                        //annuncio chi ero e chiedo loro di mandarmi lo stato attuale
                        let color = ps.color
                        console.log("Ero già collegato in precedenza, faccio una richiesta per lo stato globale")
                        this.sendMessage({"command": "status_report", "color": color, "turno": ps.turno})
                    } else { 
                        ps = {"turno": 0}
                        ps.turno = this.turno
                        let lobby = JSON.parse(localStorage.getItem(lobby_name))
                        lobby.ps = ps
                        console.log("Comm: setto ps in localStorage")
                        console.log(lobby.ps)
                        localStorage.setItem(lobby_name, JSON.stringify(lobby))
                        console.log("Makeoffer: l'ultimo canale si è aperto, invio il mio turno al mondo!")
                    }
                }
            
            }
            receiveChannel.onclose =e => {
                console.log("closed!!!!!!")
                this.handleCloseConnection(this.peerconnections.find( p => p.channel.readyState == "closed").remotePeer)
            };
            remoteConnection.channel = receiveChannel;

        }

        remoteConnection.setRemoteDescription(data).then(async () => {

            await remoteConnection.createAnswer().then( a => 
                remoteConnection.setLocalDescription(a)).then( a => {
                    this.peerconnections.push(remoteConnection)
                    
                    var player = null//  { /* "colore": window.gs.me().colore, */ "turno": socket.id} TODO sta roba non serve
                    // var player = { /* "colore": window.gs.me().colore, */ "turno": this.turno}
                    socket.emit("answer", {"answer": remoteConnection.localDescription, "to": offer_id["id"], "player": player})
                    // setTimeout(this.peerTimeOut, 60*1000, offer_id["id"])
            })
        })
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
            let peerIndex = this.peerconnections.findIndex( p => p.remotePeer == id)
            console.log("Il giocatore disconnesso per me era (indice in peerconnections) " + peerIndex)
            if (peerIndex >= 0 && this.peerconnections[peerIndex].channel.readyState == "closed"){

                let lostPlayer = this.peerconnections[peerIndex].turno
                console.log("Era il giocatore di turno " + lostPlayer)
                window.gs.players.find(p => p.turno == lostPlayer).missing = true

                let badpeerindex = this.peerconnections.findIndex( p => p.channel.readyState != "open")
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

                }
                
            }
        }

       //caso difficile: un giocatore si disconnette prima di aprire un datachannel perché questo evento non viene triggerato
       //quando si fa l'offerta di connessione, se non c'è risposta entro un minuto elimina il peer   
       
       
    }

    reply(answer_id){
        data = answer_id["data"]
        this.peerconnections.forEach(conn => {
            if (conn.remoteDescription == null && answer_id["id"] == conn.remotePeer){
                
                conn.setRemoteDescription(data);
                console.log("Pronto per comunicare")
            
                this.queue.splice(0, 1)
            
                if (this.queue.length > 0){
                    console.log("Coda: Ho un utente in coda (" + this.queue[0] + "), gli mando un'offerta")
                    this.make_offer(this.queue[0])
                } else {
                    console.log("Coda: Non ho nessun utente in coda")
                }
            
                /*var player_data = answer_id["player"] //TODO sta roba non serve perché viene gestito quando apro il canale di comm.
                if (player_data){
                    //questo è un vecchio giocatore che prova a ricollegarsi
                    conn.turno = player_data.turno
                }*/
                
            }
        });
    }
}
