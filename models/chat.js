const { Schema, model } = require("mongoose")

const accountRef = {
    type: Schema.Types.ObjectId,
    ref: "Account"
}

// Model messages
const messageSchema = new Schema({
    from: accountRef,
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

// Model group chats
const gChatSchema = new Schema({
    name: {
        type: String,
        required: true,
        default: "Group Chat"
    },
    createdBy: accountRef,
    accounts: [accountRef],
    messages: [messageSchema]
})

// Model private chats
const pChatSchema = new Schema({
    account: accountRef,
    messages: [messageSchema],
})

// Chats for registered accounts
const chatSchema = new Schema({
    account: accountRef,
    privateChats: [pChatSchema],
    groupChats: [gChatSchema]
})


const Chat = model("Chat", chatSchema)

module.exports = Chat