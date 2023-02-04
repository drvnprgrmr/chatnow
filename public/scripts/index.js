import utils from "./utils.js" 

const msgInp = document.getElementById("msg-inp")
const form = document.getElementById("form")

const msgList = document.getElementById("msg-list")
const userList = document.getElementById("users")


// Create lists to hold general and private messages
const generalMessages = []
const privateMessages = {}

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
    // Create new user
    utils.createUser(data)

    // Create new list to hold messages to this user
    privateMessages[data.id] = []
})

socket.on("user:dump", data => {
    // Add new user to list of connected users
    for (let {id, username} of data) {
        if (id !== socket.id) {
            // Create new user
            utils.createUser({id, username})

            // Create new list to hold messages to this user
            privateMessages[data.id] = []
        }
    }
})

socket.on("user:leave", id => {
    // Remove user from user list
    const user = document.getElementById(id)
    user.remove()
})


socket.on("genMsg:get", (data) => {
    const newMsg = `
        <li class="msg">
            <p class="msg--sender">${data.username}</p>
            <p class="msg--text">${data.msg}</p>
            <span class="msg--timestamp">${data.timestamp}</span>
        </li>
    `
    msgList.innerHTML += newMsg

    // Auto scroll to the end
    msgList.scrollTop = msgList.scrollHeight
    
    generalMessages.push(
        {
            userId: data.id,
            username: data.username,
            msg: data.msg,
            timestamp: data.timestamp
        }
    )
    
})




form.addEventListener("submit", (e) => {
    e.preventDefault()

    // Add current message to list of messages
    if (msgInp.value.trim()) {
        // Calculate timestamp
        const d = new Date()
        let timestamp = d.toLocaleTimeString('en-US', {timeStyle: "short"})

        // Create message
        const newMsg = `
            <li class="msg my-msg">
                <p class="msg--text">${msgInp.value}</p>
                <span class="msg--timestamp">${timestamp}</span>
            </li>
        `
        msgList.innerHTML += newMsg

        // Auto scroll to the end
        msgList.scrollTop = msgList.scrollHeight

        socket.emit("genMsg:post", {
            userId: socket.id,
            username, 
            msg: msgInp.value,
            timestamp
        })
        msgInp.value = ""
    }
})
