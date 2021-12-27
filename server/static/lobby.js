const socket = io()

const peerconnections = []
const configuration = {
    "iceServers": [{"urls": "stun:stun.l.google.com:19302"}]
}


var lobby_name = "test" //TODO
socket.emit("joingroup", {"name": lobby_name, "password": ""})
socket.on("joingroup", (data) => {
    console.log("AHAHA sono cattivo! " + data);
})

//devo farlo se un nuovo utente entra nella lobby
async function make_offer(id){
    /*let myconnection = new RTCPeerConnection(configuration)

    
    sendChannel = myconnection.createDataChannel("sendChannel");
    sendChannel.onmessage =e =>  console.log("messsage received!!!"  + e.data )

    await myconnection.createOffer().then( mySessionDescription => {
        myconnection.setLocalDescription(mySessionDescription)
        peerconnections.push(myconnection)
        socket.emit("offer", mySessionDescription)
    })*/

    const localConnection = new RTCPeerConnection()
    localConnection.remotePeer = id

    localConnection.onicecandidate = e =>  {
        console.log(" NEW ice candidnat!! on localconnection reprinting SDP " )
        socket.emit("offer", {"offer": localConnection.localDescription, "to": id})
    }

    const sendChannel = localConnection.createDataChannel("sendChannel");
    sendChannel.onmessage =e =>  console.log("messsage received!!!"  + e.data )
    sendChannel.onopen = e => console.log("open!!!!");
    sendChannel.onclose =e => console.log("closed!!!!!!");

    localConnection.channel = sendChannel

    localConnection.createOffer().then(o => {
        localConnection.setLocalDescription(o).then( o => {
            peerconnections.push(localConnection)
            //console.log(localConnection.localDescription)
            // socket.emit("offer", localConnection.localDescription)
        })
        
    })

    
    // sendChannels.push(sendChannel)

    
    
}

/* console.log("Sto per fare un'offerta per webrtc perché sono appena entrato in una room")
make_offer(); */
socket.on("user_joined", (id) => {
    if (socket.id == id){
        console .log(`Sono entrato nella stanza (con id ${id})`)
    } else {
        console.log(`Sto per fare un'offerta perché ${id} è entrato nella mia room`)
        make_offer(id)
    }
});

socket.on("session_desc", async (offer_id) => {
    data = offer_id["data"]
    if (offer_id["id"] == socket.id){
        console.log( `Ho ricevuto un'offerta da me stesso (${socket.id}), la ignoro`)
    } else {
        let newpeer = true;
        peerconnections.forEach(peer => {
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

        remoteConnection.onicecandidate = e =>  {
            console.log(" NEW ice candidnat!! on localconnection reprinting SDP " )
        }

        remoteConnection.ondatachannel= (e) => {
            const receiveChannel = e.channel;
            receiveChannel.onmessage = e =>  console.log("messsage received!!!"  + e.data )
            receiveChannel.onopen = (e) => {
                console.log("open!!!! Cleaning up...");

                let i = 0;
                while (true){
                    if (peerconnections[i].remotePeer == offer_id["id"] && peerconnections[i].channel == null){
                        peerconnections.splice(i, 1)
                    } else {
                        i++
                    }

                    if (i == peerconnections.length)
                        break
                }
            
            }
            receiveChannel.onclose =e => console.log("closed!!!!!!");
            remoteConnection.channel = receiveChannel;

        }

        remoteConnection.setRemoteDescription(data).then(async () => {
               
            // const sessionDescription = await remoteConnection.createAnswer();
            // remoteConnection.setLocalDescription(sessionDescription)
            // peerconnections.push(remoteConnection)
            // socket.emit("answer", sessionDescription)

            await remoteConnection.createAnswer().then( a => 
                remoteConnection.setLocalDescription(a)).then( a => {
                    peerconnections.push(remoteConnection)
                    socket.emit("answer", {"answer": remoteConnection.localDescription, "to": offer_id["id"]})
                    // console.log(remoteConnection.localDescription)
            })
        })
        
    }
})

socket.on("reply", (answer_id) => {
    data = answer_id["data"]
    if (answer_id["id"] == socket.id){
        console.log(`Ho ricevuto una risposta da me stesso (${socket.id}), la ignoro`)
    } else {
        console.log(`Ho ricevuto una risposta da ${answer_id["id"]} ad una mia offerta`)
        //prendi una connessione da myconnections
        peerconnections.forEach(conn => {
            if (conn.remoteDescription == null && answer_id["id"] == conn.remotePeer){
                
                // conn.setRemoteDescription(new RTCSessionDescription(data));
                conn.setRemoteDescription(data);
                console.log("Pronto per comunicare")
            }
        });
    }
})






