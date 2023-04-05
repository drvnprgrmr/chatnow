const http = require("http")
const express = require("express")
const { Server } = require("socket.io")
const { v4: uuidv4 } = require('uuid');

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
app.use(express.json())


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
    socket.on("user:enter", (user) => {
        console.log(user) 
        socket.userId = user.id
        socket.username = user.username
        socket.broadcast.emit("user:enter", user)
    })

    socket.on("disconnect", reason => {
        console.log("Client disconnected: ", socket.id, `(${reason})`)
        socket.broadcast.emit("user:leave", socket.userId)
    })

    socket.on("groupMsg:post", (msg) => {
        socket.broadcast.emit("groupMsg:get", msg)
    })

    socket.on("privMsg:post", (id, msg) => {
        // Send message to user with id
        socket.to(id).emit("privMsg:get", socket.id, msg)
        console.log(msg, id)
    })
    

})


// Express routes
app.get("/", (req, res) => { res.render("index") })

app.post("/signup", async (req, res) => {
    const { username, password } = req.body

    const sessionId = uuidv4()
    // Create an account for the user
    const account = await Account.create({ username, password, sessionId })

    // Create a new chat and associate it with the account
    await Chat.create({ account: account.id })

    res.json({
        id: account.id,
        username,
        sessionId
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
    
    const sessionId = uuidv4()
    account.sessionId = sessionId
    await account.save() 

    res.json({
        id: account.id,
        username,
        sessionId
    })
})

app.post("/confirm-session", async (req, res) => {
    const {id, sessionId} = req.body

    
    const account = await Account.findById(id)

    if (!account) return res.status(404).end()

    if (! await account.validateSession(sessionId)) return res.status(401).end()

    return res.json({
        id: account.id,
        username: account.username,
        sessionId
    })
})

httpServer.listen(port, () => {
    console.log("Server is running on http://localhost:" + port)

    // Connect to the database
    connectDB()
})