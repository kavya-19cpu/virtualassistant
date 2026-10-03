import express from "express";
import multer from "multer";

import {
    getCurrentUser,
    updateAssistant,
    askToAssistant,
    saveHistory
} from "../controllers/user.controllers.js";

import isAuth from "../middlewares/isAuth.js";

const userRouter = express.Router();

const upload = multer({
    dest: "uploads/"
});

userRouter.get(
    "/current",
    isAuth,
    getCurrentUser
);

userRouter.post(
    "/asktoassistant",
    isAuth,
    askToAssistant
);

userRouter.post(
    "/savehistory",
    isAuth,
    saveHistory
);

userRouter.put(
    "/updateassistant",
    isAuth,
    upload.single("assistantImage"),
    updateAssistant
);

export default userRouter;