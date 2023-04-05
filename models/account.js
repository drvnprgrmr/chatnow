const { Schema, model } = require("mongoose")
const bcrypt = require("bcrypt")

const accountSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    associates: [{ type: Schema.Types.ObjectId, ref: "Account" }],
    sessionId: {
        type: String,
        required: true
    }

})

accountSchema.pre("save", async function (next) {
    // Hash the password
    this.password = await bcrypt.hash(this.password, 10)

    // Hash the session id
    this.sessionId = await bcrypt.hash(this.sessionId, 10)

    next()
})

accountSchema.method("validatePassword", async function (password) {
    // Compare to check if the password is valid
    return await bcrypt.compare(password, this.password)
})

accountSchema.method("validateSession", async function (sessionId) {
    // Compare to check if the session id is valid
    return await bcrypt.compare(sessionId, this.sessionId)
})

const Account = model("Account", accountSchema)

module.exports = Account