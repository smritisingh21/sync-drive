import Directory from "../models/directorySchema.js";
import User from "../models/UserSchema.js";
import mongoose, { Types } from "mongoose";
import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import Session from "../models/sessionModel.js";


export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  const foundUser = await User.findOne({ email }).lean();

  const hashedPwd =await bcrypt.hash(password , 10);

  if (foundUser) {
    return res.status(409).json({
      error: "User already exists",
      message:
        "A user with this email address already exists. Please try logging in or use a different email.",
    });
  }
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
        password : hashedPwd,
        rootDirId,
      },
      { session }
    );

    session.commitTransaction();

    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    session.abortTransaction();
    if (err.code === 121) {
      res
        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
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

  const isPwdValid = bcrypt.compare(password , user.password)
  if(!isPwdValid ) {
    return res.status(404).json({error : "Invalid credentials"})
  }
  const session = await Session.create({userId : user._id})
  const allSessions = await Session.find({userId : user._id})
  if(allSessions > 3){
    await allSessions[0].deleteOne();
  }
 
  const cookiePayload = JSON.stringify({
    id : user._id,
    expiry: Math.round(Date.now()/1000 + 100000),
  })

  res.cookie("sid",session.id, {
    httpOnly: true,
    signed : true,
    maxAge: 60 * 1000 * 60 * 24 * 7,
  });
  res.json({ message: "logged in" });
};

export const getCurrentUser = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
};

export const logout = (req, res) => {
  res.clearCookie("sid");
  res.status(204).end();
};
