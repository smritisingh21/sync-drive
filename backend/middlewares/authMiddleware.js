import Session from "../models/sessionModel.js";

export default async function checkAuth(req, res, next) {
  const { sid } = req.signedCookies;

  if (!sid) {
    res.clearCookie("sid");
    return res.status(401).json({ error: "Not logged in!" });
  }

  const session = await Session.findById(sid).lean();

  if (!session) {
    res.clearCookie("sid");
    return res.status(401).json({ error: "Not logged in!" });
  }

  req.user = { _id: session.userId, rootDirId: session.rootDirId };
  next();
}

export const checkNotRegularUser = (req, res, next) => {
  if (req.user.role !== "User") return next();
  res.status(403).json({ error: "You can not access users" });
};

export const checkIsAdminUser = (req, res, next) => {
  if (req.user.role === "Admin") return next();
  res.status(403).json({ error: "You can not delete users" });
};