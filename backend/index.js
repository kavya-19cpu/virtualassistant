import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import dns from "dns"

dns.setDefaultResultOrder("ipv4first")
dotenv.config()

const app=express()

app.use(cors({
    origin:"https://virtualassistant-frontend-pebc.onrender.com",
    credentials:true
}))

const port=process.env.PORT||6001

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)

mongoose.connect(process.env.MONGODB_URL,{
    family:4
})
.then(()=>{
    console.log("MongoDB connected")
})
.catch((error)=>{
    console.log("MongoDB connection error:",error)
})

app.listen(port,()=>{
    console.log(`server started on ${port}`)
})