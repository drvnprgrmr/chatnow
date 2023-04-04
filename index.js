const http = require("http")
const express = require("express")
const { Server } = require("socket.io")


const connectDB = require("./connect-db")
const Account = require("./models/account")
const Chat = require("./models/chat")

const port = process.env.PORT || 3000

const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer)


app.set("view engine", "ejs")
app.set("views", "views")
app.use(express.static("public"))
app.use(express.urlencoded({ extended: false }))

// Socket.io 
io.on("connection", async (socket) => {
    console.log("Client connected: ", socket.id)

    const sockets = await io.fetchSockets()
    // Tell new user about previously existing users
    if (sockets.length > 1) {
        socket.emit("user:dump", sockets.map(s => {
            return {id: s.id, username: s.username}
        }))
    }



    // Tell everyone else about new user
    socket.on("user:enter", (data) => {
        console.log(data) 
        socket.username = data.username
        socket.broadcast.emit("user:enter", data)
    })

    socket.on("disconnect", reason => {
        console.log("Client disconnected: ", socket.id, `(${reason})`)
        socket.broadcast.emit("user:leave", socket.id)
    })

    socket.on("groupMsg:post", (msg) => {
        socket.broadcast.emit("groupMsg:get", msg)
    })

    socket.on("privMsg:post", (id, msg) => {
        // Send message to user with id
        socket.to(id).emit("privMsg:get", msg)
    })
    

})


// Express routes
app.get("/", (req, res) => { res.render("index") })

app.post("/signup", async (req, res) => {
    const { username, password } = req.body

    // Create an account for the user
    const account = await Account.create({ username, password })

    // Create a new chat and associate it with the account
    const chat = await Chat.create({ account: account.id })

    res.json({
        id: account.id,
        username
    })
    
})

app.post("/signup-temp", async (req, res) => {
    const { username, expires } = req.body

})

app.post("/signin", async (req, res) => {
    const { username, password } = req.body

    // Locate the account of the user
    const account = await Account.findOne({ username })

    if (!account) {
        return res.status(404).send("Sorry, that account does not exist")
    }

    else if (! await account.validatePassword(password)) {
        return res.status(401).send("Invalid password")
    }
    

    res.json({
        id: account.id,
        username
    })
})


httpServer.listen(port, () => {
    console.log("Server is running on http://localhost:" + port)

    // Connect to the database
    connectDB()
})