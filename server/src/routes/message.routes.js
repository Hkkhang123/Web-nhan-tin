import express from "express"
import { protectRoutes } from "../middleware/auth.middleware.js"
import { getMessages, getUserForSideBar, sendMessages } from "../controller/message.controller.js"

const router = express.Router()

router.get("/user", protectRoutes, getUserForSideBar) 
router.get("/:id", protectRoutes, getMessages)

router.post("/send/:id", protectRoutes, sendMessages)

export default router