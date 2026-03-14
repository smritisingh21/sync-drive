import Directory from "../models/directorySchema.js";
import User from "../models/UserSchema.js";
import mongoose, { Types } from "mongoose";
import Session from "../models/sessionModel.js";
import redisClient from "../config/redis.js"

export const register = async (req, res, next) => {
  const { name, email, password} = req.body;

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
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }

  // const allSessions = await Session.find({ userId: user.id });

  // if (allSessions.length >= 2) {
  //   await allSessions[0].deleteOne();
  // }

  // const session = await Session.create({ userId: user._id });
  // const session = await redisClient.get(`session:${sid}`)

  //creating session in redis
  const sessionId = crypto.randomUUID()
  const redisKey = `session:${sessionId}`
  
  await redisClient.set(redisKey, JSON.stringify({ 
    userId: user._id.toString(),
    rootDirId: user.rootDirId,
   })
);
  const sessionExpiry = 60*1000*60*24*7
  await redisClient.expire(redisKey, sessionExpiry /1000)

  res.cookie("sid", sessionId, {
    httpOnly: true,
    signed: true,
    maxAge: 60 * 1000 * 60 * 24 * 7,
  });
  res.json({ message: "logged in" });
};

export const getCurrentUser = (req, res) => {
  const user = User.findById(req.user._id).lean()
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
    picture: req.user.picture,
  });
};

export const logout = async (req, res) => {
  const { sid } = req.signedCookies;
  await redisClient.del(`session:${sid}`)
  res.clearCookie("sid");
  res.status(204).end();
};

export const logoutAllDevices = async (req, res) => {
  const { sid } = req.signedCookies;

  const sessionData = await redisClient.get(`session:${sid}`);
  const session = JSON.parse(sessionData);

  const keys = await redisClient.keys("session:*");

  for (const key of keys) {
    const data = await redisClient.get(key);
    const parsed = JSON.parse(data);

    if (parsed.userId === session.userId) {
      await redisClient.del(key);
    }
  }

  res.clearCookie("sid");
  res.status(204).end();
};



