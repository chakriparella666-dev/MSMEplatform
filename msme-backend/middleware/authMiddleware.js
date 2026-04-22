const jwt  = require('jsonwebtoken')
const User = require('../models/User')

exports.verifyToken = async (req, res, next) => {
  try {
    const cookieToken = req.cookies.token;
    const headerToken = req.headers.authorization?.split(' ')[1];
    const token = cookieToken || headerToken;
    
    console.log('🔑 Auth Probe:', { 
      fromCookie: !!cookieToken, 
      fromHeader: !!headerToken,
      authHeader: req.headers.authorization ? 'present' : 'missing'
    });

    if (!token) {
      console.log('❌ Auth rejected: No token found');
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      console.log('✅ OK: Token valid for User', decoded.id);
      
      // optimization: Trust the JWT, don't do a DB lookup here on every request
      req.user = { id: decoded.id };
      next();
    } catch (error) {
      console.log('❌ Auth rejected: Token invalid/expired');
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (globalErr) {
    console.log('❌ Auth error:', globalErr.message);
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
}
