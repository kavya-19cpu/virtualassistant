import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"

dotenv.config()

const app = express()

// ===============================
// CORS
// ===============================
app.use(cors({
    origin: "https://virtualassistant-461g.onrender.com",
    credentials: true
}))

const port = process.env.PORT || 6001

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json())
app.use(cookieParser())

// ===============================
// ROUTES
// ===============================
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)

// ===============================
// MONGODB
// ===============================
mongoose.connect("mongodb://127.0.0.1:27017/virtualAssistant")
    .then(() => {
        console.log("MongoDB connected")
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error)
    })

// ===============================
// SERVER
// ===============================
app.listen(port, () => {
    console.log(`server started on ${port}`)
})