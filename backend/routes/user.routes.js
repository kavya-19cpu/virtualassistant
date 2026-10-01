import express from "express";

import {
    getCurrentUser,
    updateAssistant,
    askToAssistant
} from "../controllers/user.controllers.js";

import isAuth from "../middlewares/isAuth.js";

import upload from "../middlewares/multer.js";

const router = express.Router();


// ==========================================
// GET CURRENT USER
// ==========================================

router.get(
    "/current",
    isAuth,
    getCurrentUser
);


// ==========================================
// ASK ASSISTANT
// ==========================================

router.post(
    "/asktoassistant",
    isAuth,
    askToAssistant
);


// ==========================================
// UPDATE ASSISTANT
// ==========================================

router.put(
    "/update",
    isAuth,
    upload.single("assistantImage"),
    updateAssistant
);


export default router;