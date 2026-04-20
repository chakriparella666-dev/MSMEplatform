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
      
      try {
        req.user = await User.findById(decoded.id)
        if (!req.user) {
          console.log('❌ Auth rejected: User not in DB');
          return res.status(401).json({ success: false, message: 'User not found' });
        }
        next()
      } catch (dbErr) {
        console.log('🔥 DB FAIL:', dbErr.message);
        return res.status(503).json({ success: false, message: 'Database temporarily unavailable' });
      }
    } catch (jwtErr) {
      console.log('❌ Auth rejected: JWT error -', jwtErr.message);
      // Clear cookie if invalid to avoid loops
      res.clearCookie('token');
      res.status(401).json({ success: false, message: 'Token invalid or expired' });
    }
  } catch (globalErr) {
    console.log('❌ Auth error:', globalErr.message);
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
}
