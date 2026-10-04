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
    },

    type: {
      type: String,
      enum: ["text", "voice", "image"],
      default: "text"
    },

    // Saved compressed image for image-analysis history
    image: {
      type: String,
      default: ""
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
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    assistantName: {
      type: String,
      trim: true
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