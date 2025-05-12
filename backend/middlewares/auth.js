import jwt from 'jsonwebtoken';
import User from '../model/User.js';

export const authenticate = (roles = []) => {
  return async (req, res, next) => {




    try {
        
      const token = req.header('Authorization')?.replace('Bearer ', '');
      console.log(token);
      
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (roles.length && !roles.includes(user.role)) {
        console.log("yes bro its working");
        
        return res.status(403).json({ message: 'Access denied' });
      }

      

      req.user = user;
      
      req.token = token;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token is not valid' });
      console.log("Token is not valid");
      
    }
  };
};