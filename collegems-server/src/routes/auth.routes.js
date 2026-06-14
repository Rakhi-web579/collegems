import express from "express";
import { register, login, refresh, logout } from "../controllers/auth.controller.js";
import { validateRegister } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
