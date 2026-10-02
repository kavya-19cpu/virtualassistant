
import express from "express";
import {
    Login,
    logOut,
    signUp,
    changePassword
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", Login);
authRouter.post("/logout", logOut);
authRouter.post("/change-password", changePassword);

export default authRouter;