
import { model, Schema } from "mongoose";

const fileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
    },
  },
  {
    strict: "throw",
  }
);

const File = model("File", fileSchema);
export default File;
