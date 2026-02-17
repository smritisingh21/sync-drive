import { model, Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    userId : {
        type : Schema.Types.ObjectId,
        requires:true,
    },
    createdAt:{
        type : Date,
        default : Date.now,
        required :"true",
        expires : 36000, 
    },
  },
  {
    strict : "throw"
  }
);

const Session = model("Session", sessionSchema );

export default Session;
