import express from "express"
import authRoutes from "./src/routes/auth.routes.js"
import messageRoutes from "./src/routes/message.routes.js"
import dotenv from "dotenv"
import { connectDB } from "./src/lib/db.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import { app, server } from "./src/lib/socket.js"

import path from "path"

dotenv.config()


app.use(express.json({ limit: '500mb' }))
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
const port = process.env.PORT
const __dirname = path.resolve()


app.use("/api/auth", authRoutes)
app.use("/api/message", messageRoutes)

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../client", "dist", "index.html"))
    })
}

server.listen(port, () => {
    console.log(`server in running on ${port}`)
    connectDB()
})