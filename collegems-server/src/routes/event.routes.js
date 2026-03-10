import express from "express";
import {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} from "../controllers/events.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";


const router = express.Router();

// PUBLIC ROUTES
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// ADMIN ROUTES
router.post("/create", protect, allowRoles('hod', 'teacher'), createEvent);
router.put("/:id", protect, allowRoles('hod', 'teacher'), updateEvent);
router.delete("/:id", protect, allowRoles('hod', 'teacher'), deleteEvent);

export default router;