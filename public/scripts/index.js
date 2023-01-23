const msgInp = document.getElementById("msg-inp")
const sendMsg = document.getElementById("send-msg")
const form = document.getElementById("form")

const msgList = document.getElementById("msg-list")

const socket = io()


// const username = prompt("Enter a username: ", "You")
socket.emit("user", {id: socket.id, username})

socket.on("connect", () => {
    console.log("connected to server")
})


socket.on("message:get", (data) => {
    const newMsg = `<li class="msg"><span class="sender">${data.sender}</span>${data.msg}</li>`
    msgList.innerHTML += newMsg
})

form.addEventListener("submit", (e) => {
    e.preventDefault()
    console.log("submitted")
    console.log(msgInp.value)
    // Add current message to list of msgs
    
    if (msgInp.value) {
        const newMsg = `<li class="msg my-msg"><span class="sender">${username}</span>${msgInp.value}</li>`
        msgList.innerHTML += newMsg
        
        socket.emit("message:post", {sender: username, msg: msgInp.value})
        msgInp.value = ""
    }
})