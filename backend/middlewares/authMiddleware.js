import { ObjectId } from "mongodb";
import User from "../models/UserSchema.js";
import Session from "../models/sessionModel.js";

export default async function checkAuth(req, res, next) {
  const { sid } = req.signedCookies;
  
  if (!sid) {
    return res.status(401).json({ error: "Not logged in!" });
  }

  const session = await Session.findById(sid);
  if (!session) {
    res.clearCookie("sid")
    return res.status(401).json({ error: "Not logged in!" });
  }

  const user = await User.findOne({ _id: session.userId }).lean();
  if (!user) {
    return res.status(401).json({ error: "Not logged!" });
  }
  req.user = user;
  next();
}


