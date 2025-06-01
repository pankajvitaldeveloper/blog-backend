const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.blogsapptcm;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user and attach to request
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }
}; 

// Authorize role middleware
// below code is used to authorize user role and check if user has the required role to access the route
const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions'
            });
        }

        next();
    };
};

module.exports = {
    verifyToken,
    authorizeRole
};