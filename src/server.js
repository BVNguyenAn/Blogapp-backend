import express from "express";
import jsonwebtoken  from "jsonwebtoken";
import dotenv from "dotenv";
import verifyToken from "./middleware/auth.js";
dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 5000;
const jwt = jsonwebtoken;

app.use(express.json());

app.get("/api",verifyToken, (req, res) => {
    res.json(posts.filter(post => post.userId === req.userId));
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});