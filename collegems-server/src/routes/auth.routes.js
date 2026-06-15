import express from "express";
import { register, login, refresh } from "../controllers/auth.controller.js";
import { validateRegister } from "../middlewares/validation.middleware.js";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/register", registerLimiter, validateRegister, register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);

export default router;