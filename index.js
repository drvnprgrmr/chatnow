const http = require("http")
const express = require("express")
const { Server } = require("socket.io")

const port = process.env.PORT || 3000

const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer)


app.set("view engine", "ejs")
app.set("views", "views")
app.use(express.static("public"))

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
app.get("/", (req, res) => {
    res.render("index")
})



httpServer.listen(port, () => {
    console.log("Server is running on http://localhost:" + port)
})