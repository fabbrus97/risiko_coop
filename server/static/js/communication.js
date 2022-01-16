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
        
    }

    //tutti i messaggi devono avere un campo 'command' che specifica cosa fare e 'turno' (il
    //turno del giocatore che ha mandato il messaggio), il resto del formato del messaggio
    //dipende da command
    static receivedMessage(msg){
        
        msg = JSON.parse(msg)
        window.gs.action(msg)
    }

    sendMessage(msg){
        
        for (let i in this.peerconnections){
            var tries = 10000;
            while (this.peerconnections[i].channel.readyState != "open" && tries > 0){
                tries = tries - 1;
            }
            if (tries > 0)
                this.peerconnections[i].channel.send(JSON.stringify(msg))
        }
    }

    //devo farlo se un nuovo utente entra nella lobby
    async make_offer(id){
       
        const localConnection = new RTCPeerConnection()
        localConnection.remotePeer = id

        localConnection.onicecandidate = e =>  {
            console.log(" NEW ice candidnat!! on localconnection reprinting SDP " )
            let player = window.gs.me() //contiene turno e colore
            
            player = {/*"colore": player.getColor(),*/ "turno": this.turno, "id": this.socket.id}
            socket.emit("offer", {"offer": localConnection.localDescription, "to": id, "player": player})
        }

        const sendChannel = localConnection.createDataChannel("sendChannel");
        sendChannel.onmessage = e =>  {
            Communication.receivedMessage(e.data)
        }
        sendChannel.onopen    = e => {
            console.log("open!!!!");

            let len = this.peerconnections.length
                // this.peerconnections[len - 1].turno = len + 1

            this.peerconnections[len-1].turno = len + 1 //turno di quello che è appena entrato nel canale
            // var player = new Player(player_data.turno, "", window.gs.me().tanks, true)
            var player = new Player(len+1, "", window.gs.me().tanks, true)
            window.gs.addPlayer(player)

            if (this.peerconnections.length + 1 == players_in_lobby){
                window.gs.me().start_playing();
            }
        }
        sendChannel.onclose   = e => console.log("closed!!!!!!");

        localConnection.channel = sendChannel

        localConnection.createOffer().then(o => {
            localConnection.setLocalDescription(o).then( o => {
                this.peerconnections.push(localConnection)
            })
            
        })        
    }

    session_desc(offer_id){
        data = offer_id["data"]
        let newpeer = true;
        this.peerconnections.forEach(peer => {
            if (peer.remotePeer == offer_id["id"]){
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
        remoteConnection.turno = player_data.turno 
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

                this.turno += 1
                window.gs.me().turno = this.turno

                console.log("open!!!! Cleaning up...");
                console.log(e)

                let i = 0;
                while (true){
                    if (this.peerconnections[i].remotePeer == offer_id["id"] && this.peerconnections[i].channel == null){
                        this.peerconnections.splice(i, 1)
                    } else {
                        i++
                    }

                    if (i == this.peerconnections.length)
                        break
                }
                
                var player = new Player(remoteConnection.turno, "", window.gs.me().tanks, true)
                window.gs.addPlayer(player)
                
            
            }
            receiveChannel.onclose =e => console.log("closed!!!!!!");
            remoteConnection.channel = receiveChannel;

        }

        remoteConnection.setRemoteDescription(data).then(async () => {

            await remoteConnection.createAnswer().then( a => 
                remoteConnection.setLocalDescription(a)).then( a => {
                    this.peerconnections.push(remoteConnection)
                    
                    var player = { /* "colore": window.gs.me().colore, */ "turno": socket.id}
                    // var player = { /* "colore": window.gs.me().colore, */ "turno": this.turno}
                    socket.emit("answer", {"answer": remoteConnection.localDescription, "to": offer_id["id"], "player": player})
            })
        })
    }

    reply(answer_id){
        data = answer_id["data"]
        this.peerconnections.forEach(conn => {
            if (conn.remoteDescription == null && answer_id["id"] == conn.remotePeer){
                
                conn.setRemoteDescription(data);
                console.log("Pronto per comunicare")
            
                var player_data = answer_id["player"]
                // conn.turno = player_data.turno
                
            }
        });
    }
}
