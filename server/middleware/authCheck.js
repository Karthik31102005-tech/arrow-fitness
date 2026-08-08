const jwt = require('jsonwebtoken');

function authCheck(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided. Access denied.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded; // attach admin info to the request for later use
        next(); // token valid, allow the request to continue
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token. Access denied.' });
    }
}

module.exports = authCheck;