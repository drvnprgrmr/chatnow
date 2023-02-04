const userList = document.getElementById("users")
const msgList = document.getElementById("msg-list")
const sendTo = document.getElementById("send-to")

function createUser(data) {
    const user = document.createElement("li")

    // Add attributes to user
    user.id = data.id
    user.className = "user"
    user.innerText = data.username

    // Add click event handler
    user.addEventListener("click", (ev) => {
        // Clear current chat list
        msgList.innerHTML = ""

        // Highlight user clicked
        user.classList += " user--selected"

        // Redirect messages to this user
        sendTo.value = data.id
    })

    // Update user list with new user
    userList.appendChild(user)

}


export default {
    createUser
}