import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { createClass, getClasses, getClassById, updateClass, deleteClass } from "../controllers/class.controller.js";

const router = express.Router();
// Public route to view all classes (no auth)
router.get("/list", getClasses);

// All other class routes are admin-only
router.use(protectRoute, requireAdmin);

router.post("/", createClass);
router.get("/", getClasses);
router.get("/:id", getClassById);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;
