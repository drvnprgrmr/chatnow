const msgInp = document.getElementById("msg-inp")
const form = document.getElementById("form")

const sidebar = document.getElementById("sidebar")
const userList = document.getElementById("user-list")

const chat = document.getElementById("chat")
const msgList = document.getElementById("msg-list")

const back = document.getElementById("back")
const currentUser = document.getElementById("current-user")

let sendTo = "group"

// Create stores to hold general and private messages
const groupMessages = []
const privateMessages = {}

const socket = io()

// Load username
let username = sessionStorage.getItem("username")
if (!username) {
    username = prompt("Enter a username: ")
    sessionStorage.setItem("username", username)
}

// Set the username of the user
const usernameEl = document.getElementById("username")
usernameEl.value = username

// Show the sidebar and hide chat when back is clicked
back.addEventListener("click", () => {
    sidebar.style.display = "initial"
    chat.style.display = "none"
    back.style.display = "none"
})



/**
 * Socket stuff
 */
socket.on("connect", () => {
    console.log("connected to server")
    socket.emit("user:enter", { id: socket.id, username })

    const groupEl = createUser({id: "group", username: "Group Chat"})
    
    // Set default chat to group
    groupEl.classList.add("user--selected")
    currentUser.innerText = "Group Chat"

})

socket.on("disconnect", (reason) => {
    console.log(`disconnected from server (${reason})`)
    userList.innerHTML = ""
})


socket.on("user:enter", user => {
    // Create new user
    createUser(user)

    // Create new list to hold messages to this user
    privateMessages[user.id] = []
})

socket.on("user:dump", users => {
    // Add new user to list of connected users
    for (let {id, username} of users) {
        if (id !== socket.id) {
            // Create new user
            createUser({id, username})

            // Create new list to hold messages to this user
            privateMessages[id] = []

        }
    }
})

socket.on("user:leave", id => {
    // Remove user from user list
    const user = document.getElementById(id)
    user.remove()
})


socket.on("groupMsg:get", (msg) => {
    // Create message element and add it to page
    if (sendTo === "group") createMessage(msg)
    else {
        // Increase the notification count
        const unreadEl = document.querySelector("#group .user--unread")
        unreadEl.style.display = "initial"
        unreadEl.textContent = +unreadEl.textContent + 1

    }
    
    // Push message to general list
    groupMessages.push(msg)
    
})

socket.on("privMsg:get", msg => {
    // Create message element and add it to page
    if (sendTo === msg.userId) createMessage(msg)
    else {
        // Increase the notification count
        const unreadEl = document.querySelector(`#${msg.userId} .user--unread`)
        unreadEl.style.display = "initial"
        unreadEl.textContent = +unreadEl.textContent + 1

    }

    // Add new message to private messages from this user
    privateMessages[msg.userId].push(msg)
})


form.addEventListener("submit", (e) => {
    e.preventDefault()

    // Add current message to list of messages
    if (msgInp.value.trim()) {
        // Calculate timestamp
        const d = new Date()
        let timestamp = d.toLocaleTimeString('en-US', {timeStyle: "short"})

        // Generate message object
        const msg = {
            userId: socket.id,
            username,
            text: msgInp.value,
            timestamp
        }

        // Create message
        const msgEl = `
            <li class="msg my-msg">
                <p class="msg--text">${msgInp.value}</p>
                <span class="msg--timestamp">${timestamp}</span>
            </li>
        `
        msgList.innerHTML += msgEl

        // Auto scroll to the end
        msgList.scrollTop = msgList.scrollHeight


        if (sendTo === "group") {
            groupMessages.push(msg)

            socket.emit("groupMsg:post", msg)
            msgInp.value = ""
        } else {
            privateMessages[sendTo].push(msg)

            socket.emit("privMsg:post", sendTo, msg)
            msgInp.value = ""
        }


    }


})




function createMessage(msg) {
    const msgEl = `
        <li class="msg">
            <p class="msg--sender">${msg.username}</p>
            <p class="msg--text">${msg.text}</p>
            <span class="msg--timestamp">${msg.timestamp}</span>
        </li>
    `
    msgList.innerHTML += msgEl

    // Auto scroll to the end
    msgList.scrollTop = msgList.scrollHeight

}


function createUser(data) {
    const user = document.createElement("li")

    // Add attributes to user
    user.id = data.id
    user.className = "user"
    user.innerText = data.username
    
    // Unread element for handling notifications
    const unread = document.createElement("span")
    unread.className = "user--unread"
    unread.style.display = "none"
    user.append(unread)

    // Add click event handler
    user.addEventListener("click", selectUser)

    // Update user list with new user
    userList.appendChild(user)

    return user
}

function selectUser(ev) {
    // Get selected user
    const user = ev.currentTarget

    // Make sure user isn't currently selected
    if (!user.classList.contains("user--selected")) {
        // Set the name of the current user
        currentUser.innerText = user.innerText

        // Clear current chat list
        msgList.innerHTML = ""
    
        // Remove previously highlighted user
        const prevUser = document.getElementsByClassName("user--selected")[0]
        if (prevUser) prevUser.classList.remove("user--selected")
    
        // Highlight user clicked
        user.classList.add("user--selected")

        // Clear unread notification
        const unreadEl = user.lastChild
        if (unreadEl.textContent !== "") {
            unreadEl.style.display = "none"
            unreadEl.textContent = ""
        }
    
        if (user.id === "group") {
            // Load group messages
            loadMessages()
            sendTo = "group"
        } else {
            // Load private messages
            loadMessages(user.id)
            sendTo = user.id
        }
    }


    /**
     * For Mobile views
     */
    // Hide the sidebar and show the chat once clicked
    const chatStyle = getComputedStyle(chat)
    if (chatStyle.display === "none") {
        sidebar.style.display = "none"
        chat.style.display = "flex"
        back.style.display = "flex"
    }


}

function loadMessages(id="group") {
    let msgs

    if (id === "group") {
        msgs = groupMessages
    } else {
        msgs = privateMessages[id]
    }

    // Re-populate messages from the most recent
    for (let i = msgs.length - 1; i >= 0; i--) {
        const msg = msgs[i]
    
        // Create a new message element
        const msgEl = document.createElement("li")
        msgEl.classList.add("msg")
        
        // Check if it is my message
        msg.userId === socket.id ? msgEl.classList.add("my-msg") : null
        
        // Create and add the message text to the message
        const msgText = document.createElement("p")
        msgText.className = "msg--text"
        msgText.innerText = msg.text
        msgEl.appendChild(msgText)
    
        // Create and add the timestamp to the message
        const msgTime = document.createElement("span")
        msgTime.className = "msg--timestamp"
        msgTime.innerText = msg.timestamp
        msgEl.appendChild(msgTime)
    
        // Add message to message list
        msgList.prepend(msgEl)
    }
}