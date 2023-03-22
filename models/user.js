const { Schema, model } = require("mongoose")
const bcrypt = require("bcrypt")


const userRef = {
    type: Schema.Types.ObjectId,
    ref: "User"
}

const messageSchema = new Schema({
    from: userRef,
    msg: {
        type: String,
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
})

const gChatSchema = new Schema({
    name: {
        type: String,
        required: true,
        default: "Group Chat"
    },
    users: [userRef], 
    messages: [messageSchema]
})

const pChatSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    messages: [messageSchema],
    
}, { timestamps: true })

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    privateChats: [pChatSchema],
    groupChats: [gChatSchema]
})

userSchema.pre("save", async function(next) {
    this.password = await bcrypt.hash(this.password, 10)

    next()
})

userSchema.method("validatePassword", async function(password) {
    return await bcrypt.compare(password, this.password)
})

const User = model("User", userSchema)

module.exports = User