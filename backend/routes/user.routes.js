import express from "express";

import {
  getCurrentUser,
  updateAssistant,
  askToAssistant,
  saveHistory
} from "../controllers/user.controllers.js";

import isAuth from "../middlewares/isAuth.js";

const userRouter = express.Router();

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
  updateAssistant
);

export default userRouter;