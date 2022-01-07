const jwt = require('jsonwebtoken');
//Save it as a Environment Variable or in a config file
const JWT_SECRET = "skyrunner@360";
const fetchuser = (req,res,next)=>{
    // Get the user from the jwt token and add id to req object
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: "Please authenticate using a valid token"})
    }
    try {        
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next()
    } catch (error) {
        res.status(401).send({error: "Please authenticate using a valid token"})
    }
}

module.exports = fetchuser;