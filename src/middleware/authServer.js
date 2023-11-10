import '../database/mongoose.js'
import express from "express";
import jsonwebtoken  from "jsonwebtoken";
import verifyToken from "./auth.js";
import users from "../models/user.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.AUTHPORT || 5000;
const jwt = jsonwebtoken;

app.use(express.json());

async function getAllUsers() {
    const allUsers = await users.find({});
    return allUsers;
}

async function updateRefreshToken(username, refreshToken){
    const listUser = await getAllUsers()
    listUser.map((user) => {
        if(user.username === username){
            user.refreshTokens = refreshToken;
            user.save();
        }
    });
}
async function isUsernameTaken(username) {
    const user = await users.findOne({ username: username });
    return user !== null;
  }

app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    async function createUser() {
        const isTaken = await isUsernameTaken(username);
        const hashedPassword = await bcrypt.hash(password, 10);
        if (isTaken) {
          return res.status(409).send({ message: "Username already taken" });
        }
        else {
            const user = new users({username, password: hashedPassword, refreshTokens: null});
            user.save().then(() => {
                res.status(201).send({ message: "User created" });
            }).catch((err) => {
                console.log(err);
                res.status(500).send({ message: "Internal server error" });
            });
        }
    }
    createUser();
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    async function loginUser() {
        const exist = await isUsernameTaken(username);
        if(exist){
            const user = await users.findOne({ username: username });
            const match = await bcrypt.compare(password, user.password);
            if(match){
                const {id, thisUsername} = user;
                const accessToken = jwt.sign({id, thisUsername}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });
            
                const refreshToken = jwt.sign({id, thisUsername}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1h" });
            
                await updateRefreshToken(username, refreshToken);
                res.json({ accessToken, refreshToken });
            }
        }
    }
    loginUser();
});

app.post("/token", (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) return res.sendStatus(401);
    async function findUser(){
        const user = await users.findOne({ refreshTokens: refreshToken })
        if(!user) return res.status(403).send("Refresh token not found");

        try {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const accessToken = jwt.sign({id: user.id, username: user.username}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "20s" });
            updateRefreshToken(user.username, refreshToken);
            res.json({ accessToken, refreshToken });
        } catch (error) {
        console.log(error);
        return res.sendStatus(403);
        }
    }
    findUser();
});

app.delete("/logout",verifyToken, (req, res) => {
    async function logOutUser(){
        const user = await users.findOne({_id: req.userId});
        updateRefreshToken(user.username, null);
        console.log(user);
        res.status(204).send('Logout successful');
    }
    logOutUser();
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});