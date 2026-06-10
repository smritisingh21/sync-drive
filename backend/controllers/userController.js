import Directory from "../models/directoryModel.js";
import User from "../models/userModel.js";
import mongoose, { Types } from "mongoose";
import Session from "../models/sessionModel.js";
import { z } from "zod/v4";
import { loginSchema, registerSchema } from "../validators/authSchema.js";

export const register = async (req, res, next) => {
  const { success, data, error } = registerSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({ error: z.flattenError(error).fieldErrors });
  }

  const { name, email, password } = data;
  console.log(data);

  const session = await mongoose.startSession();

  try {
    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    session.startTransaction();

    await Directory.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session }
    );

    await User.insertOne(
      {
        _id: userId,
        name,
        email,
        password,
        rootDirId,
      },
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    await session.abortTransaction();
    console.log(err);
    if (err.code === 121) {
      res.status(400).json({ error: "Invalid input, please enter valid details" });
    } else if (err.code === 11000) {
      if (err.keyValue.email) {
        return res.status(409).json({
          error: "This email already exists",
          message:
            "A user with this email address already exists. Please try logging in or use a different email.",
        });
      }
    } else {
      next(err);
    }
  } finally {
    session.endSession();
  }
};

export const login = async (req, res, next) => {
  try {
    const { success, data } = loginSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const { email, password } = data;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Invalid Credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(404).json({ error: "Invalid Credentials" });
    }

    // Enforce max 2 sessions per user — delete oldest if limit reached
    const sessionCount = await Session.countDocuments({ userId: user._id });
    if (sessionCount >= 2) {
      const oldest = await Session.findOne({ userId: user._id }).sort({ createdAt: 1 });
      if (oldest) await oldest.deleteOne();
    }

    const sessionExpiryMs = 60 * 1000 * 60 * 24 * 7; // 7 days
    const expiresAt = new Date(Date.now() + sessionExpiryMs);

    const newSession = await Session.create({
      userId: user._id,
      rootDirId: user.rootDirId,
      expiresAt,
    });

    res.cookie("sid", newSession._id.toString(), {
      httpOnly: true,
      signed: true,
      sameSite: "lax",
      maxAge: sessionExpiryMs,
    });

    res.json({ message: "logged in" });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res) => {
  const allUsers = await User.find({ deleted: false }).lean();
  const allSessions = await Session.find().lean();
  const allSessionsUserIdSet = new Set(
    allSessions.map(({ userId }) => userId.toString())
  );

  const transformedUsers = allUsers.map(({ _id, name, email }) => ({
    id: _id,
    name,
    email,
    isLoggedIn: allSessionsUserIdSet.has(_id.toString()),
  }));

  res.status(200).json(transformedUsers);
};

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  const rootDir = await Directory.findById(user.rootDirId).lean();
  res.status(200).json({
    name: user.name,
    email: user.email,
    picture: user.picture,
    role: user.role,
    maxStorageInBytes: user.maxStorageInBytes,
    usedStorageInBytes: rootDir.size,
  });
};

export const logout = async (req, res) => {
  const { sid } = req.signedCookies;
  await Session.findByIdAndDelete(sid);
  res.clearCookie("sid");
  res.status(204).end();
};

export const logoutById = async (req, res, next) => {
  try {
    await Session.deleteMany({ userId: req.params.userId });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    const { sid } = req.signedCookies;
    const session = await Session.findById(sid).lean();
    if (session) {
      await Session.deleteMany({ userId: session.userId });
    }
    res.clearCookie("sid");
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  if (req.user._id.toString() === userId) {
    return res.status(403).json({ error: "You can not delete yourself." });
  }
  try {
    await Session.deleteMany({ userId });
    await User.findByIdAndUpdate(userId, { deleted: true });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};