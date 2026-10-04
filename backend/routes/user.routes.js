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
IMAGE ANALYSIS UPLOAD
=====================================================
*/

const imageUpload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        if (file.mimetype.startsWith("image/")) {
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
PDF ANALYSIS UPLOAD
=====================================================
*/

const pdfUpload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 20 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const isPdf =
            file.mimetype === "application/pdf" ||
            file.originalname
                ?.toLowerCase()
                .endsWith(".pdf");

        if (isPdf) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only PDF files are allowed"
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
PDF ANALYSIS
=====================================================
*/

userRouter.post(
    "/analyze-pdf",
    isAuth,
    pdfUpload.single("pdf"),
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