import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protect = async (req, res, next) => {
  let token;

  // Check for token in either Authorization header or query parameters
  token = req.headers.authorization?.startsWith("Bearer")
    ? req.headers.authorization.split(" ")[1]
    : req.query.token;

  if (!token) {
    console.log('🔒 [AUTH] No token provided');
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");
    
    if (!req.user) {
      console.log('🔒 [AUTH] User not found for token');
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    console.log(`🔒 [AUTH] Authenticated user: ${req.user._id}`);
    next();
  } catch (error) {
    console.error('🔒 [AUTH ERROR]', error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default protect;




/*// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export default protect;
*/