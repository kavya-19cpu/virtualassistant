import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    command: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    assistantName: {
      type: String
    },
    assistantImage: {
      type: String
    },
    history: {
      type: [historySchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;