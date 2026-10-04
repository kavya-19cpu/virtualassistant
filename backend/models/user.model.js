
import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    command: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "voice", "image", "pdf", "document"],
      default: "text",
    },

    // Public or authenticated storage URL.
    fileUrl: {
      type: String,
      default: "",
    },

    fileName: {
      type: String,
      default: "",
    },

    fileMimeType: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    assistantName: {
      type: String,
      default: "Assistant",
    },

    assistantImage: {
      type: String,
      default: "",
    },

    history: {
      type: [historySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;