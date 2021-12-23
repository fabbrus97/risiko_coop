const socket = io()

const peerconnections = []
const configuration = {
    "iceServers": [{"urls": "stun.1.google.com:19302"}]
}


var lobby_name = "" //TODO
socket.send("joingroup", {"name": "", "password": ""})

//devo farlo dopo che sono entrato nella lobby io E se un nuovo utente entra nella lobby
function make_offer(){
    let myconnection = new RTCPeerConnection(configuration)
    let mySessionDescription = await myconnection.createOffer()
    myconnection.setLocalDescription(mySessionDescription)
    peerconnections.push(myconnection)
    socket.emit("offer", mySessionDescription)
}
make_offer();
socket.on("user_joined", make_offer);

socket.on("session_desc", (data) => {
    let conn = new RTCPeerConnection()
    conn.setRemoteDescription(new RTCSessionDescription(data)).then( async () => {
        var mySessionDescription = await conn.createAnswer()
        conn.setLocalDescription(mySessionDescription)
        peerconnections.push(conn)
        socket.emit("answer", mySessionDescription)
    })
})

socket.on("reply", (data) => {
    //prendi una connessione da myconnections
    peerconnections.forEach(conn => {
        if (conn.remoteDescription == null){
            conn.setRemoteDescription(new RTCSessionDescription(data));
        }
    });
})






