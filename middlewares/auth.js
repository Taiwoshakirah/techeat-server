const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/user');

const protect = async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    else if(req.cookies.token){
        token = req.cookies.token
    }
    if(!token){
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded);
        req.user = { id: decoded.userId };
        next();
    } catch(err) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if(!req.user || !req.user.role || !roles.includes(req.user.role)){
            return next(new ErrorResponse(`Not authorized to access this route`, 403));
        }
        next();
    }
}

module.exports = { protect, authorize };