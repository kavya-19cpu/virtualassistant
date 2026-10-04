
import express from "express";
import multer from "multer";

import {
  getCurrentUser,
  updateAssistant,
  askToAssistant,
  saveHistory,
  deleteHistory,
  clearHistory,
  analyzeImage,
  analyzePdf,
  analyzeDocument,
} from "../controllers/user.controllers.js";

import isAuth from "../middlewares/isAuth.js";

const userRouter = express.Router();

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/json",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(
        new Error("Unsupported file type.")
      );
    }

    callback(null, true);
  },
});

userRouter.get(
  "/current",
  isAuth,
  getCurrentUser
);

userRouter.put(
  "/update-assistant",
  isAuth,
  updateAssistant
);

userRouter.post(
  "/ask",
  isAuth,
  askToAssistant
);

userRouter.post(
  "/save-history",
  isAuth,
  saveHistory
);

userRouter.delete(
  "/delete-history/:historyId",
  isAuth,
  deleteHistory
);

userRouter.delete(
  "/clear-history",
  isAuth,
  clearHistory
);

userRouter.post(
  "/analyze-image",
  isAuth,
  upload.single("file"),
  analyzeImage
);

userRouter.post(
  "/analyze-pdf",
  isAuth,
  upload.single("pdf"),
  analyzePdf
);

userRouter.post(
  "/analyze-document",
  isAuth,
  upload.single("file"),
  analyzeDocument
);

// Handle Multer validation and size errors.
userRouter.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "File must be 50 MB or smaller."
          : err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      message: err.message || "Upload failed.",
    });
  }

  next();
});

export default userRouter;