// Get the forms
const signinForm = document.getElementById("signin-form")
const signupForm = document.getElementById("signup-form")
const tempSignupForm = document.getElementById("temp-signup-form")

const authWrapper = document.getElementById("auth-wrapper")

// Handle signup
signupForm.addEventListener("submit", async (ev) => {
    ev.preventDefault()

    const formData = new URLSearchParams(new FormData(signupForm));
    
    const user = await fetch("/signup", {
        method: "post",
        body: formData
    }).then(resp => resp.json())
    
    // Save the user's info to localstorage
    localStorage.setItem("user", JSON.stringify(user))

    // Initialize the app
    initApp(user)
    
    // Don't reload the page
    return false
})


// Handle login
signinForm.addEventListener("submit", async (ev) => {
    ev.preventDefault()

    const formData = new URLSearchParams(new FormData(signinForm));

    // Get response from server
    const resp = await fetch("/signin", {
        method: "post",
        body: formData
    })

    
    if (resp.status === 404 || resp.status === 401) {
        alert(await resp.text())
    }
    else {
        const user = await(resp.json())
        
        // Save the user's info to localstorage
        localStorage.setItem("user", JSON.stringify(user))
    
        // Initialize the app
        initApp(user)
    }

    // Don't reload the page
    return false
})


// Initialize the app after login or signup
function initApp(user) {
    // Hide auth dialog
    authWrapper.style.display = "none"

    // Set the username of the user
    const usernameEl = document.getElementById("profile-username")
    usernameEl.value = user.username

    // Connect the websocket
    socket.connect()
}