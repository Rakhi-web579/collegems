import express from "express";
import {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} from "../controllers/events.controller.js";


const router = express.Router();

// PUBLIC ROUTES
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// ADMIN ROUTES
router.post("/create", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;