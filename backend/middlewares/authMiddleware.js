import { ObjectId } from "mongodb";
import User from "../models/UserSchema.js";
import Session from "../models/sessionModel.js";
import redisClient from "../config/redis.js";

export default async function checkAuth(req, res, next) {
  const { sid } = req.signedCookies;
  console.log("sid:", sid);

  if (!sid) {
    return res.status(401).json({ error: "Not logged in!" });
  }

  const sessionData = await redisClient.get(`session:${sid}`);
  console.log("Session found", sessionData);

  if (!sessionData) {
    res.clearCookie("sid", {
      httpOnly: true,
      signed: true
    });
    return res.status(401).json({ error: "Session invalidated. Please login again." });
  }

  const session = JSON.parse(sessionData);   // ← important
  
  req.user = {id : session.userId , rootDirId : session.rootDirId};
  next();
}

