import Directory from "../models/directoryModel.js";
import User from "../models/userModel.js";
import mongoose, { Types } from "mongoose";
import Session from "../models/sessionModel.js";
import crypto from "crypto";
// import OTP from "../models/otpModel.js";
import redisClient from "../config/redis.js";
import { z } from "zod/v4";
import { loginSchema, registerSchema } from "../validators/authSchema.js";

export const register = async (req, res, next) => {
  const { success, data, error } = registerSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({ error: z.flattenError(error).fieldErrors });
  }

  const { name, email, password} = data;
  // console.log(otp);
  // const otpRecord = await OTP.findOne({ email, otp });
  // if (!otpRecord) {
  //   return res.status(400).json({ error: "Invalid or Expired OTP!" });
  // }
  // await otpRecord.deleteOne();

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

    session.commitTransaction();

    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    session.abortTransaction();
    console.log(err);
    if (err.code === 121) {
      res
        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
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
  }
};

export const login = async (req, res, next) => {
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

  // collect existing sessions for this user via simple JSON queries
  const keys = await redisClient.keys("session:*");
  const userSessions = [];
  for (const key of keys) {
    const s = await redisClient.json.get(key, "$");
    const sessionObj = Array.isArray(s) ? s[0] : s;
    if (sessionObj && sessionObj.userId === user._id.toString()) {
      userSessions.push({ key });
    }
  }

  if (userSessions.length >= 2) {
    await redisClient.del(userSessions[0].key);
  }

  // create Mongo session record for server-side checks
  await Session.create({ userId: user._id });

  const sessionId = crypto.randomUUID();
  const redisKey = `session:${sessionId}`;
  await redisClient.json.set(redisKey, "$", {
    userId: user._id.toString(),
    rootDirId: user.rootDirId.toString(),
  });

  const sessionExpiryTime = 60 * 1000 * 60 * 24 * 7;
  await redisClient.expire(redisKey, sessionExpiryTime / 1000);

  res.cookie("sid", sessionId, {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    maxAge: sessionExpiryTime,
  });
  res.json({ message: "logged in" });
};

export const getAllUsers = async (req, res) => {
  const allUsers = await User.find({ deleted: false }).lean();
  const allSessions = await Session.find().lean();
  const allSessionsUserId = allSessions.map(({ userId }) => userId.toString());
  const allSessionsUserIdSet = new Set(allSessionsUserId);

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
  const session = await redisClient.json.get(`session:${sid}`);
  await redisClient.del(`session:${sid}`);
  // clean up mongo sessions for this user
  if (session && session.userId) {
    await Session.deleteMany({ userId: session.userId });
  }
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

export const logoutAll = async (req, res) => {
  const { sid } = req.signedCookies;
  const session = await redisClient.json.get(`session:${sid}`);
  // find all redis sessions for this user and delete them
  const keys = await redisClient.keys("session:*");
  const userSessions = [];
  for (const key of keys) {
    const s = await redisClient.json.get(key, "$");
    const sessionObj = Array.isArray(s) ? s[0] : s;
    if (sessionObj && sessionObj.userId === session.userId) {
      userSessions.push(key);
    }
  }
  if (userSessions.length) {
    await redisClient.del(userSessions);
  }
  // remove mongo session records for this user
  if (session && session.userId) {
    await Session.deleteMany({ userId: session.userId });
  }
  res.status(204).end();
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