let localStream;
let remoteStream;
let peerConnection;
console.log('YEsss')

const APP_ID = "14ff8e36771b417fb8584cb83ed922e2";
let token = null;
let uid = String(Math.floor(Math.random() * 10000));

let client;
let channel;
// const urlParams = new URLSearchParams(window.location.search);
// channel = urlParams.get('room');
let room = JSON.parse(localStorage.getItem('room'));
channel = room.channel;
console.log('channel '+channel)

if(!channel){
    window.location.href = '/lobby'
}
// use the google stun server to generate the ice candidate
const servers = {
    iceServers : [
        {
            urls : ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]
        }
    ]
}

let constraints = {
    video : {
        width : {min:640,ideal:1920,max:1920},
        height : {min:480,ideal:1080,max:1080},
    },
    audio:true
}
const init = async () => {
    client = await AgoraRTM.createInstance(APP_ID)
    await client.login({uid,token})

    
    channel = client.createChannel(channel);
    await channel.join();

    // whenever a user joins this channel the below func will be called
    channel.on('MemberJoined', handleUserJoined);

    channel.on('MemberLeft', handleUserLeft);

    client.on('MessageFromPeer',handleMessageFromPeer);

    //initialize the process by asking audio and video stream to the user
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    document.getElementById('user1').srcObject = localStream;

    //first thing we wanna do after joining a meet is to create an offer to the other peer to set up a peer connection
    // createOffer();
} 

const handleUserLeft = async(MemberID) => {
    document.getElementById('user2').style.display = 'none'
}

const handleMessageFromPeer = async(message,MemberID) => {
    let mssg = JSON.parse(message.text)
    
    if(mssg.type === 'offer') {
        createAnswer(MemberID,mssg.offer);
    }
    if(mssg.type === 'answer') {
        addAnswer(mssg.answer);
    }
    if(mssg.type === 'candidate') {
        if(peerConnection) {
            peerConnection.addIceCandidate(mssg.candidate)
        }
    }
}


const handleUserJoined = async(MemberID) => {
    console.log('Member Joined with ID: ',MemberID);

    // whenever someone joines the channel we will send an offer to that user
    createOffer(MemberID);
}

const createPeerConnection = async(MemberID) => {
    peerConnection = new RTCPeerConnection(servers);

    document.getElementById('user2').style.display = 'block';
    //initializing the remote stream for the joined user. Right now the video may not be present but
    //whenever the offer is accepted by a peer this line will implement the remote video into the local users screen
    remoteStream = new MediaStream();
    document.getElementById('user2').srcObject = remoteStream;

    if(!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
        document.getElementById('user1').srcObject = localStream;   
    }

    //getting all the tracks from the localStream and attaching it with the peerConnection
    //so that the remoteUser can access it once connection is established
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track,localStream);
    });

    //now get the remote users stream once they have set it and attach it to the remoteStream
    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    //setting the localDesscription fires a event listener that creates a series of iceCandidates
    //by requesting the stun server
    peerConnection.onicecandidate = async (event) => {
        if(event.candidate) {
            client.sendMessageToPeer({text : JSON.stringify({'type':'candidate' , 'candidate':event.candidate})},MemberID);
        }
    }
}

const createOffer = async (MemberID) => {
    await createPeerConnection(MemberID);

    //creating the offer and setting it in the localDescription
    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    // console.log('Offer ',offer)
    client.sendMessageToPeer({text : JSON.stringify({'type':'offer' , 'offer':offer})},MemberID);
}

const createAnswer = async(MemberID,offer) => {
    await createPeerConnection(MemberID);
 
    await peerConnection.setRemoteDescription(offer)
    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer)

    client.sendMessageToPeer({text : JSON.stringify({'type':'answer' , 'answer':answer})},MemberID);
    
    
}

const addAnswer = async(answer) => {
    if(!peerConnection.remoteDescription){
        await peerConnection.setRemoteDescription(answer);
    }
}

let leaveChannel = async() => {
    await channel.leave();
    await client.logout();
    window.location.href = '/lobby'
}

window.addEventListener('beforeunload',leaveChannel);

const handleCamera = (e) => {
    let videoTrack = localStream.getTracks().find(track => track.kind === 'video');
    if(videoTrack.enabled) {
        videoTrack.enabled = false;
        camera.innerHTML = 'Turn on Camera'
    }
    else{
        videoTrack.enabled = true;
        camera.innerHTML = 'Turn off Camera'
    }
}
const handleMic = (e) => {
    let audioTrack = localStream.getTracks().find(track => track.kind === 'audio');
    if(audioTrack.enabled) {
        audioTrack.enabled = false;
        mic.innerHTML = 'Turn on Mic'
    }
    else{
        audioTrack.enabled = true;
        mic.innerHTML = 'Turn off Mic'
    }
}

const mic = document.getElementById('mic');
const camera = document.getElementById('camera');
const exit = document.getElementById('exit');

mic.addEventListener('click',handleMic);
camera.addEventListener('click',handleCamera);
exit.addEventListener('click',leaveChannel);


init();