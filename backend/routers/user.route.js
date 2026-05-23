import express from "express"
import { protectRoute } from "../middleware/protectRoute.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { createUser, createAdmin, updateUser, updateUserRole, deleteUser, getTeachers, getStudents } from "../controllers/users.controller.js";

const router = express.Router();
router.post("/create", protectRoute, requireAdmin, createUser);
router.post("/create-admin", protectRoute, requireAdmin, createAdmin);
router.post("/update", protectRoute, updateUser);
router.post("/update-role", protectRoute, requireAdmin, updateUserRole)
router.delete("/:id", protectRoute, requireAdmin, deleteUser);
router.get("/teachers", protectRoute, requireAdmin, getTeachers);
router.get("/students", protectRoute, requireAdmin, getStudents);

export default router;