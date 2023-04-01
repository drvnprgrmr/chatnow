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
    }
})

accountSchema.pre("save", async function (next) {
    // Hash the password
    this.password = await bcrypt.hash(this.password, 10)

    next()
})

accountSchema.method("validatePassword", async function (password) {
    // Compare to check if the password is valid
    return await bcrypt.compare(password, this.password)
})

const Account = model("Account", accountSchema)

module.exports = Account