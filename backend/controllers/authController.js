import mongoose, { Types } from "mongoose";
import User from "../models/userModel.js";
import Directory from "../models/directoryModel.js";
import Session from "../models/sessionModel.js";
import { verifyIdToken } from "../services/googleAuthService.js";

const SESSION_EXPIRY_MS = 60 * 1000 * 60 * 24 * 7; // 7 days

export const loginWithGoogle = async (req, res, next) => {
  const { idToken } = req.body;
  const userData = await verifyIdToken(idToken);
  const { name, email, picture } = userData;
  const user = await User.findOne({ email }).select("-__v");

  if (user) {
    if (user.deleted) {
      return res.status(403).json({
        error: "Your account has been deleted. Contact app owner to recover.",
      });
    }

    // Enforce max 2 sessions — delete oldest if limit reached
    const sessionCount = await Session.countDocuments({ userId: user._id });
    if (sessionCount >= 2) {
      const oldest = await Session.findOne({ userId: user._id }).sort({ createdAt: 1 });
      if (oldest) await oldest.deleteOne();
    }

    if (!user.picture.includes("googleusercontent.com")) {
      user.picture = picture;
      await user.save();
    }

    const newSession = await Session.create({
      userId: user._id,
      rootDirId: user.rootDirId,
      expiresAt: new Date(Date.now() + SESSION_EXPIRY_MS),
    });

    res.cookie("sid", newSession._id.toString(), {
      httpOnly: true,
      signed: true,
      sameSite: "lax",
      maxAge: SESSION_EXPIRY_MS,
    });

    return res.json({ message: "logged in" });
  }

  // New user — create account and session in a transaction
  const mongooseSession = await mongoose.startSession();

  try {
    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    mongooseSession.startTransaction();

    await Directory.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session: mongooseSession }
    );

    await User.insertOne(
      {
        _id: userId,
        name,
        email,
        picture,
        rootDirId,
      },
      { session: mongooseSession }
    );

    await mongooseSession.commitTransaction();

    const newSession = await Session.create({
      userId,
      rootDirId,
      expiresAt: new Date(Date.now() + SESSION_EXPIRY_MS),
    });

    res.cookie("sid", newSession._id.toString(), {
      httpOnly: true,
      signed: true,
      sameSite: "lax",
      maxAge: SESSION_EXPIRY_MS,
    });

    res.status(201).json({ message: "account created and logged in" });
  } catch (err) {
    await mongooseSession.abortTransaction();
    next(err);
  } finally {
    mongooseSession.endSession();
  }
};