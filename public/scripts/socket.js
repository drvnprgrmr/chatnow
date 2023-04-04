const socket = io({ autoConnect: false })

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


// Show the sidebar and hide chat when back is clicked
back.addEventListener("click", () => {
    sidebar.style.display = "initial"
    chat.style.display = "none"
    back.style.display = "none"
})


let thisUser


/**
 * Socket stuff
 */
socket.on("connect", () => {
    console.log("connected to server")

    // Load user info
    thisUser = JSON.parse(localStorage.getItem("user"))
    socket.emit("user:enter", thisUser) 

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
        if (id !== thisUser.id) {
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
            userId: thisUser.id,
            username,
            text: msgInp.value,
            timestamp
        }

        // Create message for the curren
        createMessage(msg)
        
        // Send message to appropriate place
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
    // Create a new message element
    const msgEl = document.createElement("li")
    msgEl.classList.add("msg")

    // Check if it is my message
    if (msg.userId === thisUser.id) {
        msgEl.classList.add("my-msg")
    }

    // Else if it's a group message add the sender
    else if (sendTo === "group") {
        const msgSender = document.createElement("p")
        msgSender.className = "msg--sender"
        msgSender.innerText = msg.username
        msgEl.appendChild(msgSender)
    }

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

    // Add message to the list
    msgList.append(msgEl)

    // Auto scroll to the end
    msgList.scrollTop = msgList.scrollHeight

}

function createUser(user) {
    const userEl = document.createElement("li")

    // Add attributes to user
    userEl.id = user.id
    userEl.className = "user"
    userEl.innerText = user.username
    
    // Unread element for handling notifications
    const unread = document.createElement("span")
    unread.className = "user--unread"
    unread.style.display = "none"
    userEl.append(unread)

    // Add click event handler
    userEl.addEventListener("click", selectUser)

    // Update user list with new user
    userList.appendChild(userEl)

    return userEl
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

    // Determine which messages to load
    id === "group" ? msgs = groupMessages : msgs = privateMessages[id]

    // Re-populate message list with messages
    for (let i = 0; i < msgs.length; i++) createMessage(msgs[i])

}