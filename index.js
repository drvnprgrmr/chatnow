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
io.on("connection", socket => {
    console.log("Client connected: ", socket.id)
    // Tell everyone else about user
    socket.on("user", (data) => {
        socket.broadcast.emit("user")
    })

    socket.on("disconnect", reason => {
        console.log("Client disconnected: ", socket.id, `(${reason})`)
    })

    socket.on("message:post", (data) => {
        socket.broadcast.emit("message:get", data)
    })
    

})


// Express routes
app.get("/", (req, res) => {
    res.render("index")
})







httpServer.listen(port, () => {
    console.log("Server is running on http://localhost:" + port)
})