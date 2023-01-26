const msgInp = document.getElementById("msg-inp")
const sendMsg = document.getElementById("send-msg")
const form = document.getElementById("form")

const msgList = document.getElementById("msg-list")
const userList = document.getElementById("users")

const socket = io()


let username = localStorage.getItem("username")


if (!username) {
    const username = prompt("Enter a username: ")
    // Save username to local storage
    localStorage.setItem("username", username)
}




socket.on("connect", () => {
    console.log("connected to server")
    socket.emit("user:enter", { id: socket.id, username })
})


socket.on("user:enter", data => {
    // Add new user to list of connected users
    const newUser = `<li class="user" id="${data.id}">&lt;${data.id}&gt;</li>`
    userList.innerHTML += newUser
})

socket.on("user:dump", data => {
    // Add new user to list of connected users
    console.log("user dump")
    const newUser = `<li class="user" id="${data.id}">&lt;${data.id}&gt;</li>`
    userList.innerHTML += newUser
})

socket.on("user:leave", id => {
    // Remove user from user list
    console.log("user id",id)
    const user = document.getElementById(id)
    user.remove()
})

socket.on("message:get", (data) => {
    const newMsg = `<li class="msg"><span class="sender">${data.sender}</span>${data.msg}</li>`
    msgList.innerHTML += newMsg
})




form.addEventListener("submit", (e) => {
    e.preventDefault()
    console.log(msgInp.value)

    // Add current message to list of messages
    if (msgInp.value) {
        const newMsg = `<li class="msg my-msg"><span class="sender">${username}</span>${msgInp.value}</li>`
        msgList.innerHTML += newMsg
        
        socket.emit("message:post", {sender: username, msg: msgInp.value})
        msgInp.value = ""
    }
})