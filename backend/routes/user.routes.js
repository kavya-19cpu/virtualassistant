import express from "express";
import multer from "multer";

import {
  getCurrentUser,
  updateAssistant,
  askToAssistant,
  saveHistory,
  deleteHistory,
  clearHistory,
  analyzeImage
} from "../controllers/user.controllers.js";

import isAuth from "../middlewares/isAuth.js";


const userRouter =
  express.Router();


/*
=====================================================
ASSISTANT IMAGE UPLOAD
=====================================================
*/

const assistantUpload =
  multer({
    dest: "uploads/"
  });


/*
=====================================================
IMAGE ANALYSIS UPLOAD
=====================================================
*/

const imageUpload =
  multer({
    storage: multer.memoryStorage(),

    limits: {
      fileSize: 10 * 1024 * 1024
    },

    fileFilter: (
      req,
      file,
      cb
    ) => {
      if (
        file.mimetype.startsWith(
          "image/"
        )
      ) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Only image files are allowed"
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
  imageUpload.single("image"),
  analyzeImage
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
  assistantUpload.single(
    "assistantImage"
  ),
  updateAssistant
);


export default userRouter;