import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dns from "dns";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";

dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const app = express();

/*
=====================================================
CORS
=====================================================
*/

app.use(
  cors({
    origin:
      "https://virtualassistant-frontend-pebc.onrender.com",
    credentials: true
  })
);

/*
=====================================================
MIDDLEWARE
=====================================================
*/

app.use(
  express.json({
    limit: "10mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb"
  })
);

app.use(cookieParser());

/*
=====================================================
ROUTES
=====================================================
*/

app.use(
  "/api/auth",
  authRouter
);

app.use(
  "/api/user",
  userRouter
);

/*
=====================================================
HEALTH CHECK
=====================================================
*/

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Virtual Assistant Backend is running"
  });
});

/*
=====================================================
MONGODB
=====================================================
*/

const port = process.env.PORT || 6001;

mongoose
  .connect(process.env.MONGODB_URL, {
    family: 4
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error
    );
  });

/*
=====================================================
START SERVER
=====================================================
*/

app.listen(port, () => {
  console.log(
    `Server started on ${port}`
  );
});