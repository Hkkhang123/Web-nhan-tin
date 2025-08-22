import express from "express";
import { checkAuth, login, logout, signup, updateProfile, verifyTwoFactorAuth, resendTwoFactorCode } from "../controller/auth.controller.js";
import { protectRoutes } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/dangky", signup );

router.post("/dangnhap", login);

router.post("/verify-2fa", verifyTwoFactorAuth);

router.post("/resend-2fa-code", resendTwoFactorCode);

router.post("/dangxuat", logout);

router.put("/update-profile", protectRoutes, updateProfile);

router.get("/check",protectRoutes, checkAuth);

export default router;