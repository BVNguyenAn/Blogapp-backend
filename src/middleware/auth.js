import jsonwebtoken from 'jsonwebtoken';

const jwt = jsonwebtoken;

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if(!token) return res.status(401).json({ message: 'unauthorize' })


    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log(decoded);
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.log(error);
        return res.status(403).json({ message: 'token invalid' })
    }

}
export default verifyToken;