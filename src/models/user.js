import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 4
    },
    password: {
        type: String,
        required: true,
    },
    refreshTokens: {
        type: String,
        required: false
    }
});

const users = mongoose.model("user", userSchema);
export default users;