const jwt = require('jsonwebtoken');

module.exports.checkAuthAdmin = (req, res, next ) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token,process.env.JWT_ADMIN_PASS_KEY);
        req.userData = decoded;
        next();
    }
    catch ( error ){
        return res.status(401).json({
            message : "Auth Failed!"
        });
    }
}

module.exports.checkSignupToken = (req, res, next ) => {
    const token = req.headers.authorization;
    if(token == process.env.JWT_ADMIN_PASS_KEY){
        next();
    }

    return res.status(401).json({
        message : "Auth Failed!"
    });
}

