let channel;
let submitBtn = document.getElementById('room-btn');
submitBtn.addEventListener('click',(e) => {
    e.preventDefault();
    channel = document.getElementById('room').value;
    if(channel!=''){
        localStorage.setItem('room',JSON.stringify({channel}))
        window.location.href =`/lobby/room`
        // window.location.href =`/index.html?room=${channel}`
    }
})