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
  analyzePdf
} from "../controllers/user.controllers.js";

import isAuth from "../middlewares/isAuth.js";

const userRouter = express.Router();

/*
=====================================================
ASSISTANT IMAGE UPLOAD
=====================================================
*/

const assistantUpload = multer({
  dest: "uploads/"
});

/*
=====================================================
IMAGE + PDF ANALYSIS UPLOAD
=====================================================
*/

const documentUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 20 * 1024 * 1024
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {
    const isImage =
      file.mimetype.startsWith("image/");

    const isPdf =
      file.mimetype === "application/pdf";

    if (isImage || isPdf) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image and PDF files are allowed"
        )
      );
    }
  }
});

/*
=====================================================
CURRENT USER
=====================================================
*/

userRouter.get(
  "/current",
  isAuth,
  getCurrentUser
);

/*
=====================================================
NORMAL AI QUESTION
=====================================================
*/

userRouter.post(
  "/asktoassistant",
  isAuth,
  askToAssistant
);

/*
=====================================================
IMAGE ANALYSIS
=====================================================
*/

userRouter.post(
  "/analyze-image",
  isAuth,
  documentUpload.single("image"),
  analyzeImage
);

/*
=====================================================
PDF ANALYSIS
=====================================================
*/

userRouter.post(
  "/analyze-pdf",
  isAuth,
  documentUpload.single("pdf"),
  analyzePdf
);

/*
=====================================================
SAVE HISTORY
=====================================================
*/

userRouter.post(
  "/savehistory",
  isAuth,
  saveHistory
);

/*
=====================================================
DELETE ONE HISTORY ITEM
=====================================================
*/

userRouter.delete(
  "/history/:historyId",
  isAuth,
  deleteHistory
);

/*
=====================================================
CLEAR ALL HISTORY
=====================================================
*/

userRouter.delete(
  "/history",
  isAuth,
  clearHistory
);

/*
=====================================================
UPDATE ASSISTANT
=====================================================
*/

userRouter.put(
  "/updateassistant",
  isAuth,
  assistantUpload.single("assistantImage"),
  updateAssistant
);

export default userRouter;