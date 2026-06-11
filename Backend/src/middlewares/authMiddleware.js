import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { AuthError } from "../errors/AuthError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";

const protect = async (req, res, next) => {
  // Tokens must travel in the Authorization header only.
  // Query-string tokens leak into server logs and browser history.
  const header = req.headers.authorization;
  const token  = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) {
    return next(new AuthError("No token provided. Please log in.", "TOKEN_MISSING"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Reject purpose-scoped tokens (e.g. password-reset) — they must not
    // be usable as general authentication tokens.
    if (decoded.purpose) {
      return next(new AuthError("Invalid token type.", "TOKEN_INVALID"));
    }

    req.user = await User.findById(decoded.userId).select("-password");
    if (!req.user) {
      return next(new AuthError("Account no longer exists.", "TOKEN_INVALID"));
    }

    next();
  } catch (err) {
    // JsonWebTokenError and TokenExpiredError bubble up to the global errorHandler.
    next(err);
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new ForbiddenError("Admin access required."));
  }
  next();
};

// Blocks pending/rejected users from protected resources.
// Admins bypass the status check so they are never accidentally locked out.
export const isApproved = (req, res, next) => {
  if (req.user.role === "admin" || req.user.status === "approved") {
    return next();
  }
  return next(new ForbiddenError("Your account is pending approval. Please wait for admin review."));
};

export default protect;
