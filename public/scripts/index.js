const toggle = document.getElementById("toggle")

const toggleSignin = document.getElementById("toggle-signin")
const toggleSignup = document.getElementById("toggle-signup")

const authSignin = document.getElementById("auth-signin")
const authSignup = document.getElementById("auth-signup")


toggle.addEventListener("click", ev => {
    const el = ev.target

    if (el.classList.contains("selected")) return

    if (el.id == "toggle-signin") {
        // Select signup toggle and display it
        toggleSignup.classList.toggle("selected")
        authSignup.classList.toggle("hidden")
        
        // Hide signin toggle
        toggleSignin.classList.toggle("selected")
        authSignin.classList.toggle("hidden")


    } else if (el.id == "toggle-signup") {
        // Select signin toggle and display it
        toggleSignin.classList.toggle("selected")
        authSignin.classList.toggle("hidden")

        // Hide signup 
        toggleSignup.classList.toggle("selected")
        authSignup.classList.toggle("hidden")

    }
})
