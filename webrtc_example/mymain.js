var localConnection = new RTCPeerConnection() //peer A
var remoteConnection = new RTCPeerConnection() //peer B

localConnection.addEventListener('icecandidate', async e => { //peer A
        console.log('local connection ICE candidate: ', e.candidate);
        await remoteConnection.addIceCandidate(e.candidate);

        console.log("MY SDP (peer A):")
        console.log(JSON.stringify(localConnection.localDescription))

      });

remoteConnection.addEventListener('icecandidate', async e => { //peer B
  console.log('remote connection ICE candidate: ', e.candidate);
  await this.localConnection.addIceCandidate(e.candidate);

  console.log("MY SDP (peer A):")
  console.log(JSON.stringify(localConnection.localDescription))
})

var localChannel = localConnection.createDataChannel('messaging-channel'); //peer A

localChannel.addEventListener('open', () => { //peer A
  console.log("Local channel open!")
})

localChannel.addEventListener('close', () => { //peer A
  console.log("Local channel closed!")
})

localChannel.addEventListener('message', event => { //peer A
  console.log(`Remote message received by local: ${event.data}`)
});

remoteConnection.addEventListener('datachannel', (event) => { //peer B
  console.log(`onRemoteDataChannel: ${JSON.stringify(event)}`)
  remoteChannel = event.channel;
  remoteChannel.addEventListener('message', (event) => {
    console.log(`Local message received by remote: ${event.data}`);
  });
  remoteChannel.addEventListener('close', () => {
    console.log('Remote channel closed!');
  });

  //remoteConnection.channel = event.channel //???
});

async function initLocalOffer() {
  const localOffer = await localConnection.createOffer();
  console.log(`Got local offer ${JSON.stringify(localOffer)}`);
  const localDesc = localConnection.setLocalDescription(localOffer); //peer A

  const remoteDesc = remoteConnection.setRemoteDescription(localOffer); //peer A AFTER peer B has done something
  return Promise.all([localDesc, remoteDesc]);
}

const initRemoteAnswer = async () => { //peer B
  const remoteAnswer = await remoteConnection.createAnswer();
  console.log(`Got remote answer ${JSON.stringify(remoteAnswer)}`);
  const localDesc = remoteConnection.setLocalDescription(remoteAnswer)
  const remoteDesc = localConnection.setRemoteDescription(remoteAnswer)

  /*** tizio su yt ***/
  offer = localConnection.localDescription
  remoteConnection.setRemoteDescription

  return Promise.all([localDesc, remoteDesc])
};

initLocalOffer().then(initRemoteAnswer().then( () => {localChannel.send("Hello world!")}));
