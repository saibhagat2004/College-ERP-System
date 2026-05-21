import express from "express"
import { protectRoute, requireAdmin } from "../middleware/protectRoute.js";
import { createUser, createAdmin, updateUser, updateUserRole, deleteUser } from "../controllers/users.controller.js";


const router = express.Router();
router.post("/create", protectRoute, requireAdmin, createUser);
router.post("/create-admin", protectRoute, requireAdmin, createAdmin);
router.post("/update", protectRoute, updateUser);
router.post("/update-role", protectRoute, requireAdmin, updateUserRole)
router.delete("/:id", protectRoute, requireAdmin, deleteUser);

export default router;