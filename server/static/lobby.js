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

var sendChannel = null;

//devo farlo dopo che sono entrato nella lobby io E se un nuovo utente entra nella lobby
async function make_offer(){
    let myconnection = new RTCPeerConnection(configuration)

    
    sendChannel = myconnection.createDataChannel("sendChannel");
    sendChannel.onmessage =e =>  console.log("messsage received!!!"  + e.data )

    await myconnection.createOffer().then( mySessionDescription => {
        myconnection.setLocalDescription(mySessionDescription)
        peerconnections.push(myconnection)
        socket.emit("offer", mySessionDescription)
    })
    
}

console.log("Sto per fare un'offerta per webrtc perché sono appena entrato in una room")
make_offer();
socket.on("user_joined", () => {
    console.log("Sto per fare un'offerta perché qualcuno è entrato nella mia room")
    make_offer()
});

socket.on("session_desc", async (data) => {
    console.log("Ho ricevuto un'offerta da qualcuno, creo una connessione con la sua offerta e gli mando una risposta")
    let conn = new RTCPeerConnection(configuration)

    conn.ondatachannel= e => {
        const receiveChannel = e.channel;
        receiveChannel.onmessage =e =>  console.log("messsage received!!!"  + e.data )
        receiveChannel.onopen = e => console.log("open!!!!");
        receiveChannel.onclose =e => console.log("closed!!!!!!");
        conn.channel = receiveChannel;
    }

    conn.setRemoteDescription(new RTCSessionDescription(data)).then( async () => {
        var mySessionDescription = await conn.createAnswer()
        conn.setLocalDescription(mySessionDescription)
        peerconnections.push(conn)
        socket.emit("answer", mySessionDescription)
    })
})

socket.on("reply", (data) => {
    console.log("Ho ricevuto una risposta ad una mia offerta")
    //prendi una connessione da myconnections
    peerconnections.forEach(conn => {
        if (conn.remoteDescription == null){
            conn.setRemoteDescription(new RTCSessionDescription(data));
        }
    });
})






