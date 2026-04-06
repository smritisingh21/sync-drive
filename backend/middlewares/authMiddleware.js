import User from "../models/UserSchema.js";
import redisClient from "../config/redis.js";

export default async function checkAuth(req, res, next) {
  const { sid } = req.signedCookies;

  if (!sid) {
    return res.status(401).json({ error: "Not logged in!" });
  }

  const sessionData = await redisClient.get(`session:${sid}`);

  if (!sessionData) {
    res.clearCookie("sid", {
      httpOnly: true,
      signed: true
    });
    return res.status(401).json({ error: "Session invalidated. Please login again." });
  }

  const session = JSON.parse(sessionData); 
  
  const user = await User.findById(session.userId);

  req.user = {
    id : session.userId ,
    rootDirId : session.rootDirId,
    role: user?.role || 'User'
  };
  
  next();
}



export const checkRegularUser = (req, res, next ) =>{
  if (req.user.role !== "User" ) return next();
  console.log("Only admins and managers can access users");
  res.status(403).json({ err: "Only admins and managers can access users" });
};

export const checkAdmin = (req, res, next) => {
  if (req.user.role === "Admin") return next();
  console.log("Only admins can perform this action");
  res.status(403).json({ err: "Only admins can perform this action" });
};