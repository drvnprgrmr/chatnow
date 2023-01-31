const msgInp = document.getElementById("msg-inp")
const sendMsg = document.getElementById("send-msg")
const form = document.getElementById("form")

const msgList = document.getElementById("msg-list")
const userList = document.getElementById("users")

const socket = io()

let username = sessionStorage.getItem("username")
if (!username) {
    username = prompt("Enter a username: ")
    sessionStorage.setItem("username", username)
}

socket.on("connect", () => {
    console.log("connected to server")
    socket.emit("user:enter", { id: socket.id, username })
})

socket.on("disconnect", (reason) => {
    userList.innerHTML = ""
})


socket.on("user:enter", data => {
    // Add new user to list of connected users
    const newUser = `<li class="user" id="${data.id}">&lt;${data.username}&gt;</li>`
    userList.innerHTML += newUser
})

socket.on("user:dump", data => {
    // Add new user to list of connected users
    console.log("user dump")
    console.log(data)
    for (let {id, username} of data) {
        if (id !== socket.id) {
            // Add user to socket list
            const newUser = `<li class="user" id="${id}">&lt;${username}&gt;</li>`
            userList.innerHTML += newUser
        }
    }
})

socket.on("user:leave", id => {
    // Remove user from user list
    const user = document.getElementById(id)
    user.remove()
})

socket.on("message:get", (data) => {
    const newMsg = `<li class="msg"><span class="sender">${data.username}</span>${data.msg}</li>`
    msgList.innerHTML += newMsg
})




form.addEventListener("submit", (e) => {
    e.preventDefault()

    // Add current message to list of messages
    if (msgInp.value) {
        const newMsg = `<li class="msg my-msg">${msgInp.value}</li>`
        msgList.innerHTML += newMsg
        
        socket.emit("message:post", {
            username, 
            msg: msgInp.value,
            timestamp: Date.now()
        })
        msgInp.value = ""
    }
})