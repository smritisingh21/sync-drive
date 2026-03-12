import { verifyToken } from "../services/googleAuthService.js"
import mongoose, { Types } from "mongoose";
import Directory from "../models/directorySchema.js";
import User from "../models/UserSchema.js"
import Session from "../models/sessionModel.js"

export const loginWithGoogle = async (req, res, next) =>{
    const {idToken} = req.body
    const userData = await verifyToken(idToken);
    const {name , email, picture} = userData;
    const user = await User.findOne({ email }).select("-__v");

    if (user) {
    const allSessions = await Session.find({ userId: user.id });

    if (allSessions.length >= 2) {
      await allSessions[0].deleteOne();
    }

    if (!user.picture.includes("googleusercontent.com")) {
      user.picture = picture;
      await user.save();
    }

    const session = await Session.create({ userId: user._id });
    res.cookie("sid", session.id, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });

    return res.json({ message: "logged in" });
  }
    console.log("user does not exist");
    const mongooseSession = await mongoose.startSession();

    try {

    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    mongooseSession.startTransaction();

    await Directory.create(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session: mongooseSession }
    );

     await User.create([{
     _id: userId,
      name,
     email,
     rootDirId,
    }],
 { session: mongooseSession });

    const session = await Session.create({ userId: userId });

    res.cookie("sid", session.id, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });

    mongooseSession.commitTransaction();
    res.status(201).json({ message: "account created and logged in" });
  } catch (err) {
    mongooseSession.abortTransaction();
    next(err);
  }
};
